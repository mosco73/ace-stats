"""
Deriva el ranking de cada jugador del roster a partir del último partido
que jugó, según los CSV de TML.

Uso:
    python3 scripts/ranking_derivado.py

NO escribe nada. Solo imprime la comparación contra los valores
hardcodeados en jugadores.ts, para poder validarla antes de automatizar.

Los retirados (ranking -1 en jugadores.ts) se dejan en -1: derivarles el
ranking del último partido les daría el puesto que tenían al retirarse.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pandas as pd

from calcular_stats import cargar_todo
from ingesta_supabase import leer_bios, NOMBRES_DATASET

RETIRADO = -1


def ranking_del_ultimo_partido(df, nombre_dataset):
    """Ranking y fecha del partido más reciente con rank conocido."""
    gano = df["winner_name"] == nombre_dataset
    perdio = df["loser_name"] == nombre_dataset
    propios = df[gano | perdio]
    if propios.empty:
        return None, None

    propios = propios.sort_values("tourney_date", ascending=False)

    for _, r in propios.iterrows():
        if r["winner_name"] == nombre_dataset:
            rank = r.get("winner_rank")
        else:
            rank = r.get("loser_rank")
        if pd.notna(rank):
            return int(rank), r["tourney_date"]

    return None, propios.iloc[0]["tourney_date"]


def main():
    print("Cargando datos TML...")
    df = cargar_todo()
    bios = leer_bios()
    print(f"{len(bios)} jugadores en el roster\n")

    filas = []
    for b in bios:
        nombre = b["nombre"]
        guardado = int(b["ranking"])
        nd = NOMBRES_DATASET.get(nombre, nombre)

        if guardado == RETIRADO:
            filas.append((nombre, guardado, RETIRADO, "-", "retirado"))
            continue

        rank, fecha = ranking_del_ultimo_partido(df, nd)
        if rank is None:
            filas.append((nombre, guardado, guardado, str(fecha), "SIN DATO, se deja igual"))
            continue

        nota = "" if rank == guardado else f"cambia {guardado} -> {rank}"
        filas.append((nombre, guardado, rank, str(fecha), nota))

    filas.sort(key=lambda f: f[2] if f[2] > 0 else 9999)

    print(f"{'jugador':<24}{'guardado':>10}{'derivado':>10}{'último partido':>16}   nota")
    print("-" * 90)
    for nombre, guardado, derivado, fecha, nota in filas:
        print(f"{nombre:<24}{guardado:>10}{derivado:>10}{fecha:>16}   {nota}")

    activos = [f for f in filas if f[2] > 0]
    vistos = {}
    for nombre, _, derivado, _, _ in activos:
        vistos.setdefault(derivado, []).append(nombre)
    choques = {k: v for k, v in vistos.items() if len(v) > 1}

    print()
    if choques:
        print("COLISIONES entre activos:")
        for puesto, nombres in sorted(choques.items()):
            print(f"  #{puesto}: {', '.join(nombres)}")
    else:
        print("Sin colisiones entre activos.")


if __name__ == "__main__":
    main()