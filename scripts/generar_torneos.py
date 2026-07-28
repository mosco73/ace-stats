"""
Generador de rendimiento por torneo para Ace Stats.

Uso:
    python3 scripts/generar_torneos.py

Para cada jugador del roster, calcula victorias-derrotas, porcentaje y
titulos en los 13 torneos grandes (4 Grand Slams + 9 Masters 1000
actuales), y escribe app/data/torneos.ts listo para commitear.

Los nombres de torneo del dataset varian segun la era; se normalizan aca.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from calcular_stats import cargar_todo

DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_JUGADORES = os.path.join(DIR, "..", "app", "data", "jugadores.ts")
RUTA_SALIDA = os.path.join(DIR, "..", "app", "data", "torneos.ts")

# Nombres del sitio -> nombres del dataset (cuando difieren)
NOMBRES_DATASET = {
    "Alex de Miñaur": "Alex de Minaur",
}

# Torneo canonico -> variantes en el dataset (case-insensitive)
# Orden de salida: 4 GS primero, luego Masters por calendario.
TORNEOS = [
    ("Australian Open", "GS", ["australian open"]),
    ("Roland Garros", "GS", ["roland garros"]),
    ("Wimbledon", "GS", ["wimbledon"]),
    ("US Open", "GS", ["us open"]),
    ("Indian Wells", "M1000", ["indian wells masters", "indian wells"]),
    ("Miami", "M1000", ["miami masters", "miami"]),
    ("Monte Carlo", "M1000", ["monte carlo masters", "monte carlo"]),
    ("Madrid", "M1000", ["madrid masters", "madrid"]),
    ("Roma", "M1000", ["rome masters", "rome"]),
    ("Canadá", "M1000", ["canada masters", "toronto", "montreal"]),
    ("Cincinnati", "M1000", ["cincinnati masters", "cincinnati"]),
    ("Shanghai", "M1000", ["shanghai masters", "shanghai"]),
    ("París Indoor", "M1000", ["paris masters", "paris"]),
]


def leer_roster():
    contenido = open(RUTA_JUGADORES, encoding="utf-8").read()
    ids = re.findall(r'id:\s*"([^"]+)"', contenido)
    nombres = re.findall(r'nombre:\s*"([^"]+)"', contenido)
    if len(ids) != len(nombres):
        print("ERROR: ids y nombres desparejos en jugadores.ts")
        sys.exit(1)
    return {i: NOMBRES_DATASET.get(n, n) for i, n in zip(ids, nombres)}


def rendimiento(df, nombre):
    mask = (df["winner_name"] == nombre) | (df["loser_name"] == nombre)
    p = df[mask].copy()
    p = p[~p["score"].astype(str).str.contains("W/O", na=False)]
    p["gano"] = p["winner_name"] == nombre
    p["torneo_lc"] = p["tourney_name"].astype(str).str.strip().str.lower()

    filas = []
    for canonico, categoria, variantes in TORNEOS:
        sub = p[p["torneo_lc"].isin(variantes)]
        total = len(sub)
        if total == 0:
            continue
        v = int(sub["gano"].sum())
        titulos = int(((sub["round"] == "F") & (sub["gano"])).sum())
        filas.append({
            "torneo": canonico,
            "categoria": categoria,
            "victorias": v,
            "derrotas": total - v,
            "pct": round(100 * v / total, 1),
            "titulos": titulos,
        })
    return filas


def emitir_ts(datos):
    L = []
    a = L.append
    a("// Archivo generado por scripts/generar_torneos.py — NO editar a mano.")
    a("// Regenerar tras cambios en el roster o refresh de datos.")
    a("")
    a("export type RendimientoTorneo = {")
    a("  torneo: string;")
    a('  categoria: "GS" | "M1000";')
    a("  victorias: number;")
    a("  derrotas: number;")
    a("  pct: number;")
    a("  titulos: number;")
    a("};")
    a("")
    a("export const torneos: Record<string, RendimientoTorneo[]> = {")
    for jid in datos:
        a(f'  "{jid}": [')
        for f in datos[jid]:
            a(f'    {{ torneo: "{f["torneo"]}", categoria: "{f["categoria"]}", victorias: {f["victorias"]}, derrotas: {f["derrotas"]}, pct: {f["pct"]}, titulos: {f["titulos"]} }},')
        a("  ],")
    a("};")
    a("")
    return "\n".join(L)


if __name__ == "__main__":
    roster = leer_roster()
    print(f"Roster: {len(roster)} jugadores")
    df = cargar_todo()

    datos = {}
    for jid, nombre in roster.items():
        datos[jid] = rendimiento(df, nombre)

    print("\nValidación (títulos en torneos grandes de referencia):")
    chequeos = [
        ("nadal", "Roland Garros"), ("djokovic", "Australian Open"),
        ("federer", "Wimbledon"), ("sinner", "US Open"), ("delpotro", "US Open"),
    ]
    for jid, torneo in chequeos:
        fila = next((f for f in datos.get(jid, []) if f["torneo"] == torneo), None)
        if fila:
            print(f"  {jid} en {torneo}: {fila['victorias']}-{fila['derrotas']} ({fila['pct']}%), {fila['titulos']} títulos")

    contenido = emitir_ts(datos)
    with open(RUTA_SALIDA, "w", encoding="utf-8") as f:
        f.write(contenido)
    print(f"\nEscrito: {RUTA_SALIDA} ({len(contenido)} caracteres)")
    print("Verificar los títulos de arriba contra los oficiales antes de commitear.")
