"""
Generador de bloques TypeScript para jugadores.ts

Uso:
    python3 scripts/generar_jugador.py "Andy Murray"

Calcula todas las estadisticas del jugador (misma logica que calcular_stats.py),
su Clutch Rating (misma logica que clutch_rating.py, leyendo la fila del jugador
desde distribucion_historica.csv para garantizar consistencia con los 6 originales),
e imprime el objeto TypeScript listo para pegar en app/data/jugadores.ts.

Los datos biograficos (pais, mano, proDesde, ranking, grandSlams, semanas1)
quedan como COMPLETAR: son "Type 1 facts" que se verifican contra fuentes
oficiales, no contra el dataset.
"""
import sys
import os
import unicodedata
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from calcular_stats import cargar_todo, parsear_sets, es_indoor, safe_pct
from clutch_rating import (
    MATCHES_MINIMO_RATING,
    construir_referencias,
    calcular_clutch,
    confianza_global,
)

DIR = os.path.dirname(os.path.abspath(__file__))


def calcular_datos(nombre, df):
    """Port fiel de calcular() de calcular_stats.py, devolviendo un dict
    en vez de imprimir. Si se cambia la metodologia alla, actualizar aca."""
    mask = (df["winner_name"] == nombre) | (df["loser_name"] == nombre)
    p = df[mask].copy()
    if len(p) == 0:
        return None
    p["gano"] = p["winner_name"] == nombre

    tb_g = tb_j = dec_g = dec_j = rem_op = rem_ex = 0
    for _, r in p.iterrows():
        sets = parsear_sets(r["score"])
        if not sets:
            continue
        gano = r["gano"]
        bo = r.get("best_of", 3)
        for w, l, tb in sets:
            if not tb:
                continue
            tb_j += 1
            gano_set = w > l
            if (gano and gano_set) or (not gano and not gano_set):
                tb_g += 1
        if (bo == 3 and len(sets) == 3) or (bo == 5 and len(sets) == 5):
            dec_j += 1
            if gano:
                dec_g += 1
        if bo == 3 and len(sets) >= 1:
            w1, l1, _ = sets[0]
            perdio = (w1 < l1) if gano else (w1 > l1)
            if perdio:
                rem_op += 1
                if gano:
                    rem_ex += 1
        elif bo == 5 and len(sets) >= 2:
            perdidos = sum(1 for i in range(2) for w, l, _ in [sets[i]] if (w < l if gano else w > l))
            if perdidos == 2:
                rem_op += 1
                if gano:
                    rem_ex += 1

    vt10 = p[((p["gano"]) & (pd.to_numeric(p["loser_rank"], errors="coerce") <= 10))
             | ((~p["gano"]) & (pd.to_numeric(p["winner_rank"], errors="coerce") <= 10))]
    fin = p[p["round"] == "F"]
    gs5 = p[(p["tourney_level"] == "G") & (pd.to_numeric(p["best_of"], errors="coerce") == 5)].copy()
    gs5["ns"] = gs5["score"].apply(lambda s: len(parsear_sets(s)))
    gs5 = gs5[gs5["ns"] == 5]

    bp_s = bp_f = bp_c = bp_rf = sv_t = sv_p = dv_t = dv_g = 0
    for _, r in p.iterrows():
        pref = "w_" if r["gano"] else "l_"
        rpref = "l_" if r["gano"] else "w_"

        def n(k):
            return pd.to_numeric(r.get(k), errors="coerce")

        if pd.notna(n(pref + "bpSaved")) and pd.notna(n(pref + "bpFaced")):
            bp_s += n(pref + "bpSaved")
            bp_f += n(pref + "bpFaced")
        if pd.notna(n(pref + "SvGms")):
            sv_t += n(pref + "SvGms")
        if pd.notna(n(pref + "bpFaced")) and pd.notna(n(pref + "bpSaved")):
            sv_p += (n(pref + "bpFaced") - n(pref + "bpSaved"))
        if pd.notna(n(rpref + "bpFaced")) and pd.notna(n(rpref + "bpSaved")):
            bp_c += (n(rpref + "bpFaced") - n(rpref + "bpSaved"))
            bp_rf += n(rpref + "bpFaced")
        if pd.notna(n(rpref + "SvGms")):
            dv_t += n(rpref + "SvGms")
            if pd.notna(n(rpref + "bpFaced")) and pd.notna(n(rpref + "bpSaved")):
                dv_g += (n(rpref + "bpFaced") - n(rpref + "bpSaved"))

    mas = p[p["tourney_level"] == "M"]
    p["es_indoor"] = p.apply(es_indoor, axis=1)

    def pv(sub):
        t = len(sub)
        v = int(sub["gano"].sum())
        return {"pct": round(100 * v / t, 1) if t else 0.0, "victorias": v, "derrotas": t - v}

    return {
        "partidos": len(p),
        "stats": {
            "tiebreaks": safe_pct(tb_g, tb_j),
            "setDecisivo": safe_pct(dec_g, dec_j),
            "remontadas": safe_pct(rem_ex, rem_op),
            "vsTop10": safe_pct(int(vt10["gano"].sum()), len(vt10)),
            "finales": safe_pct(int(fin["gano"].sum()), len(fin)),
            "quintosSetGS": safe_pct(int(gs5["gano"].sum()), len(gs5)),
            "bpSalvados": safe_pct(bp_s, bp_f),
            "bpConvertidos": safe_pct(bp_c, bp_rf),
            "svGanados": safe_pct(sv_t - sv_p, sv_t),
            "devGanados": safe_pct(dv_g, dv_t),
            "masters1000": pv(mas),
        },
        "muestras": {
            "tiebreaks": tb_j, "setDecisivo": dec_j, "finales": len(fin),
            "remontadas": rem_op, "quintosSetGS": len(gs5),
        },
        "superficie": {
            "dura": pv(p[p["surface"] == "Hard"]),
            "arcilla": pv(p[p["surface"] == "Clay"]),
            "cesped": pv(p[p["surface"] == "Grass"]),
            "indoor": pv(p[p["es_indoor"]]),
            "vsTop10PorSuperficie": {
                "dura": pv(vt10[vt10["surface"] == "Hard"])["pct"],
                "arcilla": pv(vt10[vt10["surface"] == "Clay"])["pct"],
                "cesped": pv(vt10[vt10["surface"] == "Grass"])["pct"],
            },
        },
    }


