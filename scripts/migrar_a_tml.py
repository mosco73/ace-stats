#!/usr/bin/env python3
"""
migrar_a_tml.py - Paso 3 de la migracion a fuente unica.

Hace DOS cambios en scripts/calcular_stats.py:

  1. cargar_todo()  -> lee solo tml_YYYY.csv (1968-hoy), no mas Sackmann.
                       Los anios salen de lo que hay en disco, asi que no
                       hay que tocar nada cada enero.
  2. es_indoor()    -> usa la columna 'indoor' real de TML como primera
                       opcion. La inferencia (nombre, lista, Carpet) queda
                       de fallback para el ~5-10% de filas sin dato.

El cambio 2 no es opcional: sin el, es_indoor buscaba fuente == "fresco",
que despues de la migracion no existe mas, y se perderia el dato real.

Los dos cambios estan protegidos con assert: si el archivo no esta como
se espera, no toca NADA. Se corre una sola vez.

Uso:
    python3 scripts/migrar_a_tml.py
"""
import os
import shutil
import sys

RUTA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "calcular_stats.py")

# --- Cambio 1: cargar_todo --------------------------------------------------

VIEJO_CARGAR = '''ANIOS_HISTORICO = range(1968, 2024)
ANIOS_FRESCOS = [2024, 2025, 2026]


def cargar_todo():
    """
    Carga el dataset completo: historico (Sackmann) + frescos (TML).

    Falla fuerte si falta una fuente entera. Antes usaba os.path.exists() y
    seguia de largo en silencio: si HISTORICO_DIR no existia, cargaba solo
    2024-2026, decia "todo bien" y devolvia stats mutiladas. Mismo criterio
    fail-closed que actualizar.py.
    """
    dfs = []

    print("Cargando historico...")
    if not os.path.isdir(HISTORICO_DIR):
        raise FileNotFoundError(
            f"No existe el directorio del historico: {HISTORICO_DIR}\\n"
            "Sin el, las stats saldrian con solo 2024-2026. Baja el repo "
            "JeffSackmann/tennis_atp antes de seguir."
        )
    faltan_hist = []
    for y in ANIOS_HISTORICO:
        p = os.path.join(HISTORICO_DIR, f"atp_matches_{y}.csv")
        if os.path.exists(p):
            df = pd.read_csv(p, low_memory=False)
            df["fuente"] = "historico"
            dfs.append(df)
        else:
            faltan_hist.append(y)
    total_hist = len(list(ANIOS_HISTORICO))
    if len(faltan_hist) == total_hist:
        raise FileNotFoundError(
            f"No encontre ningun atp_matches_YYYY.csv en {HISTORICO_DIR}"
        )
    print(f"  {total_hist - len(faltan_hist)}/{total_hist} archivos historicos")
    if faltan_hist:
        print(f"  !! FALTAN {len(faltan_hist)} anios: {faltan_hist}")
        print("  !! Las stats de esos anios van a salir incompletas.")

    print("Cargando frescos...")
    faltan_frescos = []
    for y in ANIOS_FRESCOS:
        p = os.path.join(FRESCOS_DIR, f"tml_{y}.csv")
        if os.path.exists(p):
            df = pd.read_csv(p, low_memory=False)
            df["fuente"] = "fresco"
            dfs.append(df)
        else:
            faltan_frescos.append(y)
    if faltan_frescos:
        raise FileNotFoundError(
            f"Faltan CSV frescos en {FRESCOS_DIR}: {faltan_frescos}\\n"
            "Corre: python3 scripts/actualizar.py --sin-ingesta"
        )
    print(f"  {len(ANIOS_FRESCOS)}/{len(ANIOS_FRESCOS)} archivos frescos")'''

NUEVO_CARGAR = '''ANIO_INICIAL = 1968


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
            f"No existe el directorio de datos: {FRESCOS_DIR}\\n"
            "Baja el historico: python3 scripts/bajar_historico_tml.py"
        )

    anios = sorted(
        int(f[4:8]) for f in os.listdir(FRESCOS_DIR)
        if f.startswith("tml_") and f.endswith(".csv") and f[4:8].isdigit()
    )
    if not anios:
        raise FileNotFoundError(
            f"No hay ningun tml_YYYY.csv en {FRESCOS_DIR}\\n"
            "Baja el historico: python3 scripts/bajar_historico_tml.py"
        )
    if anios[0] != ANIO_INICIAL:
        raise FileNotFoundError(
            f"El historico arranca en {anios[0]} y esperaba {ANIO_INICIAL}.\\n"
            "Baja el historico: python3 scripts/bajar_historico_tml.py"
        )
    huecos = [y for y in range(anios[0], anios[-1] + 1) if y not in anios]
    if huecos:
        raise FileNotFoundError(
            f"Faltan anios en el medio: {huecos}\\n"
            "Baja el historico: python3 scripts/bajar_historico_tml.py"
        )

    print(f"Cargando datos TML {anios[0]}-{anios[-1]}...")
    dfs = []
    for y in anios:
        df = pd.read_csv(os.path.join(FRESCOS_DIR, f"tml_{y}.csv"), low_memory=False)
        df["fuente"] = "tml"
        dfs.append(df)
    print(f"  {len(dfs)} archivos")'''

# --- Cambio 2: es_indoor ----------------------------------------------------

VIEJO_INDOOR = '''def es_indoor(row):
    if row.get("fuente") == "fresco" and pd.notna(row.get("indoor")):
        return str(row["indoor"]).strip().upper() == "I"
    nombre = str(row.get("tourney_name", "")).lower()'''

NUEVO_INDOOR = '''def es_indoor(row):
    # TML trae el dato real en la columna 'indoor' para casi todos los anios
    # (queda vacio en un 5-10%). Ese dato manda sobre cualquier inferencia.
    if pd.notna(row.get("indoor")):
        return str(row["indoor"]).strip().upper() == "I"
    # De aca para abajo es inferencia, para las filas sin dato.
    nombre = str(row.get("tourney_name", "")).lower()'''


def aplicar(texto, viejo, nuevo, etiqueta):
    n = texto.count(viejo)
    if n != 1:
        print(f"ERROR en {etiqueta}: encontre {n} coincidencias, esperaba 1.")
        print("No toque nada. El archivo no esta como esperaba.")
        sys.exit(1)
    return texto.replace(viejo, nuevo)


def main():
    if not os.path.exists(RUTA):
        print(f"ERROR: no encuentro {RUTA}")
        sys.exit(1)

    s = open(RUTA).read()
    s = aplicar(s, VIEJO_CARGAR, NUEVO_CARGAR, "cargar_todo")
    s = aplicar(s, VIEJO_INDOOR, NUEVO_INDOOR, "es_indoor")

    shutil.copy2(RUTA, RUTA + ".pre-tml")
    open(RUTA, "w").write(s)
    print("Migrado OK.")
    print(f"Backup del original en: {os.path.basename(RUTA)}.pre-tml")
    print("")
    print("Probalo corriendo cualquiera de los scripts de siempre,")
    print("por ejemplo: python3 scripts/regenerar_todos.py")


if __name__ == "__main__":
    main()
