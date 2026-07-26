#!/usr/bin/env python3
"""
actualizar.py - Paso 1 del pipeline de actualizacion (Ace Stats).

Baja los CSV frescos de TennisMyLife y VERIFICA que esten al dia antes de
dejarlos en datos-frescos/. No toca la base de datos ni jugadores.ts.

Uso:
    python3 scripts/actualizar.py                   # baja y verifica
    python3 scripts/actualizar.py --solo-verificar  # no baja, verifica lo que hay
    python3 scripts/actualizar.py --anios 2026      # solo un anio

Sale con codigo 1 si algun chequeo DURO falla. En ese caso el CSV viejo NO se
pisa: la descarga queda en un .tmp al lado, para poder mirarla a mano.
"""
import argparse
import json
import os
import shutil
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta

import pandas as pd

# --- Configuracion ----------------------------------------------------------

TOLERANCIA_DIAS = 10  # margen que le damos a la fuente para cargar la final
ANIOS_DEFAULT = [2024, 2025, 2026]
URL = "https://stats.tennismylife.org/data/{anio}.csv"

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "datos-frescos")
ESTADO = os.path.join(DESTINO, ".estado_actualizar.json")

# Calendario de Slams ANIO-AGNOSTICO: (nombre, patron, (mes, dia de fin tipico)).
# A proposito no hay fechas exactas por anio: si las hubiera, habria que
# actualizarlas cada enero, y el dia que alguien se olvide el guardian se apaga
# solo y en silencio. Con mes/dia tipico + tolerancia esto no se toca nunca.
# Nota: si algun dia se extiende a anios historicos, 2020 necesita excepcion
# (Wimbledon cancelado, AO y US Open corridos por covid).
SLAMS = [
    ("Australian Open", "australian open", (1, 28)),
    ("Roland Garros", "roland garros", (6, 8)),
    ("Wimbledon", "wimbledon", (7, 14)),
    ("US Open", "us open", (9, 8)),
]

COLUMNAS_MINIMAS = [
    "tourney_date", "tourney_name", "tourney_level", "surface",
    "round", "best_of", "score", "winner_name", "loser_name",
]

FILAS_MINIMAS_ANIO_CERRADO = 2000
CAIDA_VOLUMEN_AVISO = 0.75  # si el anio en curso tiene <75% del anterior, avisa


# --- Utilidades -------------------------------------------------------------

def ruta_csv(anio):
    return os.path.join(DESTINO, f"tml_{anio}.csv")


def fechas_de(df):
    """tourney_date (YYYYMMDD entero) -> serie de datetime, alineada con df."""
    crudas = pd.to_numeric(df["tourney_date"], errors="coerce")
    texto = crudas.map(lambda v: str(int(v)) if pd.notna(v) else None)
    return pd.to_datetime(texto, format="%Y%m%d", errors="coerce")