def calcular_clutch_jugador(nombre):
    """Lee la fila del jugador en distribucion_historica.csv y calcula su
    Clutch Rating contra la poblacion de referencia — identico proceso al
    de los 6 jugadores originales."""
    ruta = os.path.join(DIR, "distribucion_historica.csv")
    if not os.path.exists(ruta):
        print("ERROR: no existe distribucion_historica.csv. Correr primero:")
        print("  python3 scripts/distribucion_historica.py")
        sys.exit(1)
    tabla = pd.read_csv(ruta)

    fila_orig = tabla[tabla["nombre"] == nombre]
    if len(fila_orig) == 0:
        apellido = nombre.split()[-1]
        parecidos = tabla[tabla["nombre"].str.contains(apellido, case=False, na=False)]["nombre"].tolist()
        print(f"ERROR: '{nombre}' no aparece en distribucion_historica.csv.")
        if parecidos:
            print(f"Nombres parecidos encontrados: {parecidos}")
            print("Proba de nuevo con el nombre exacto del dataset.")
        else:
            print("Ojo: si el jugador jugo antes de 2000 o el CSV esta viejo,")
            print("regenera con: python3 scripts/distribucion_historica.py")
        sys.exit(1)
    fila = fila_orig.iloc[0]

    elegibles = tabla[tabla["partidos"] >= MATCHES_MINIMO_RATING].copy()
    referencias = construir_referencias(elegibles)

    ratings = []
    for _, f in elegibles.iterrows():
        r, _ = calcular_clutch(f, referencias)
        ratings.append(r)
    elegibles["clutch_rating"] = ratings

    rating, detalle = calcular_clutch(fila, referencias)
    percentil = round((elegibles["clutch_rating"] < rating).mean() * 100, 1)
    conf_global, _ = confianza_global(detalle)
    return rating, percentil, conf_global, detalle


def sugerir_id(nombre):
    apellido = nombre.split()[-1].lower()
    return unicodedata.normalize("NFKD", apellido).encode("ascii", "ignore").decode()


def f1(v):
    return f"{v:.1f}"


def render_ts(nombre, datos, rating, percentil, conf_global, detalle):
    s = datos["stats"]
    sup = datos["superficie"]
    m = s["masters1000"]
    lineas = []
    a = lineas.append
    a("  {")
    a(f'    id: "{sugerir_id(nombre)}", // revisar que no choque con otro id')
    a(f'    nombre: "{nombre}",')
    a('    pais: "", // COMPLETAR')
    a('    mano: "", // COMPLETAR: "R" o "L"')
    a("    proDesde: 0, // COMPLETAR")
    a("    ranking: 0, // COMPLETAR (-1 si esta retirado)")
    a("    grandSlams: 0, // COMPLETAR (verificar fuente oficial)")
    a("    semanas1: 0, // COMPLETAR (verificar fuente oficial)")
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
    return "\n".join(lineas)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Uso: python3 scripts/generar_jugador.py "Nombre Apellido"')
        sys.exit(1)
    nombre = sys.argv[1]

    df = cargar_todo()
    datos = calcular_datos(nombre, df)
    if datos is None:
        print(f"No encontre partidos para '{nombre}'. Verifica el nombre exacto del dataset.")
        candidatos = sorted(set(
            list(df[df["winner_name"].str.contains(nombre.split()[-1], case=False, na=False)]["winner_name"].unique())
        ))[:10]
        if candidatos:
            print(f"Nombres parecidos: {candidatos}")
        sys.exit(1)

    rating, percentil, conf_global, detalle = calcular_clutch_jugador(nombre)

    print(f"\n{'='*60}")
    print(f"{nombre} — {datos['partidos']} partidos en el dataset")
    print(f"Clutch Rating: {rating} | Percentil {percentil} | Confianza: {conf_global}")
    print(f"{'='*60}")

    avisos = []
    for stat, d in detalle.items():
        if d["confianza"] != "alta":
            avisos.append(f"  - {stat}: confianza {d['confianza']} (n={d['n']})")
    if avisos:
        print("\nAVISOS (muestras chicas, revisar):")
        print("\n".join(avisos))

    print("\n--- BLOQUE PARA PEGAR EN app/data/jugadores.ts ---\n")
    print(render_ts(nombre, datos, rating, percentil, conf_global, detalle))
    print("\n--- FIN DEL BLOQUE ---")
    print("\nRecordatorios:")
    print("  1. Completar los campos marcados COMPLETAR (bio, verificar fuentes oficiales)")
    print("  2. Revisar el id sugerido")
    print("  3. Verificar el perfil en localhost:3000/jugadores/<id> antes de commitear")
