import pandas as pd
import os
from collections import defaultdict

from calcular_stats import cargar_todo, parsear_sets

ANIO_CORTE = 2000

UMBRALES = {
    "tiebreaks":     {"partidos": 100, "n_min": 30},
    "setDecisivo":   {"partidos": 100, "n_min": 30},
    "finales":       {"partidos": 0,   "n_min": 10},
    "remontadas":    {"partidos": 100, "n_min": 25},
    "bpSalvados":    {"partidos": 100, "n_min": 0},
    "bpConvertidos": {"partidos": 100, "n_min": 0},
}


def calcular_distribucion(df):
    stats = defaultdict(lambda: {
        "partidos": 0,
        "tb_g": 0, "tb_j": 0,
        "dec_g": 0, "dec_j": 0,
        "fin_g": 0, "fin_j": 0,
        "rem_ex": 0, "rem_op": 0,
        "bp_s": 0.0, "bp_f": 0.0,
        "bp_c": 0.0, "bp_rf": 0.0,
    })

    for _, r in df.iterrows():
        sets = parsear_sets(r.get("score"))
        if not sets:
            continue

        try:
            bo = int(r.get("best_of", 3))
        except (TypeError, ValueError):
            bo = 3

        es_final = (r.get("round") == "F")
        ganador = r.get("winner_name")
        perdedor = r.get("loser_name")
        if pd.isna(ganador) or pd.isna(perdedor):
            continue

        for nombre, gano in [(ganador, True), (perdedor, False)]:
            s = stats[nombre]
            s["partidos"] += 1

            for w, l, tb in sets:
                if not tb:
                    continue
                s["tb_j"] += 1
                gano_set = w > l
                if (gano and gano_set) or (not gano and not gano_set):
                    s["tb_g"] += 1

            if (bo == 3 and len(sets) == 3) or (bo == 5 and len(sets) == 5):
                s["dec_j"] += 1
                if gano:
                    s["dec_g"] += 1

            if es_final:
                s["fin_j"] += 1
                if gano:
                    s["fin_g"] += 1

            if bo == 3 and len(sets) >= 1:
                w1, l1, _ = sets[0]
                perdio = (w1 < l1) if gano else (w1 > l1)
                if perdio:
                    s["rem_op"] += 1
                    if gano:
                        s["rem_ex"] += 1
            elif bo == 5 and len(sets) >= 2:
                perdidos = 0
                for i in range(2):
                    w_i, l_i, _ = sets[i]
                    perdio_set = (w_i < l_i) if gano else (w_i > l_i)
                    if perdio_set:
                        perdidos += 1
                if perdidos == 2:
                    s["rem_op"] += 1
                    if gano:
                        s["rem_ex"] += 1

            pref = "w_" if gano else "l_"
            rpref = "l_" if gano else "w_"

            def n(col):
                return pd.to_numeric(r.get(col), errors="coerce")

            bp_saved = n(pref + "bpSaved")
            bp_faced = n(pref + "bpFaced")
            if pd.notna(bp_saved) and pd.notna(bp_faced):
                s["bp_s"] += bp_saved
                s["bp_f"] += bp_faced

            rbp_saved = n(rpref + "bpSaved")
            rbp_faced = n(rpref + "bpFaced")
            if pd.notna(rbp_saved) and pd.notna(rbp_faced):
                s["bp_c"] += (rbp_faced - rbp_saved)
                s["bp_rf"] += rbp_faced

    return stats


def armar_tabla(stats):
    filas = []
    for nombre, s in stats.items():
        filas.append({
            "nombre": nombre,
            "partidos": s["partidos"],
            "tiebreaks_pct": round(100 * s["tb_g"] / s["tb_j"], 1) if s["tb_j"] else None,
            "tiebreaks_n": s["tb_j"],
            "setDecisivo_pct": round(100 * s["dec_g"] / s["dec_j"], 1) if s["dec_j"] else None,
            "setDecisivo_n": s["dec_j"],
            "finales_pct": round(100 * s["fin_g"] / s["fin_j"], 1) if s["fin_j"] else None,
            "finales_n": s["fin_j"],
            "remontadas_pct": round(100 * s["rem_ex"] / s["rem_op"], 1) if s["rem_op"] else None,
            "remontadas_n": s["rem_op"],
            "bpSalvados_pct": round(100 * s["bp_s"] / s["bp_f"], 1) if s["bp_f"] else None,
            "bpConvertidos_pct": round(100 * s["bp_c"] / s["bp_rf"], 1) if s["bp_rf"] else None,
        })
    return pd.DataFrame(filas)


def calcular_percentiles(tabla):
    resultados = {}
    for stat, umbral in UMBRALES.items():
        col_pct = f"{stat}_pct"
        col_n = f"{stat}_n" if f"{stat}_n" in tabla.columns else None

        filtrada = tabla[tabla["partidos"] >= umbral["partidos"]]
        if col_n and umbral["n_min"] > 0:
            filtrada = filtrada[filtrada[col_n] >= umbral["n_min"]]
        filtrada = filtrada.dropna(subset=[col_pct])

        if len(filtrada) == 0:
            resultados[stat] = {"p5": None, "p50": None, "p95": None, "n_jugadores": 0}
            continue

        resultados[stat] = {
            "p5": round(filtrada[col_pct].quantile(0.05), 1),
            "p50": round(filtrada[col_pct].quantile(0.50), 1),
            "p95": round(filtrada[col_pct].quantile(0.95), 1),
            "n_jugadores": len(filtrada),
        }
    return resultados


if __name__ == "__main__":
    df = cargar_todo()
    print(f"Partidos cargados (total): {len(df)}")

    df["tourney_date"] = pd.to_numeric(df["tourney_date"], errors="coerce")
    df["anio"] = (df["tourney_date"] // 10000).astype("Int64")
    df = df[df["anio"] >= ANIO_CORTE].copy()
    print(f"Partidos desde {ANIO_CORTE}: {len(df)}")

    stats = calcular_distribucion(df)
    tabla = armar_tabla(stats)
    tabla.to_csv(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         "distribucion_historica.csv"), index=False)
    print(f"Guardado distribucion_historica.csv con {len(tabla)} jugadores")

    print("\n--- Percentiles (con umbrales aplicados) ---")
    percentiles = calcular_percentiles(tabla)
    for stat, p in percentiles.items():
        print(f"{stat}: P5={p['p5']} P50={p['p50']} P95={p['p95']} (n jugadores={p['n_jugadores']})")

    print("\n--- Validación cruzada (deberían parecerse a calcular_stats.py) ---")
    conocidos = ["Roger Federer", "Rafael Nadal", "Novak Djokovic", "Carlos Alcaraz", "Jannik Sinner", "Daniil Medvedev"]
    for nombre in conocidos:
        fila = tabla[tabla["nombre"] == nombre]
        if len(fila):
            print(fila.to_string(index=False))
        else:
            print(f"{nombre}: no encontrado")