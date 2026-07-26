"""
Ingesta de stats por temporada a Supabase (Ace Stats v2.0).

Uso:
    python3 scripts/ingesta_stats_temporada.py

Reusa calcular_stats.calcular() como unica fuente de metodologia (no
recalcula nada por su cuenta) y la misma forma de conexion que
ingesta_supabase.py (psycopg2 + Session Pooler).

Es seguro re-correrlo: hace upsert sobre (jugador_id, anio).

--- Cambio (paso 2 de actualizar.py) ---
El trabajo de ingesta vive ahora en ingestar(df, cur), para que
actualizar.py lo pueda importar y llamar con el MISMO df que ya
verifico, en vez de volver a leer los CSV por su cuenta. El bloque
if __name__ solo agrega la parte interactiva (pedir conexion, conectar,
cargar_todo, commit, verificacion final) para poder seguir corriendo
este script solo, como siempre.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import psycopg2
from psycopg2.extras import Json
from calcular_stats import cargar_todo, calcular
from ingesta_supabase import pedir_conexion


def anios_de(nombre_dataset, df):
    """Devuelve la lista de años en que el jugador aparece en el dataset."""
    en_partidos = df[(df["winner_name"] == nombre_dataset) | (df["loser_name"] == nombre_dataset)]
    return sorted(en_partidos["anio"].unique().tolist())


def obtener_jugadores(cur):
    """Trae todos los jugadores de Supabase: (id, nombre_dataset)."""
    cur.execute("select id, nombre_dataset from jugadores order by id")
    return cur.fetchall()


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


def ingestar(df, cur):
    """
    Corre la ingesta completa (todos los jugadores, todos sus años) contra
    un df y un cursor ya abiertos. NO hace commit: eso queda a cargo de
    quien la llama (asi el caller decide si commitea o hace rollback).

    Devuelve la cantidad de filas insertadas/actualizadas.
    """
    jugadores = obtener_jugadores(cur)
    objetivos = [(jid, nombre, anio) for jid, nombre in jugadores for anio in anios_de(nombre, df)]

    insertadas = 0
    for jugador_id, nombre_dataset, anio in objetivos:
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
        insertadas += 1
        print(f"\n→ Insertado: {jugador_id} {anio} "
              f"({r['victorias']}-{r['derrotas']}, {r['titulos']} titulos)")

    return insertadas


if __name__ == "__main__":
    # ACE_STATS_DSN permite correr esto sin tipear la conexion a mano
    # (lo usa actualizar.py --auto en cron). Si no esta seteada, pide
    # la conexion de forma interactiva como siempre.
    dsn = os.environ.get("ACE_STATS_DSN") or pedir_conexion()

    print("\nConectando a Supabase...")
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()
    print("Conectado ✓\n")

    df = cargar_todo()
    ingestar(df, cur)

    conn.commit()

    print("\n--- VERIFICACIÓN ---")
    cur.execute("""select jugador_id, anio, victorias, derrotas, titulos, mejor_ranking
                   from stats_por_temporada order by jugador_id, anio""")
    for fila in cur.fetchall():
        print(fila)

    cur.close()
    conn.close()
    print("\nListo.")
