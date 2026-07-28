"""
Ingesta de datos a Supabase (Postgres) para Ace Stats v2.0.

Uso:
    python3 scripts/ingesta_supabase.py

Pide la cadena de conexion (Session Pooler, con [YOUR-PASSWORD] tal cual)
y la contraseña por separado — la contraseña nunca queda escrita en
ningun archivo. Carga:
  1. Todos los partidos ATP (cargar_todo: historico + frescos, con JJOO)
  2. Los 30 jugadores del roster (bios desde jugadores.ts)
Al final verifica conteos contra lo esperado.

Es seguro re-correrlo: vacia las tablas antes de cargar (truncate).
"""
import os
import re
import sys
import getpass
from urllib.parse import quote_plus

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from calcular_stats import cargar_todo, es_indoor

DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_JUGADORES = os.path.join(DIR, "..", "app", "data", "jugadores.ts")

NOMBRES_DATASET = {
    "Alex de Miñaur": "Alex de Minaur",
}


def pedir_conexion():
    print("Pegá la cadena de conexión (Session pooler, con [YOUR-PASSWORD] tal cual):")
    uri = input("> ").strip()
    if "[YOUR-PASSWORD]" not in uri:
        print("OJO: la cadena no tiene el placeholder [YOUR-PASSWORD].")
        print("Si ya pusiste la contraseña a mano, sigo igual...")
        return uri
    pw = getpass.getpass("Contraseña de la base (no se ve al tipear): ")
    return uri.replace("[YOUR-PASSWORD]", quote_plus(pw))


def leer_bios():
    s = open(RUTA_JUGADORES, encoding="utf-8").read()
    campos = {
        "id": re.findall(r'id:\s*"([^"]+)"', s),
        "nombre": re.findall(r'nombre:\s*"([^"]+)"', s),
        "pais": re.findall(r'pais:\s*"([^"]*)"', s),
        "mano": re.findall(r'mano:\s*"([RL])"', s),
        "pro_desde": re.findall(r'proDesde:\s*(\d+)', s),
        "ranking": re.findall(r'ranking:\s*(-?\d+)', s),
        "grand_slams": re.findall(r'grandSlams:\s*(\d+)', s),
        "semanas_1": re.findall(r'semanas1:\s*(\d+)', s),
    }
    n = len(campos["id"])
    for c, v in campos.items():
        if len(v) != n:
            print(f"ERROR parseando jugadores.ts: {c} = {len(v)} valores, esperaba {n}")
            sys.exit(1)
    return [{c: campos[c][i] for c in campos} for i in range(n)]


def entero(v):
    """NaN/None/'' -> None; si no, int."""
    if v is None or (isinstance(v, float) and pd.isna(v)) or v == "":
        return None
    try:
        return int(float(v))
    except (ValueError, TypeError):
        return None


def texto(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    return str(v)


if __name__ == "__main__":
    dsn = pedir_conexion()
    print("\nConectando a Supabase...")
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()
    print("Conectado ✓\n")

    df = cargar_todo()
    total = len(df)
    print(f"\nPreparando {total} partidos (calculando indoor con la lista curada)...")
    df["_indoor"] = df.apply(es_indoor, axis=1)

    filas = []
    for _, r in df.iterrows():
        filas.append((
            entero(r.get("tourney_date")),
            texto(r.get("tourney_name")),
            texto(r.get("tourney_level")),
            texto(r.get("surface")),
            bool(r.get("_indoor")),
            texto(r.get("round")),
            entero(r.get("best_of")),
            texto(r.get("winner_name")),
            texto(r.get("loser_name")),
            entero(r.get("winner_rank")),
            entero(r.get("loser_rank")),
            texto(r.get("score")),
            entero(r.get("w_bpSaved")), entero(r.get("w_bpFaced")), entero(r.get("w_SvGms")),
            entero(r.get("l_bpSaved")), entero(r.get("l_bpFaced")), entero(r.get("l_SvGms")),
        ))

    print("Vaciando tablas (re-corrida limpia)...")
    cur.execute("truncate partidos, jugadores")

    print("Cargando partidos en tandas de 5000...")
    sql = """insert into partidos
        (tourney_date, tourney_name, tourney_level, surface, indoor, round, best_of,
         winner_name, loser_name, winner_rank, loser_rank, score,
         w_bpsaved, w_bpfaced, w_svgms, l_bpsaved, l_bpfaced, l_svgms)
        values %s"""
    TANDA = 5000
    for i in range(0, len(filas), TANDA):
        execute_values(cur, sql, filas[i:i + TANDA], page_size=1000)
        print(f"  {min(i + TANDA, len(filas))}/{len(filas)} partidos...")

    print("\nCargando los jugadores del roster...")
    bios = leer_bios()
    filas_j = [(
        b["id"], b["nombre"], NOMBRES_DATASET.get(b["nombre"], b["nombre"]),
        b["pais"], b["mano"], int(b["pro_desde"]), int(b["ranking"]),
        int(b["grand_slams"]), int(b["semanas_1"]),
    ) for b in bios]
    execute_values(cur, """insert into jugadores
        (id, nombre, nombre_dataset, pais, mano, pro_desde, ranking, grand_slams, semanas_1)
        values %s""", filas_j)

    conn.commit()

    print("\n--- VERIFICACIÓN ---")
    cur.execute("select count(*) from partidos")
    n_p = cur.fetchone()[0]
    cur.execute("select count(*) from jugadores")
    n_j = cur.fetchone()[0]
    cur.execute("""select count(*) from partidos
                   where winner_name = 'Novak Djokovic' or loser_name = 'Novak Djokovic'""")
    n_djoko = cur.fetchone()[0]
    print(f"Partidos en la base: {n_p} (esperados: {total}) {'✓' if n_p == total else '✗ REVISAR'}")
    print(f"Jugadores en la base: {n_j} (esperados: {len(bios)}) {'✓' if n_j == len(bios) else '✗ REVISAR'}")
    print(f"Partidos de Djokovic: {n_djoko} (esperados ~1405)")

    cur.close()
    conn.close()
    print("\nIngesta completa. La base está viva.")
