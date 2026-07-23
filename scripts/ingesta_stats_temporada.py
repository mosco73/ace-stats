"""
Ingesta de stats por temporada a Supabase (Ace Stats v2.0).

Uso:
    python3 scripts/ingesta_stats_temporada.py

Piloto: Sinner 2025. Reusa calcular_stats.calcular() como unica fuente
de metodologia (no recalcula nada por su cuenta) y la misma forma de
conexion que ingesta_supabase.py (psycopg2 + Session Pooler).

Es seguro re-correrlo: hace upsert sobre (jugador_id, anio).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import psycopg2
from psycopg2.extras import Json
from calcular_stats import cargar_todo, calcular
from ingesta_supabase import pedir_conexion

# Piloto: (jugador_id en la tabla jugadores, nombre tal cual en el dataset, anio)
OBJETIVOS = [
    ("sinner", "Jannik Sinner", 2024),
    ("sinner", "Jannik Sinner", 2025),
    ("sinner", "Jannik Sinner", 2026),
]

SQL = """
insert into stats_por_temporada
    (jugador_id, anio, partidos_totales, victorias, derrotas,
     titulos, mejor_ranking, stats_detalle)
values (%s, %s, %s, %s, %s, %s, %s, %s)
on conflict (jugador_id, anio) do update set
    partidos_totales = excluded.partidos_totales,
    victorias        = excluded.victorias,
    derrotas         = excluded.derrotas,
    titulos          = excluded.titulos,
    mejor_ranking    = excluded.mejor_ranking,
    stats_detalle    = excluded.stats_detalle,
    actualizado_en   = current_date
"""

if __name__ == "__main__":
    dsn = pedir_conexion()
    print("\nConectando a Supabase...")
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()
    print("Conectado ✓\n")

    df = cargar_todo()

    for jugador_id, nombre_dataset, anio in OBJETIVOS:
        r = calcular(nombre_dataset, df, anio=anio)
        if not r:
            print(f"✗ Sin datos para {nombre_dataset} {anio}, salteo")
            continue
        cur.execute(SQL, (
            jugador_id,
            r["anio"],
            r["partidos_totales"],
            r["victorias"],
            r["derrotas"],
            r["titulos"],
            r["mejor_ranking"],
            Json(r["stats_detalle"]),
        ))
        print(f"\n→ Insertado: {jugador_id} {anio} "
              f"({r['victorias']}-{r['derrotas']}, {r['titulos']} titulos)")

    conn.commit()

    print("\n--- VERIFICACIÓN ---")
    cur.execute("""select jugador_id, anio, victorias, derrotas, titulos, mejor_ranking
                   from stats_por_temporada order by jugador_id, anio""")
    for fila in cur.fetchall():
        print(fila)

    cur.close()
    conn.close()
    print("\nListo.")