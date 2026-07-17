"""
Generador de rivalidades (head-to-head) para Ace Stats.

Uso:
    python3 scripts/generar_rivalidades.py

Lee el roster completo desde app/data/jugadores.ts (una sola fuente de
verdad), filtra todos los partidos entre jugadores del roster, y escribe
app/data/rivalidades.ts con el head-to-head de cada par: record total,
por superficie, indoor, en finales y en Grand Slams.

No requiere pegado manual: el archivo de salida queda listo para commitear.
"""
import os
import re
import sys
from itertools import combinations

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from calcular_stats import cargar_todo, es_indoor

DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_JUGADORES = os.path.join(DIR, "..", "app", "data", "jugadores.ts")
RUTA_SALIDA = os.path.join(DIR, "..", "app", "data", "rivalidades.ts")


def leer_roster():
    """Extrae los pares (id, nombre) de jugadores.ts."""
    contenido = open(RUTA_JUGADORES, encoding="utf-8").read()
    ids = re.findall(r'id:\s*"([^"]+)"', contenido)
    nombres = re.findall(r'nombre:\s*"([^"]+)"', contenido)
    if len(ids) != len(nombres):
        print(f"ERROR: {len(ids)} ids pero {len(nombres)} nombres en jugadores.ts")
        sys.exit(1)
    return dict(zip(ids, nombres))


def h2h(df, nombre_a, nombre_b):
    """Head-to-head entre dos jugadores. Devuelve None si nunca jugaron."""
    mask = ((df["winner_name"] == nombre_a) & (df["loser_name"] == nombre_b)) | \
           ((df["winner_name"] == nombre_b) & (df["loser_name"] == nombre_a))
    p = df[mask].copy()
    p = p[~p["score"].astype(str).str.contains("W/O", na=False)]
    if len(p) == 0:
        return None

    p["gana_a"] = p["winner_name"] == nombre_a
    p["es_indoor"] = p.apply(es_indoor, axis=1)

    def registro(sub):
        va = int(sub["gana_a"].sum())
        return {"a": va, "b": len(sub) - va}

    return {
        "total": registro(p),
        "dura": registro(p[p["surface"] == "Hard"]),
        "arcilla": registro(p[p["surface"] == "Clay"]),
        "cesped": registro(p[p["surface"] == "Grass"]),
        "indoor": registro(p[p["es_indoor"]]),
        "finales": registro(p[p["round"] == "F"]),
        "grandSlams": registro(p[p["tourney_level"] == "G"]),
    }


def emitir_ts(rivalidades):
    lineas = []
    a = lineas.append
    a("// Archivo generado por scripts/generar_rivalidades.py — NO editar a mano.")
    a("// Regenerar tras cambios en el roster o refresh de datos.")
    a("")
    a("export type RegistroH2H = { a: number; b: number };")
    a("")
    a("export type Rivalidad = {")
    a("  jugadorA: string; // id — el orden a/b de los registros corresponde a A/B")
    a("  jugadorB: string;")
    a("  total: RegistroH2H;")
    a("  dura: RegistroH2H;")
    a("  arcilla: RegistroH2H;")
    a("  cesped: RegistroH2H;")
    a("  indoor: RegistroH2H;")
    a("  finales: RegistroH2H;")
    a("  grandSlams: RegistroH2H;")
    a("};")
    a("")
    a("export const rivalidades: Record<string, Rivalidad> = {")
    for clave in sorted(rivalidades.keys()):
        r = rivalidades[clave]
        a(f'  "{clave}": {{')
        a(f'    jugadorA: "{r["jugadorA"]}",')
        a(f'    jugadorB: "{r["jugadorB"]}",')
        for campo in ["total", "dura", "arcilla", "cesped", "indoor", "finales", "grandSlams"]:
            reg = r[campo]
            a(f'    {campo}: {{ a: {reg["a"]}, b: {reg["b"]} }},')
        a("  },")
    a("};")
    a("")
    return "\n".join(lineas)


if __name__ == "__main__":
    roster = leer_roster()
    print(f"Roster: {len(roster)} jugadores leídos de jugadores.ts")

    df = cargar_todo()

    rivalidades = {}
    for id_a, id_b in combinations(sorted(roster.keys()), 2):
        datos = h2h(df, roster[id_a], roster[id_b])
        if datos is None:
            continue
        clave = f"{id_a}-{id_b}"
        rivalidades[clave] = {"jugadorA": id_a, "jugadorB": id_b, **datos}

    pares_totales = len(list(combinations(roster.keys(), 2)))
    print(f"\nRivalidades con al menos 1 partido: {len(rivalidades)} de {pares_totales} pares posibles\n")

    top = sorted(rivalidades.items(), key=lambda kv: -(kv[1]["total"]["a"] + kv[1]["total"]["b"]))[:10]
    print("Top 10 rivalidades por cantidad de partidos:")
    for clave, r in top:
        t = r["total"]
        print(f"  {roster[r['jugadorA']]} {t['a']}-{t['b']} {roster[r['jugadorB']]}  ({t['a'] + t['b']} partidos)")

    contenido = emitir_ts(rivalidades)
    with open(RUTA_SALIDA, "w", encoding="utf-8") as f:
        f.write(contenido)
    print(f"\nEscrito: {RUTA_SALIDA} ({len(contenido)} caracteres)")
    print("Verificar el resumen de arriba contra H2H conocidos antes de commitear.")
