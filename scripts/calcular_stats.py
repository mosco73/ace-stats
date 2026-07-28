import pandas as pd
import os
import re
import json

HISTORICO_DIR = os.path.expanduser("~/Downloads/archive/tennis_atp")
FRESCOS_DIR = os.path.expanduser("~/Desktop/ace-stats/datos-frescos")

PLAYERS = [
    "Roger Federer",
    "Rafael Nadal",
    "Novak Djokovic",
    "Carlos Alcaraz",
    "Jannik Sinner",
    "Daniil Medvedev",
]

TORNEOS_INDOOR = {
    "paris masters","masters cup","tour finals","atp finals","rotterdam",
    "basel","vienna","stockholm","memphis","san jose","marseille","metz",
    "antwerp","sofia","montpellier","lyon","st. petersburg","moscow",
    "milan","stuttgart indoor","cologne","bercy","tokyo indoor","brussels",
    "copenhagen","zagreb","marbella","toulouse","lille","next gen finals",
}

def es_indoor(row):
    # TML trae el dato real en la columna 'indoor' para casi todos los anios
    # (queda vacio en un 5-10%). Ese dato manda sobre cualquier inferencia.
    if pd.notna(row.get("indoor")):
        return str(row["indoor"]).strip().upper() == "I"
    # De aca para abajo es inferencia, para las filas sin dato.
    nombre = str(row.get("tourney_name", "")).lower()
    # Regla general: si el torneo se llama "... Indoor", es indoor.
    # Cubre casos como "Paris Indoor" que la lista de nombres no agarraba.
    if "indoor" in nombre:
        return True
    # La superficie Carpet era portatil y se instalaba adentro de estadios:
    # practicamente todo el Carpet historico fue bajo techo (Wembley, WCT,
    # Philadelphia, San Francisco). Lo tomamos como senal de indoor. Es
    # inferencia, no dato duro -- documentado en /metodologia.
    if str(row.get("surface", "")).strip().lower() == "carpet":
        return True
    return any(t in nombre for t in TORNEOS_INDOOR)

def es_set_completo(w, l):
    alto = max(w, l)
    if alto < 6: return False
    if alto == 6: return abs(w-l) >= 2
    if alto == 7: return abs(w-l) in (1,2)
    return abs(w-l) == 2

def parsear_sets(score):
    if pd.isna(score): return []
    score = str(score).strip()
    incompleto = bool(re.search(r"RET|DEF|W/O|ABN|WALKOVER", score, re.IGNORECASE))
    tokens = re.findall(r"(\d+)-(\d+)(?:\((\d+)\))?", score)
    sets = [(int(w), int(l), tb is not None and tb != "") for w,l,tb in tokens]
    if incompleto and sets:
        w,l,_ = sets[-1]
        if not es_set_completo(w,l): sets = sets[:-1]
    return sets

ANIO_INICIAL = 1968


def cargar_todo():
    """
    Carga el dataset completo desde TennisMyLife (fuente unica).

    Antes mezclaba dos fuentes: Sackmann (1968-2023) + TML (2024+). TML
    cubre 1968 en adelante con las mismas columnas mas 'indoor', asi que
    la mezcla dejo de tener sentido. Ver /metodologia.

    Los anios salen de lo que hay en disco, no de una lista hardcodeada:
    asi no hay que tocar este archivo cada enero. Pero exige que la serie
    este completa desde ANIO_INICIAL, sin huecos. Fail-closed: preferimos
    no calcular antes que calcular sobre datos incompletos.
    """
    if not os.path.isdir(FRESCOS_DIR):
        raise FileNotFoundError(
            f"No existe el directorio de datos: {FRESCOS_DIR}\n"
            "Baja el historico: python3 scripts/bajar_historico_tml.py"
        )

    anios = sorted(
        int(f[4:8]) for f in os.listdir(FRESCOS_DIR)
        if f.startswith("tml_") and f.endswith(".csv") and f[4:8].isdigit()
    )
    if not anios:
        raise FileNotFoundError(
            f"No hay ningun tml_YYYY.csv en {FRESCOS_DIR}\n"
            "Baja el historico: python3 scripts/bajar_historico_tml.py"
        )
    if anios[0] != ANIO_INICIAL:
        raise FileNotFoundError(
            f"El historico arranca en {anios[0]} y esperaba {ANIO_INICIAL}.\n"
            "Baja el historico: python3 scripts/bajar_historico_tml.py"
        )
    huecos = [y for y in range(anios[0], anios[-1] + 1) if y not in anios]
    if huecos:
        raise FileNotFoundError(
            f"Faltan anios en el medio: {huecos}\n"
            "Baja el historico: python3 scripts/bajar_historico_tml.py"
        )

    print(f"Cargando datos TML {anios[0]}-{anios[-1]}...")
    dfs = []
    for y in anios:
        df = pd.read_csv(os.path.join(FRESCOS_DIR, f"tml_{y}.csv"), low_memory=False)
        df["fuente"] = "tml"
        dfs.append(df)
    print(f"  {len(dfs)} archivos")
    df = pd.concat(dfs, ignore_index=True)
    # Los CSV historicos y los frescos escriben distinto las particulas del
    # apellido ("Alex De Minaur" vs "Alex de Minaur"), lo que partia la carrera
    # de esos jugadores en dos y hacia que se perdieran partidos. Unificamos
    # cada grupo a la variante mas frecuente (gana la historica, que tiene mas
    # partidos, y es la que usan nombre_dataset y NOMBRES_DATASET).
    conteo = pd.concat([df["winner_name"], df["loser_name"]]).dropna().value_counts()
    canonico = {}
    for nombre in conteo.index:
        k = nombre.lower()
        if k not in canonico:
            canonico[k] = nombre
    mapa = {n: canonico[n.lower()] for n in conteo.index}
    unificados = sum(1 for n, c in mapa.items() if n != c)
    if unificados:
        print(f"Nombres unificados: {unificados}")
    df["winner_name"] = df["winner_name"].map(mapa).fillna(df["winner_name"])
    df["loser_name"] = df["loser_name"].map(mapa).fillna(df["loser_name"])
    df["anio"] = pd.to_numeric(df["tourney_date"], errors="coerce") // 10000
    print(f"Total: {len(df)} partidos\n")
    return df