def leer_csv(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        cabeza = f.read(200).lstrip()
    if cabeza.startswith("<"):
        raise ValueError("el archivo parece HTML, no CSV (404 o pagina de error?)")
    if not cabeza.strip():
        raise ValueError("el archivo esta vacio")
    return pd.read_csv(path, low_memory=False)


def bajar(anio, destino_tmp):
    url = URL.format(anio=anio)
    print(f"  bajando {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "ace-stats/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r, open(destino_tmp, "wb") as f:
        shutil.copyfileobj(r, f)
    kb = os.path.getsize(destino_tmp) / 1024
    print(f"  bajado ({kb:.0f} KB)")


# --- Chequeos DUROS (abortan) -----------------------------------------------

def slams_exigibles(anio, hoy):
    """Slams que a dia de hoy ya deberian estar terminados y cargados."""
    out = []
    for nombre, patron, (mes, dia) in SLAMS:
        fin = date(anio, mes, dia)
        if fin + timedelta(days=TOLERANCIA_DIAS) <= hoy:
            out.append((nombre, patron, fin))
    return out


def chequeos_duros(anio, df, hoy):
    errores = []

    faltan = [c for c in COLUMNAS_MINIMAS if c not in df.columns]
    if faltan:
        return [f"faltan columnas: {', '.join(faltan)}"]
    if len(df) == 0:
        return ["el CSV no tiene ni una fila"]

    if anio < hoy.year and len(df) < FILAS_MINIMAS_ANIO_CERRADO:
        errores.append(
            f"anio cerrado con solo {len(df)} filas (esperaba >= {FILAS_MINIMAS_ANIO_CERRADO})"
        )

    fechas = fechas_de(df)
    if fechas.notna().sum() == 0:
        return errores + ["ninguna fecha de tourney_date se pudo parsear"]
    if fechas.isna().mean() > 0.05:
        errores.append(f"{fechas.isna().mean():.0%} de las fechas no parsean")

    # El archivo tiene que ser DEL anio que dice ser (evita bajar 2025 como 2026).
    del_anio = (fechas.dt.year == anio).mean()
    if del_anio < 0.9:
        errores.append(f"solo {del_anio:.0%} de las filas son del {anio}: archivo equivocado?")

    # El guardian: todo Slam que ya deberia haber terminado tiene que tener SU FINAL.
    nombres = df["tourney_name"].astype(str).str.lower()
    rondas = df["round"].astype(str).str.upper().str.strip()
    for nombre, patron, fin in slams_exigibles(anio, hoy):
        del_torneo = nombres.str.contains(patron, regex=False)
        if not bool((del_torneo & (rondas == "F")).any()):
            detalle = "esta el torneo pero NO la final" if bool(del_torneo.any()) else "no aparece"
            errores.append(
                f"falta {nombre} ({detalle}; suele terminar ~{fin.strftime('%d/%m')}, "
                f"hoy es {hoy.strftime('%d/%m')})"
            )
    return errores


# --- Chequeos BLANDOS (solo avisan) -----------------------------------------

def chequeos_blandos(anio, df, hoy, estado_viejo):
    avisos = []
    fechas = fechas_de(df)
    ultima = fechas.max()

    # Volumen contra el anio anterior, cortado al mismo dia del anio.
    anterior = ruta_csv(anio - 1)
    if anio == hoy.year and os.path.exists(anterior):
        try:
            df_ant = leer_csv(anterior)
            f_ant = fechas_de(df_ant)
            corte = (f_ant.dt.month * 100 + f_ant.dt.day) <= (hoy.month * 100 + hoy.day)
            n_ant = int(corte.sum())
            if n_ant > 0:
                ratio = len(df) / n_ant
                if ratio < CAIDA_VOLUMEN_AVISO:
                    avisos.append(
                        f"{len(df)} partidos vs {n_ant} que tenia {anio-1} a esta altura "
                        f"({ratio:.0%}): puede faltar algo"
                    )
        except Exception as e:
            avisos.append(f"no pude comparar volumen con {anio-1}: {e}")

    # Fuente congelada: mismo ultimo partido y mismas filas que la corrida anterior.
    viejo = (estado_viejo or {}).get(str(anio))
    if viejo and pd.notna(ultima) and viejo.get("corrida") != hoy.strftime("%Y-%m-%d"):
        if viejo.get("ultima") == ultima.strftime("%Y-%m-%d") and viejo.get("filas") == len(df):
            avisos.append(
                f"identico a la corrida anterior ({viejo.get('corrida', 's/f')}): "
                "la fuente puede estar congelada"
            )
    return avisos


def resumen(anio, df):
    fechas = fechas_de(df)
    ultima = fechas.max()
    if pd.isna(ultima):
        return f"{len(df)} partidos"
    torneo = df.loc[fechas.idxmax(), "tourney_name"]
    return f"{len(df)} partidos - ultimo: {ultima.strftime('%d/%m/%Y')} ({torneo})"


# --- Main -------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Baja y verifica los CSV frescos de TML.")
    ap.add_argument("--solo-verificar", action="store_true",
                    help="no baja nada, verifica los CSV que ya estan en datos-frescos/")
    ap.add_argument("--anios", nargs="+", type=int, default=ANIOS_DEFAULT,
                    help=f"anios a procesar (default: {' '.join(map(str, ANIOS_DEFAULT))})")
    args = ap.parse_args()

    hoy = date.today()
    os.makedirs(DESTINO, exist_ok=True)
    try:
        with open(ESTADO) as f:
            estado_viejo = json.load(f)
    except Exception:
        estado_viejo = {}
    estado_nuevo = dict(estado_viejo)

    print(f"\n{'='*60}")
    print(f"Actualizar datos frescos - {hoy.strftime('%d/%m/%Y')}"
          f"{'  [SOLO VERIFICAR]' if args.solo_verificar else ''}")
    print(f"{'='*60}")

    hubo_error = False
    todos_los_avisos = []

    for anio in args.anios:
        print(f"\n--- {anio} ---")
        final = ruta_csv(anio)
        tmp = final + ".tmp"

        if args.solo_verificar:
            candidato = final
            if not os.path.exists(candidato):
                print(f"  ERROR: no existe {os.path.basename(candidato)}")
                hubo_error = True
                continue
        else:
            candidato = tmp
            try:
                bajar(anio, tmp)
            except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
                print(f"  ERROR: no se pudo bajar: {e}")
                hubo_error = True
                continue

        try:
            df = leer_csv(candidato)
        except Exception as e:
            print(f"  ERROR: no se pudo leer: {e}")
            hubo_error = True
            continue

        errores = chequeos_duros(anio, df, hoy)
        if errores:
            print(f"  {resumen(anio, df)}")
            for e in errores:
                print(f"  ERROR: {e}")
            if not args.solo_verificar:
                print(f"  -> NO piso {os.path.basename(final)}. La descarga quedo en "
                      f"{os.path.basename(tmp)}")
            hubo_error = True
            continue

        # Paso los chequeos duros: recien ahora toco el archivo bueno.
        if not args.solo_verificar:
            if os.path.exists(final):
                shutil.copy2(final, final + ".bak")
            os.replace(tmp, final)

        print(f"  OK - {resumen(anio, df)}")
        exigidos = [n for n, _, _ in slams_exigibles(anio, hoy)]
        if exigidos:
            print(f"  Slams exigidos y presentes: {', '.join(exigidos)}")

        for a in chequeos_blandos(anio, df, hoy, estado_viejo):
            print(f"  AVISO: {a}")
            todos_los_avisos.append(f"{anio}: {a}")

        ultima = fechas_de(df).max()
        estado_nuevo[str(anio)] = {
            "ultima": None if pd.isna(ultima) else ultima.strftime("%Y-%m-%d"),
            "filas": len(df),
            "corrida": hoy.strftime("%Y-%m-%d"),
        }

    with open(ESTADO, "w") as f:
        json.dump(estado_nuevo, f, indent=2)

    print(f"\n{'='*60}")
    if hubo_error:
        print("RESULTADO: FALLO. Los datos NO estan listos para ingerir.")
        print("Revisa los ERROR de arriba antes de correr la ingesta.")
        print(f"{'='*60}\n")
        sys.exit(1)
    if todos_los_avisos:
        print("RESULTADO: OK con avisos.")
        for a in todos_los_avisos:
            print(f"  - {a}")
    else:
        print("RESULTADO: OK. Datos frescos y completos.")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
