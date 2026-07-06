import pandas as pd
import os
import re

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
    if row.get("fuente") == "fresco" and pd.notna(row.get("indoor")):
        return str(row["indoor"]).strip().upper() == "I"
    return any(t in str(row.get("tourney_name","")).lower() for t in TORNEOS_INDOOR)

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

def cargar_todo():
    print("Cargando historico...")
    dfs = []
    for y in range(1968,2024):
        p = os.path.join(HISTORICO_DIR, f"atp_matches_{y}.csv")
        if os.path.exists(p):
            df = pd.read_csv(p, low_memory=False)
            df["fuente"] = "historico"
            dfs.append(df)
    print("Cargando frescos...")
    for y in [2024,2025,2026]:
        p = os.path.join(FRESCOS_DIR, f"tml_{y}.csv")
        if os.path.exists(p):
            df = pd.read_csv(p, low_memory=False)
            df["fuente"] = "fresco"
            dfs.append(df)
    df = pd.concat(dfs, ignore_index=True)
    df = df[~df["tourney_name"].astype(str).str.contains("olympic", case=False, na=False)]
    df = df[df["tourney_level"].astype(str) != "O"]
    print(f"Total: {len(df)} partidos\n")
    return df

def safe_pct(n, d):
    return round(100*n/d, 1) if d else 0.0

def calcular(nombre, df):
    mask = (df["winner_name"]==nombre)|(df["loser_name"]==nombre)
    p = df[mask].copy()
    if len(p)==0:
        print(f"No encontre partidos para {nombre}"); return
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
    print(f"\n{'='*50}\n{nombre} ({len(p)} partidos)\n{'='*50}")
    print(f"tiebreaks:    {safe_pct(tb_g,tb_j)}")
    print(f"setDecisivo:  {safe_pct(dec_g,dec_j)}")
    print(f"remontadas:   {safe_pct(rem_ex,rem_op)}")
    print(f"vsTop10:      {safe_pct(int(vt10['gano'].sum()),len(vt10))}")
    print(f"vsTop10Dura:    {pv(vt10[vt10['surface']=='Hard'])}")
    print(f"vsTop10Arcilla: {pv(vt10[vt10['surface']=='Clay'])}")
    print(f"vsTop10Cesped:  {pv(vt10[vt10['surface']=='Grass'])}")
    print(f"finales:      {safe_pct(int(fin['gano'].sum()),len(fin))}")
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

if __name__ == "__main__":
    df = cargar_todo()
    for nombre in PLAYERS:
        calcular(nombre, df)