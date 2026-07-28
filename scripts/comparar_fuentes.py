#!/usr/bin/env python3
"""
comparar_fuentes.py - Compara el historico de TML contra el de Sackmann.

Paso 2 de la migracion a fuente unica. NO modifica nada: solo lee las dos
fuentes y reporta las diferencias, para decidir con datos si conviene migrar.

Uso:
    python3 scripts/comparar_fuentes.py
    python3 scripts/comparar_fuentes.py --anios 1990 2000   # solo un rango

Lo que mira, de menos a mas importante:
  1. Partidos por anio en cada fuente
  2. Cobertura de columnas (indoor, stats de saque)
  3. Valores de tourney_level (los filtros de Slams/Masters dependen de esto)
  4. Record de carrera de los 30 jugadores del sitio  <- el que decide
"""
import argparse
import os
import sys

import pandas as pd

SACKMANN_DIR = os.path.expanduser("~/Downloads/archive/tennis_atp")
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TML_DIR = os.path.join(RAIZ, "datos-frescos")

DESDE, HASTA = 1968, 2023

JUGADORES = [
    "Roger Federer", "Rafael Nadal", "Novak Djokovic", "Carlos Alcaraz",
    "Jannik Sinner", "Daniil Medvedev", "Andy Murray", "Alexander Zverev",
    "Stefanos Tsitsipas", "Taylor Fritz", "Stan Wawrinka", "Andrey Rublev",
    "Casper Ruud", "Ben Shelton", "Juan Martin del Potro", "Andy Roddick",
    "Jack Draper", "Holger Rune", "Lorenzo Musetti", "David Ferrer",
    "Marat Safin", "Lleyton Hewitt", "Dominic Thiem", "Marin Cilic",
    "Kei Nishikori", "David Nalbandian", "Guillermo Coria",
    "Juan Carlos Ferrero", "Fernando Verdasco", "Alex De Minaur",
]

TOLERANCIA_PARTIDOS = 0.02   # 2% de diferencia por anio se considera normal
TOLERANCIA_RECORD = 3        # hasta 3 partidos de diferencia por jugador


def cargar(directorio, patron, anios):
    """Carga una fuente. Devuelve (df, anios_faltantes)."""
    dfs, faltan = [], []
    for y in anios:
        p = os.path.join(directorio, patron.format(anio=y))
        if not os.path.exists(p):
            faltan.append(y)
            continue
        d = pd.read_csv(p, low_memory=False)
        d["anio"] = y
        dfs.append(d)
    if not dfs:
        raise FileNotFoundError(f"No encontre ningun archivo en {directorio}")
    return pd.concat(dfs, ignore_index=True), faltan


def record(df, nombre):
    """(victorias, derrotas) de un jugador, ignorando mayusculas en el nombre."""
    n = nombre.lower()
    w = df["winner_name"].astype(str).str.lower()
    l = df["loser_name"].astype(str).str.lower()
    return int((w == n).sum()), int((l == n).sum())


