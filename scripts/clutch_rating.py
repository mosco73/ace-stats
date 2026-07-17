import pandas as pd
import os

DIR = os.path.dirname(os.path.abspath(__file__))

# CAMBIO V1.1: la normalizacion ya no usa interpolacion lineal P5-P95 (saturaba
# en 100 para jugadores elite). Ahora cada subscore es el percentil real del
# jugador dentro de la poblacion de referencia, calculado sobre valores
# post-shrinkage para comparar manzanas con manzanas.
# p50 y k se mantienen identicos: el shrinkage no cambia.

SHRINKAGE = {
    "tiebreaks":     {"p50": 50.0, "k": 30},
    "setDecisivo":   {"p50": 50.0, "k": 30},
    "finales":       {"p50": 45.5, "k": 10},
    "remontadas":    {"p50": 16.5, "k": 25},
    "bpSalvados":    {"p50": 60.4, "k": 0},
    "bpConvertidos": {"p50": 39.2, "k": 0},
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

CONFIANZA_VALOR = {"alta": 1.0, "moderada": 0.5, "insuficiente": 0.0}
MATCHES_MINIMO_RATING = 100  # minimo de partidos desde 2000 para entrar al ranking ATP-wide


def shrink(pct, n, k, mediana):
    if k == 0 or n is None or pd.isna(pct) or pd.isna(n):
        return pct
    aciertos = (pct / 100) * n
    return 100 * (aciertos + k * (mediana / 100)) / (n + k)


def col_n(fila_o_tabla, stat):
    nombre_col = f"{stat}_n"
    columnas = fila_o_tabla.index if isinstance(fila_o_tabla, pd.Series) else fila_o_tabla.columns
    return nombre_col if nombre_col in columnas else "partidos"


def construir_referencias(elegibles):
    """Para cada stat, aplica shrinkage a toda la poblacion elegible y devuelve
    la distribucion de valores ajustados (solo jugadores que superan el umbral
    minimo de muestra para esa stat, igual que hacia distribucion_historica.py).
    """
    referencias = {}
    for stat, cfg in SHRINKAGE.items():
        ncol = col_n(elegibles, stat)
        sub = elegibles[[f"{stat}_pct", ncol]].dropna()
        sub = sub[sub[ncol] >= UMBRALES_MIN[stat]]
        ajustados = sub.apply(
            lambda r: shrink(r[f"{stat}_pct"], r[ncol], cfg["k"], cfg["p50"]), axis=1
        )
        referencias[stat] = ajustados.sort_values().to_numpy()
    return referencias


def normalizar_percentil(val, referencia):
    """Percentil del valor dentro de la distribucion de referencia.
    Usa midrank para empates: (menores + 0.5 * iguales) / total * 100.
    """
    if val is None or pd.isna(val) or len(referencia) == 0:
        return None
    menores = (referencia < val).sum()
    iguales = (referencia == val).sum()
    return 100 * (menores + 0.5 * iguales) / len(referencia)


def confianza(n, umbral):
    if n is None or pd.isna(n):
        return "insuficiente"
    if n >= 2 * umbral:
        return "alta"
    elif n >= umbral:
        return "moderada"
    else:
        return "insuficiente"


def calcular_clutch(fila, referencias):
    total = 0.0
    detalle = {}
    for stat, cfg in SHRINKAGE.items():
        pct = fila.get(f"{stat}_pct")
        n = fila.get(col_n(fila, stat))

        ajustado = shrink(pct, n, cfg["k"], cfg["p50"])
        normalizado = normalizar_percentil(ajustado, referencias[stat])

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


def confianza_global(detalle):
    total_valor = 0.0
    total_peso = 0.0
    for stat, d in detalle.items():
        peso = PESOS[stat]
        valor = CONFIANZA_VALOR[d["confianza"]]
        total_valor += peso * valor
        total_peso += peso
    promedio = total_valor / total_peso if total_peso else 0.0
    if promedio >= 0.75:
        return "alta", round(promedio, 2)
    elif promedio >= 0.4:
        return "moderada", round(promedio, 2)
    else:
        return "insuficiente", round(promedio, 2)


if __name__ == "__main__":
    tabla = pd.read_csv(os.path.join(DIR, "distribucion_historica.csv"))

    elegibles = tabla[tabla["partidos"] >= MATCHES_MINIMO_RATING].copy()
    print(f"Jugadores elegibles (>= {MATCHES_MINIMO_RATING} partidos desde 2000): {len(elegibles)} de {len(tabla)} totales")

    referencias = construir_referencias(elegibles)
    for stat, ref in referencias.items():
        print(f"  Referencia {stat}: {len(ref)} jugadores")
    print()

    ratings = []
    for _, fila in elegibles.iterrows():
        rating, _ = calcular_clutch(fila, referencias)
        ratings.append(rating)
    elegibles["clutch_rating"] = ratings

    promedio_atp = round(elegibles["clutch_rating"].mean(), 1)
    print(f"Promedio ATP de Clutch Rating: {promedio_atp}\n")

    conocidos = ["Roger Federer", "Rafael Nadal", "Novak Djokovic", "Carlos Alcaraz", "Jannik Sinner", "Daniil Medvedev"]
    for nombre in conocidos:
        fila_orig = tabla[tabla["nombre"] == nombre]
        if len(fila_orig) == 0:
            print(f"{nombre}: no encontrado")
            continue
        fila = fila_orig.iloc[0]

        rating, detalle = calcular_clutch(fila, referencias)
        percentil = (elegibles["clutch_rating"] < rating).mean() * 100
        conf_global, conf_valor = confianza_global(detalle)

        print(f"{nombre}: Clutch Rating = {rating} | Percentil {percentil:.1f} | Confianza global: {conf_global} ({conf_valor})")
        for stat, d in detalle.items():
            print(f"  {stat}: crudo={d['crudo']} ajustado={d['ajustado']} normalizado={d['normalizado']} ({d['confianza']})")
        print()
