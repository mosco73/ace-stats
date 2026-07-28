"""
Regenerador completo de jugadores.ts para Ace Stats.

Uso:
    python3 scripts/regenerar_todos.py

Lee las bios (id, nombre, pais, mano, proDesde, ranking, grandSlams,
semanas1) del jugadores.ts actual, recalcula stats, superficies y Clutch
Rating de TODOS los jugadores en una sola pasada de datos, y reescribe
el archivo completo. Guarda un backup en jugadores.ts.bak.

Herramienta de mantenimiento: usar tras cada refresh de CSVs o cambio
metodologico. Requiere distribucion_historica.csv regenerado ANTES
(python3 scripts/distribucion_historica.py).
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
from calcular_stats import cargar_todo
from generar_jugador import calcular_datos, f1
from clutch_rating import (
    MATCHES_MINIMO_RATING,
    construir_referencias,
    calcular_clutch,
    confianza_global,
)

DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_JUGADORES = os.path.join(DIR, "..", "app", "data", "jugadores.ts")
RUTA_CSV = os.path.join(DIR, "distribucion_historica.csv")

# Nombres del sitio -> nombres del dataset (cuando difieren)
NOMBRES_DATASET = {
    "Alex de Miñaur": "Alex de Minaur",
}


def leer_bios():
    contenido = open(RUTA_JUGADORES, encoding="utf-8").read()
    campos = {
        "id": re.findall(r'id:\s*"([^"]+)"', contenido),
        "nombre": re.findall(r'nombre:\s*"([^"]+)"', contenido),
        "pais": re.findall(r'pais:\s*"([^"]*)"', contenido),
        "mano": re.findall(r'mano:\s*"([RL])"', contenido),
        "proDesde": re.findall(r'proDesde:\s*(\d+)', contenido),
        "ranking": re.findall(r'ranking:\s*(-?\d+)', contenido),
        "grandSlams": re.findall(r'grandSlams:\s*(\d+)', contenido),
        "semanas1": re.findall(r'semanas1:\s*(\d+)', contenido),
        "clutch_viejo": re.findall(r'total:\s*([\d.]+)', contenido),
    }
    n = len(campos["id"])
    for clave, valores in campos.items():
        if len(valores) != n:
            print(f"ERROR parseando jugadores.ts: {clave} tiene {len(valores)} valores, esperaba {n}")
            sys.exit(1)
    fecha = re.search(r'DATOS_ACTUALIZADOS_AL = "([^"]+)"', contenido)
    bios = [
        {c: campos[c][i] for c in campos}
        for i in range(n)
    ]
    return bios, (fecha.group(1) if fecha else "")


def render_bloque(bio, datos, rating, percentil, conf_global, detalle):
    s = datos["stats"]
    sup = datos["superficie"]
    m = s["masters1000"]
    L = []
    a = L.append
    a("  {")
    a(f'    id: "{bio["id"]}",')
    a(f'    nombre: "{bio["nombre"]}",')
    a(f'    pais: "{bio["pais"]}",')
    a(f'    mano: "{bio["mano"]}",')
    a(f'    proDesde: {bio["proDesde"]},')
    a(f'    ranking: {bio["ranking"]},')
    a(f'    grandSlams: {bio["grandSlams"]},')
    a(f'    semanas1: {bio["semanas1"]},')
    a("    stats: {")
    a(f"      tiebreaks: {f1(s['tiebreaks'])},")
    a(f"      setDecisivo: {f1(s['setDecisivo'])},")
    a(f"      remontadas: {f1(s['remontadas'])},")
    a(f"      vsTop10: {f1(s['vsTop10'])},")
    a(f"      finales: {f1(s['finales'])},")
    a(f"      indoor: {f1(sup['indoor']['pct'])},")
    a(f"      quintosSetGS: {f1(s['quintosSetGS'])},")
    a(f"      bpSalvados: {f1(s['bpSalvados'])},")
    a(f"      bpConvertidos: {f1(s['bpConvertidos'])},")
    a(f"      svGanados: {f1(s['svGanados'])},")
    a(f"      devGanados: {f1(s['devGanados'])},")
    a(f"      masters1000: {{ pct: {f1(m['pct'])}, victorias: {m['victorias']}, derrotas: {m['derrotas']} }},")
    a("    },")
    a("    superficie: {")
    for clave in ["dura", "arcilla", "cesped", "indoor"]:
        d = sup[clave]
        a(f"      {clave}: {{ pct: {f1(d['pct'])}, victorias: {d['victorias']}, derrotas: {d['derrotas']} }},")
    v = sup["vsTop10PorSuperficie"]
    a("      vsTop10PorSuperficie: {")
    a(f"        dura: {f1(v['dura'])},")
    a(f"        arcilla: {f1(v['arcilla'])},")
    a(f"        cesped: {f1(v['cesped'])},")
    a("      },")
    a("    },")
    a("    clutchRating: {")
    a(f"      total: {f1(rating)},")
    a(f"      percentil: {f1(percentil)},")
    a(f'      confianzaGlobal: "{conf_global}",')
    a("      detalle: {")
    for stat in ["tiebreaks", "setDecisivo", "finales", "remontadas", "bpSalvados", "bpConvertidos"]:
        d = detalle[stat]
        norm = f1(d["normalizado"]) if d["normalizado"] is not None else "null"
        a(f'        {stat}: {{ normalizado: {norm}, confianza: "{d["confianza"]}" }},')
    a("      },")
    a("    },")
    a("  },")
    return "\n".join(L)


if __name__ == "__main__":
    bios, fecha = leer_bios()
    print(f"Bios leídas: {len(bios)} jugadores (datos al {fecha})")

    if not os.path.exists(RUTA_CSV):
        print("ERROR: falta distribucion_historica.csv — correr primero distribucion_historica.py")
        sys.exit(1)
    tabla = pd.read_csv(RUTA_CSV)
    elegibles = tabla[tabla["partidos"] >= MATCHES_MINIMO_RATING].copy()
    referencias = construir_referencias(elegibles)

    ratings = []
    for _, f in elegibles.iterrows():
        r, _ = calcular_clutch(f, referencias)
        ratings.append(r)
    elegibles["clutch_rating"] = ratings
    promedio_atp = round(elegibles["clutch_rating"].mean(), 1)
    print(f"Población de referencia: {len(elegibles)} elegibles | Promedio ATP: {promedio_atp}\n")

    df = cargar_todo()

    bloques = []
    print(f"{'Jugador':28s} {'Clutch viejo':>12s} {'Clutch nuevo':>12s}")
    for bio in bios:
        nombre = NOMBRES_DATASET.get(bio["nombre"], bio["nombre"])
        datos = calcular_datos(nombre, df)
        if datos is None:
            print(f"ERROR: sin partidos para {nombre}")
            sys.exit(1)
        fila_orig = tabla[tabla["nombre"] == nombre]
        if len(fila_orig) == 0:
            print(f"ERROR: {nombre} no está en distribucion_historica.csv")
            sys.exit(1)
        fila = fila_orig.iloc[0]
        rating, detalle = calcular_clutch(fila, referencias)
        percentil = round((elegibles["clutch_rating"] < rating).mean() * 100, 1)
        conf_global, _ = confianza_global(detalle)
        print(f"{nombre:28s} {bio['clutch_viejo']:>12s} {f1(rating):>12s}")
        bloques.append(render_bloque(bio, datos, rating, percentil, conf_global, detalle))

    # Backup y escritura
    import shutil
    shutil.copy(RUTA_JUGADORES, RUTA_JUGADORES + ".bak")

    contenido = (
        f"export const CLUTCH_RATING_PROMEDIO_ATP = {promedio_atp};\n"
        f'export const DATOS_ACTUALIZADOS_AL = "{fecha}";\n'
        "export const jugadores = [\n"
        + "\n".join(bloques)
        + "\n];\n"
    )
    with open(RUTA_JUGADORES, "w", encoding="utf-8") as f:
        f.write(contenido)

    print(f"\nEscrito jugadores.ts ({len(contenido)} caracteres). Backup en jugadores.ts.bak")
    print("Verificar la tabla de arriba y localhost antes de commitear.")