def main():
    ap = argparse.ArgumentParser(description="Compara TML contra Sackmann.")
    ap.add_argument("--anios", nargs=2, type=int, metavar=("DESDE", "HASTA"),
                    default=[DESDE, HASTA])
    args = ap.parse_args()
    anios = range(args.anios[0], args.anios[1] + 1)

    print(f"\n{'='*68}")
    print(f"COMPARACION TML vs SACKMANN  ({args.anios[0]}-{args.anios[1]})")
    print(f"{'='*68}\n")

    print("Cargando Sackmann...")
    sack, faltan_s = cargar(SACKMANN_DIR, "atp_matches_{anio}.csv", anios)
    print("Cargando TML...")
    tml, faltan_t = cargar(TML_DIR, "tml_{anio}.csv", anios)
    if faltan_s:
        print(f"  !! A Sackmann le faltan: {faltan_s}")
    if faltan_t:
        print(f"  !! A TML le faltan: {faltan_t}")
    print(f"\nSackmann: {len(sack):,} partidos")
    print(f"TML     : {len(tml):,} partidos")
    dif_total = len(tml) - len(sack)
    print(f"Dif     : {dif_total:+,} ({dif_total/len(sack):+.2%})\n")

    problemas = []

    # --- 1. Partidos por anio ------------------------------------------------
    print(f"{'-'*68}")
    print("1. PARTIDOS POR ANIO (solo anios con diferencia notable)")
    print(f"{'-'*68}")
    cs = sack.groupby("anio").size()
    ct = tml.groupby("anio").size()
    raros = 0
    for y in anios:
        a, b = int(cs.get(y, 0)), int(ct.get(y, 0))
        if a == 0:
            continue
        dif = (b - a) / a
        if abs(dif) > TOLERANCIA_PARTIDOS:
            print(f"  {y}: Sackmann {a:5}  TML {b:5}  ({dif:+.1%})")
            raros += 1
    if raros == 0:
        print(f"  Ningun anio se desvia mas de {TOLERANCIA_PARTIDOS:.0%}. OK")
    else:
        problemas.append(f"{raros} anios con diferencia > {TOLERANCIA_PARTIDOS:.0%}")

    # --- 2. Cobertura de columnas -------------------------------------------
    print(f"\n{'-'*68}")
    print("2. COBERTURA DE COLUMNAS")
    print(f"{'-'*68}")
    falta_en_tml = sorted(set(sack.columns) - set(tml.columns) - {"anio"})
    sobra_en_tml = sorted(set(tml.columns) - set(sack.columns) - {"anio"})
    print(f"  Columnas que Sackmann tiene y TML no: {falta_en_tml or 'ninguna'}")
    print(f"  Columnas que TML tiene de mas       : {sobra_en_tml or 'ninguna'}")
    if falta_en_tml:
        problemas.append(f"TML no tiene: {falta_en_tml}")

    if "indoor" in tml.columns:
        lleno = tml["indoor"].notna().mean()
        print(f"  indoor lleno en TML                 : {lleno:.1%}")
    for col in ["w_ace", "w_bpSaved", "w_SvGms"]:
        if col in sack.columns and col in tml.columns:
            print(f"  {col:12} Sackmann {sack[col].notna().mean():5.1%}"
                  f"   TML {tml[col].notna().mean():5.1%}")

    # --- 3. tourney_level ----------------------------------------------------
    print(f"\n{'-'*68}")
    print("3. TOURNEY_LEVEL (de esto dependen los filtros de Slams y Masters)")
    print(f"{'-'*68}")
    vs = sack["tourney_level"].astype(str).value_counts()
    vt = tml["tourney_level"].astype(str).value_counts()
    for v in sorted(set(vs.index) | set(vt.index)):
        print(f"  {v:6}  Sackmann {int(vs.get(v,0)):6}   TML {int(vt.get(v,0)):6}")
    for nivel, que in [("G", "Grand Slams"), ("M", "Masters 1000")]:
        a, b = int(vs.get(nivel, 0)), int(vt.get(nivel, 0))
        if a and abs(b - a) / a > 0.05:
            problemas.append(f"{que}: Sackmann {a} vs TML {b}")

    # --- 4. Record de carrera por jugador ------------------------------------
    print(f"\n{'-'*68}")
    print("4. RECORD POR JUGADOR (el que decide)")
    print(f"{'-'*68}")
    print(f"  {'Jugador':24} {'Sackmann':>12} {'TML':>12}   dif")
    desvios = 0
    for nombre in JUGADORES:
        vs_, ds_ = record(sack, nombre)
        vt_, dt_ = record(tml, nombre)
        d = (vt_ + dt_) - (vs_ + ds_)
        marca = "" if abs(d) <= TOLERANCIA_RECORD else "  <<<"
        if marca:
            desvios += 1
        print(f"  {nombre:24} {vs_:5}-{ds_:<6} {vt_:5}-{dt_:<6} {d:+4}{marca}")
    if desvios:
        problemas.append(f"{desvios} jugadores con mas de {TOLERANCIA_RECORD} partidos de diferencia")

    # --- Veredicto -----------------------------------------------------------
    print(f"\n{'='*68}")
    if problemas:
        print("REVISAR ANTES DE MIGRAR:")
        for p in problemas:
            print(f"  - {p}")
    else:
        print("Las dos fuentes coinciden dentro de la tolerancia.")
        print("La migracion no deberia mover numeros de forma inesperada.")
    print(f"{'='*68}\n")


if __name__ == "__main__":
    main()
