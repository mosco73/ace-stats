#!/usr/bin/env python3
"""
bajar_historico_tml.py - Baja el historico completo de TennisMyLife.

Paso 1 de la migracion a fuente unica. NO toca nada de lo que ya funciona:
solo agrega archivos tml_YYYY.csv a datos-frescos/ para los anios que hoy
salen del archivo de Sackmann.

Uso:
    python3 scripts/bajar_historico_tml.py           # baja lo que falte
    python3 scripts/bajar_historico_tml.py --rebajar # rebaja todo de nuevo

Es seguro re-correrlo: por defecto saltea los archivos que ya estan.
Cada descarga se valida antes de quedarse (mismo patron que actualizar.py:
baja a .tmp, verifica que sea CSV de verdad, recien ahi renombra).
"""
import argparse
import os
import shutil
import sys
import time
import urllib.error
import urllib.request

import pandas as pd

URL = "https://stats.tennismylife.org/data/{anio}.csv"
DESDE, HASTA = 1968, 2023  # 2024-2026 ya los baja actualizar.py
PAUSA = 0.5  # segundos entre descargas, para no martillar el servidor

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "datos-frescos")

COLUMNAS_MINIMAS = [
    "tourney_date", "tourney_name", "tourney_level", "surface",
    "round", "best_of", "score", "winner_name", "loser_name",
]


def validar(path, anio):
    """Devuelve (ok, mensaje). No confia en que la descarga sea un CSV."""
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        cabeza = f.read(200).lstrip()
    if cabeza.startswith("<"):
        return False, "parece HTML, no CSV"
    if not cabeza.strip():
        return False, "archivo vacio"
    try:
        df = pd.read_csv(path, low_memory=False)
    except Exception as e:
        return False, f"no se pudo parsear: {e}"
    if len(df) == 0:
        return False, "sin filas"
    faltan = [c for c in COLUMNAS_MINIMAS if c not in df.columns]
    if faltan:
        return False, f"faltan columnas: {', '.join(faltan)}"
    fechas = pd.to_numeric(df["tourney_date"], errors="coerce")
    del_anio = (fechas // 10000 == anio).mean()
    if del_anio < 0.9:
        return False, f"solo {del_anio:.0%} de las filas son del {anio}"
    return True, f"{len(df)} partidos"


def main():
    ap = argparse.ArgumentParser(description="Baja el historico de TML.")
    ap.add_argument("--rebajar", action="store_true",
                    help="rebaja archivos que ya existen")
    ap.add_argument("--desde", type=int, default=DESDE)
    ap.add_argument("--hasta", type=int, default=HASTA)
    args = ap.parse_args()

    os.makedirs(DESTINO, exist_ok=True)
    anios = range(args.desde, args.hasta + 1)

    bajados, salteados, fallados = 0, 0, []
    print(f"\nBajando historico TML {args.desde}-{args.hasta} a {DESTINO}\n")

    for anio in anios:
        final = os.path.join(DESTINO, f"tml_{anio}.csv")
        if os.path.exists(final) and not args.rebajar:
            salteados += 1
            continue

        tmp = final + ".tmp"
        try:
            req = urllib.request.Request(
                URL.format(anio=anio), headers={"User-Agent": "ace-stats/1.0"}
            )
            with urllib.request.urlopen(req, timeout=60) as r, open(tmp, "wb") as f:
                shutil.copyfileobj(r, f)
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
            print(f"  {anio}  ERROR de descarga: {e}")
            fallados.append(anio)
            continue

        ok, msg = validar(tmp, anio)
        if not ok:
            print(f"  {anio}  ERROR: {msg} -> descartado")
            os.remove(tmp)
            fallados.append(anio)
            continue

        os.replace(tmp, final)
        kb = os.path.getsize(final) / 1024
        print(f"  {anio}  OK - {msg} ({kb:.0f} KB)")
        bajados += 1
        time.sleep(PAUSA)

    print(f"\n{'='*55}")
    print(f"Bajados: {bajados} | Ya estaban: {salteados} | Fallaron: {len(fallados)}")
    if fallados:
        print(f"Anios que fallaron: {fallados}")
        print("Volve a correr el script: saltea lo que ya bajo.")
    print(f"{'='*55}\n")
    sys.exit(1 if fallados else 0)


if __name__ == "__main__":
    main()
