import pandas as pd
import os

DIR = os.path.dirname(os.path.abspath(__file__))

PERCENTILES = {
    "tiebreaks":     {"p5": 39.6, "p50": 50.0, "p95": 59.8, "k": 30},
    "setDecisivo":   {"p5": 35.0, "p50": 50.0, "p95": 62.0, "k": 30},
    "finales":       {"p5": 27.3, "p50": 45.5, "p95": 69.7, "k": 10},
    "remontadas":    {"p5": 8.4,  "p50": 16.4, "p95": 27.5, "k": 25},
    "bpSalvados":    {"p5": 56.0, "p50": 60.4, "p95": 65.9, "k": 0},
    "bpConvertidos": {"p5": 34.5, "p50": 39.2, "p95": 42.7, "k": 0},
}

UMBRALES_MIN = {
    "tiebreaks": 30, "setDecisivo": 30, "finales": 10, "remontadas": 25,
    "bpSalvados": 100, "bpConvertidos": 100,
}

PESOS = {
    "setDecisivo": 0.25,
    "finales": 0.25,
    "tiebreaks": 0.20,
    "bpSalvados": 0.10,
    "bpConvertidos": 0.10,
    "remontadas": 0.10,
}


def shrink(pct, n, k, mediana):
    if k == 0 or n is None or pd.isna(pct) or pd.isna(n):
        return pct
    aciertos = (pct / 100) * n
    return 100 * (aciertos + k * (mediana / 100)) / (n + k)


def normalizar(pct_ajustado, p5, p95):
    if pct_ajustado is None or pd.isna(pct_ajustado):
        return None
    val = (pct_ajustado - p5) / (p95 - p5) * 100
    return max(0, min(100, val))


def confianza(n, umbral):
    if n is None or pd.isna(n):
        return "insuficiente"
    if n >= 2 * umbral:
        return "alta"
    elif n >= umbral:
        return "moderada"
    else:
        return "insuficiente"


def calcular_clutch(fila):
    total = 0.0
    detalle = {}
    for stat, cfg in PERCENTILES.items():
        pct = fila.get(f"{stat}_pct")
        n_col = f"{stat}_n" if f"{stat}_n" in fila.index else "partidos"
        n = fila.get(n_col)

        ajustado = shrink(pct, n, cfg["k"], cfg["p50"])
        normalizado = normalizar(ajustado, cfg["p5"], cfg["p95"])

        peso = PESOS[stat]
        if normalizado is not None:
            total += normalizado * peso

        detalle[stat] = {
            "crudo": pct,
            "n": n,
            "ajustado": round(ajustado, 1) if ajustado is not None and pd.notna(ajustado) else None,
            "normalizado": round(normalizado, 1) if normalizado is not None else None,
            "confianza": confianza(n, UMBRALES_MIN[stat]),
        }

    return round(total, 1), detalle


if __name__ == "__main__":
    tabla = pd.read_csv(os.path.join(DIR, "distribucion_historica.csv"))

    conocidos = ["Roger Federer", "Rafael Nadal", "Novak Djokovic", "Carlos Alcaraz", "Jannik Sinner", "Daniil Medvedev"]

    for nombre in conocidos:
        fila = tabla[tabla["nombre"] == nombre]
        if len(fila) == 0:
            print(f"{nombre}: no encontrado")
            continue
        fila = fila.iloc[0]
        rating, detalle = calcular_clutch(fila)
        print(f"\n{fila['nombre']}: Clutch Rating = {rating}")
        for stat, d in detalle.items():
            print(f"  {stat}: crudo={d['crudo']} n={d['n']} -> ajustado={d['ajustado']} -> normalizado={d['normalizado']} ({d['confianza']})")