def safe_pct(n, d):
    return round(100*n/d, 1) if d else 0.0

def calcular(nombre, df, anio=None):
    mask = (df["winner_name"]==nombre)|(df["loser_name"]==nombre)
    p = df[mask].copy()
    if anio is not None:
        p = p[p["anio"]==anio]
    if len(p)==0:
        etiqueta = f"{nombre} en {anio}" if anio else nombre
        print(f"No encontre partidos para {etiqueta}"); return
    p["gano"] = p["winner_name"]==nombre
    tb_g=tb_j=dec_g=dec_j=rem_op=rem_ex=0
    for _,r in p.iterrows():
        sets = parsear_sets(r["score"])
        if not sets: continue
        gano = r["gano"]
        bo = r.get("best_of",3)
        for w,l,tb in sets:
            if not tb: continue
            tb_j+=1
            gano_set = w>l
            if (gano and gano_set) or (not gano and not gano_set): tb_g+=1
        if (bo==3 and len(sets)==3) or (bo==5 and len(sets)==5):
            dec_j+=1
            if gano: dec_g+=1
        if bo==3 and len(sets)>=1:
            w1,l1,_ = sets[0]
            perdio = (w1<l1) if gano else (w1>l1)
            if perdio:
                rem_op+=1
                if gano: rem_ex+=1
        elif bo==5 and len(sets)>=2:
            perdidos=sum(1 for i in range(2) for w,l,_ in [sets[i]] if (w<l if gano else w>l))
            if perdidos==2:
                rem_op+=1
                if gano: rem_ex+=1
    vt10 = p[((p["gano"])&(pd.to_numeric(p["loser_rank"],errors="coerce")<=10))
             |((~p["gano"])&(pd.to_numeric(p["winner_rank"],errors="coerce")<=10))]
    fin = p[p["round"]=="F"]
    gs5 = p[(p["tourney_level"]=="G")&(pd.to_numeric(p["best_of"],errors="coerce")==5)].copy()
    gs5["ns"] = gs5["score"].apply(lambda s: len(parsear_sets(s)))
    gs5 = gs5[gs5["ns"]==5]
    bp_s=bp_f=bp_c=bp_rf=sv_t=sv_p=dv_t=dv_g=0
    for _,r in p.iterrows():
        pref = "w_" if r["gano"] else "l_"
        rpref = "l_" if r["gano"] else "w_"
        def n(k): return pd.to_numeric(r.get(k), errors="coerce")
        if pd.notna(n(pref+"bpSaved")) and pd.notna(n(pref+"bpFaced")):
            bp_s+=n(pref+"bpSaved"); bp_f+=n(pref+"bpFaced")
        if pd.notna(n(pref+"SvGms")): sv_t+=n(pref+"SvGms")
        if pd.notna(n(pref+"bpFaced")) and pd.notna(n(pref+"bpSaved")):
            sv_p+=(n(pref+"bpFaced")-n(pref+"bpSaved"))
        if pd.notna(n(rpref+"bpFaced")) and pd.notna(n(rpref+"bpSaved")):
            bp_c+=(n(rpref+"bpFaced")-n(rpref+"bpSaved")); bp_rf+=n(rpref+"bpFaced")
        if pd.notna(n(rpref+"SvGms")):
            dv_t+=n(rpref+"SvGms")
            if pd.notna(n(rpref+"bpFaced")) and pd.notna(n(rpref+"bpSaved")):
                dv_g+=(n(rpref+"bpFaced")-n(rpref+"bpSaved"))
    mas = p[p["tourney_level"]=="M"]
    p["es_indoor"] = p.apply(es_indoor, axis=1)
    def pv(sub): 
        t=len(sub); v=int(sub["gano"].sum())
        return {"pct":round(100*v/t,1)if t else 0,"victorias":v,"derrotas":t-v}
    titulo = f"{nombre} - Temporada {anio}" if anio else f"{nombre} (carrera)"
    print(f"\n{'='*50}\n{titulo} ({len(p)} partidos)\n{'='*50}")
    print(f"tiebreaks:    {safe_pct(tb_g,tb_j)}")
    print(f"setDecisivo:  {safe_pct(dec_g,dec_j)}")
    print(f"remontadas:   {safe_pct(rem_ex,rem_op)}")
    print(f"vsTop10:      {safe_pct(int(vt10['gano'].sum()),len(vt10))}")
    print(f"vsTop10Dura:    {pv(vt10[vt10['surface']=='Hard'])}")
    print(f"vsTop10Arcilla: {pv(vt10[vt10['surface']=='Clay'])}")
    print(f"vsTop10Cesped:  {pv(vt10[vt10['surface']=='Grass'])}")
    print(f"[MUESTRA] tiebreaks: {tb_g}/{tb_j}")
    print(f"[MUESTRA] setDecisivo: {dec_g}/{dec_j}")
    print(f"[MUESTRA] finales: {int(fin['gano'].sum())}/{len(fin)}")
    print(f"[MUESTRA] bpSalvados: {bp_s}/{bp_f}")
    print(f"[MUESTRA] bpConvertidos: {bp_c}/{bp_rf}")
    print(f"[MUESTRA] remontadas: {rem_ex}/{rem_op}")
    print(f"[MUESTRA] quintosSetGS: {int(gs5['gano'].sum())}/{len(gs5)}")
    print(f"finales:      {safe_pct(int(fin['gano'].sum()),len(fin))}")
    if anio is not None:
        victorias = int(p["gano"].sum())
        derrotas = len(p) - victorias
        titulos = int(fin["gano"].sum())
        rank_propio = p.apply(lambda r: pd.to_numeric(r["winner_rank"] if r["gano"] else r["loser_rank"], errors="coerce"), axis=1)
        mejor_ranking = int(rank_propio.min()) if rank_propio.notna().any() else None
        print(f"\n--- Resumen temporada {anio} ---")
        print(f"record:        {victorias}-{derrotas}")
        print(f"titulos:       {titulos}")
        print(f"mejor ranking: {mejor_ranking}")
    print(f"quintosSetGS: {safe_pct(int(gs5['gano'].sum()),len(gs5))}")
    print(f"bpSalvados:   {safe_pct(bp_s,bp_f)}")
    print(f"bpConvertidos:{safe_pct(bp_c,bp_rf)}")
    print(f"svGanados:    {safe_pct(sv_t-sv_p,sv_t)}")
    print(f"devGanados:   {safe_pct(dv_g,dv_t)}")
    print(f"masters1000:  {int(mas['gano'].sum())}-{int((~mas['gano']).sum())} ({safe_pct(int(mas['gano'].sum()),len(mas))}%)")
    print(f"dura:  {pv(p[p['surface']=='Hard'])}")
    print(f"arcilla: {pv(p[p['surface']=='Clay'])}")
    print(f"cesped: {pv(p[p['surface']=='Grass'])}")
    print(f"indoor: {pv(p[p['es_indoor']])}")
    if anio is not None:
        resultado = {
            "anio": anio,
            "partidos_totales": len(p),
            "victorias": victorias,
            "derrotas": derrotas,
            "titulos": titulos,
            "mejor_ranking": mejor_ranking,
            "stats_detalle": {
                "tiebreaks": {"ganados": tb_g, "jugados": tb_j},
                "set_decisivo": {"ganados": dec_g, "jugados": dec_j},
                "remontadas": {"exitosas": rem_ex, "intentadas": rem_op},
                "bp_salvados": {"salvados": int(bp_s), "enfrentados": int(bp_f)},
                "bp_convertidos": {"convertidos": int(bp_c), "enfrentados": int(bp_rf)},
                "saque_ganado": {"ganados": int(sv_t - sv_p), "total": int(sv_t)},
                "devolucion_ganada": {"ganados": int(dv_g), "total": int(dv_t)},
                "vs_top10": pv(vt10),
                "vs_top10_dura": pv(vt10[vt10["surface"]=="Hard"]),
                "vs_top10_arcilla": pv(vt10[vt10["surface"]=="Clay"]),
                "vs_top10_cesped": pv(vt10[vt10["surface"]=="Grass"]),
                "finales": pv(fin),
                "quintos_set_gs": pv(gs5),
                "masters1000": pv(mas),
                "dura": pv(p[p["surface"]=="Hard"]),
                "arcilla": pv(p[p["surface"]=="Clay"]),
                "cesped": pv(p[p["surface"]=="Grass"]),
                "indoor": pv(p[p["es_indoor"]]),
            },
        }
        return resultado

if __name__ == "__main__":
    df = cargar_todo()
    for nombre in PLAYERS:
        calcular(nombre, df)
    # PILOTO temporada: validar antes de generalizar a todos los jugadores/años
    resultado = calcular("Jannik Sinner", df, anio=2025)
    if resultado:
        resultado["jugador_id"] = "sinner"
        print("\n--- JSON para Supabase (piloto) ---")
        print(json.dumps(resultado, indent=2, ensure_ascii=False))