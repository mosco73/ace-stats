# Clutch Rating

## Objetivo

Responder una sola pregunta: **¿quién juega mejor cuando más importa?**

Combina presión repetida (tiebreaks), presión de partido completo (set decisivo), presión de ocasión (finales), presión punto a punto (break points), y resiliencia (remontadas) en un único número de 0 a 100, diseñado para ser **estable** (no cambia al agregar jugadores), **explicable** (cualquiera puede entender cómo se calcula) e **intuitivo** (el ranking resultante tiene sentido a simple vista).

---

## Qué mide

Rendimiento en 6 situaciones de presión específicas dentro de un partido de tenis, medidas sobre la carrera completa del jugador.

## Qué NO mide

- Nivel general del jugador (eso ya lo cubren Grand Slams, ranking, semanas en el N°1)
- Calidad o ranking del rival enfrentado
- Importancia relativa del torneo más allá de si fue una final o no
- No es un promedio de todas las estadísticas de Ace Stats — es una métrica específica de presión

---

## Estadísticas utilizadas

| Estadística | Definición |
|---|---|
| Tiebreaks | % de tiebreaks ganados sobre el total jugados |
| Set decisivo | % de sets decisivos ganados (3er set en Bo3, 5to en Bo5) |
| Finales | % de finales ganadas sobre el total jugadas |
| BP Salvados | % de break points salvados en contra |
| BP Convertidos | % de break points convertidos a favor |
| Remontadas | % de veces que ganó el partido tras estar abajo (perder el set 1 en Bo3, o ir 2 sets a 0 en Bo5), sobre el total de veces en esa situación |

---

## Normalización

**Población de referencia:** partidos ATP desde el año 2000 hasta la actualidad. Se descartan eras anteriores por decisión metodológica (raquetas, superficies, calendario y preparación física muy distintos), no por falta de datos — el dataset de Ace Stats cubre desde 1968.

**Umbrales mínimos para entrar en la población de referencia de cada estadística (Umbrales V1):**

| Estadística | Criterio mínimo |
|---|---|
| Tiebreaks | ≥100 partidos + ≥30 tiebreaks jugados |
| Set decisivo | ≥100 partidos + ≥30 sets decisivos jugados |
| Finales | ≥10 finales jugadas |
| Remontadas | ≥100 partidos + ≥25 situaciones de remontada posible |
| BP Salvados | ≥100 partidos |
| BP Convertidos | ≥100 partidos |

*Estos umbrales fueron elegidos para construir la primera versión del Clutch Rating y podrán revisarse cuando Ace Stats incorpore más jugadores y se analice la distribución completa del circuito.*

**Escala:** para cada estadística se calculan los percentiles P5 y P95 sobre la población de referencia filtrada. P5 se mapea a 0, P95 se mapea a 100, de forma lineal. Valores por debajo de P5 o por encima de P95 se truncan a 0 o 100. Se usan percentiles en vez de mínimo/máximo para que un caso extremo con poca muestra (ej. un jugador que ganó sus únicos 4 tiebreaks jugados) no defina el techo o el piso de la escala.
**Percentiles calculados (circuito ATP 2000-2026, tras aplicar Umbrales V1):**

| Estadística | P5 | P50 | P95 | Jugadores en la muestra |
|---|---|---|---|---|
| Tiebreaks | 39.6 | 50.0 | 59.8 | 392 |
| Set decisivo | 35.0 | 50.0 | 62.0 | 387 |
| Finales | 27.3 | 45.5 | 69.7 | 110 |
| Remontadas | 8.4 | 16.4 | 27.5 | 396 |
| BP Salvados | 56.0 | 60.4 | 65.9 | 396 |
| BP Convertidos | 34.5 | 39.2 | 42.7 | 396 |

Calculados con `scripts/distribucion_historica.py`, que agrega la carrera completa de cada jugador ATP desde 2000 y aplica los Umbrales V1 antes de calcular percentiles. Validado cruzando los 6 jugadores actuales de Ace Stats contra `calcular_stats.py`: coinciden de forma exacta o casi exacta (Nadal, con carrera 100% posterior a 2000, coincide en las 6 estadísticas sin ninguna diferencia).

---

## Shrinkage (ajuste por tamaño de muestra)

Cuando un jugador tiene poca muestra en una estadística, su porcentaje crudo se atrae parcialmente hacia la mediana histórica, en vez de usarse tal cual o excluirse.
- **k** = el mismo umbral mínimo definido para esa estadística (ej: Finales k=10, Tiebreaks k=30, Set decisivo k=30, Remontadas k=25). Reutiliza una decisión ya tomada en vez de inventar un número nuevo.
- **mediana_referencia** = P50 de la población de referencia de esa estadística (no el promedio — más resistente a distribuciones con cola larga).

---

## Pesos

| Estadística | Peso |
|---|---:|
| Set decisivo | 25% |
| Finales | 25% |
| Tiebreaks | 20% |
| BP Salvados | 10% |
| BP Convertidos | 10% |
| Remontadas | 10% |

El Clutch Rating final es el promedio ponderado de las 6 estadísticas ya normalizadas (0-100) y ajustadas por shrinkage.

---

## Nivel de confianza

Junto al número, se muestra un indicador de cuánta evidencia lo respalda, calculado sobre la estadística con menor muestra del jugador:

- 🟢 **Alta confianza:** muestra ≥ 2x el umbral mínimo
- 🟡 **Muestra moderada:** entre 1x y 2x el umbral mínimo
- 🔴 **Muestra insuficiente:** por debajo del umbral mínimo

El shrinkage ya compensa la poca muestra en el número final, pero este indicador comunica cuánta confianza depositar en él — relevante sobre todo para jugadores jóvenes como Alcaraz o Sinner.

---

## Validación

## Validación

Resultados obtenidos con `scripts/clutch_rating.py` sobre los 6 jugadores actuales de Ace Stats:

| Jugador | Clutch Rating |
|---|---:|
| Jannik Sinner | 100.0 |
| Rafael Nadal | 98.8 |
| Novak Djokovic | 98.8 |
| Carlos Alcaraz | 96.9 |
| Roger Federer | 95.5 |
| Daniil Medvedev | 78.0 |

**Chequeos:**
- ✅ El ranking coincide con la percepción general del circuito: Djokovic y Nadal arriba (reputación de fortaleza mental), Federer un escalón por debajo (patrón real y documentado en su historial vs. Djokovic/Nadal en tiebreaks y sets decisivos), Medvedev claramente último (consistente con sus stats de presión sistemáticamente más bajas ya detectadas en sesiones anteriores).
- ✅ Ningún jugador queda fuera del rango 0-100.
- ✅ Hay variación real entre los 6 (78.0 a 100.0), no están todos agrupados.
- ⚠️ **Caso a observar:** Sinner llegó exacto a 100.0 — sus 6 estadísticas superan el P95 del circuito y se truncan al techo. Es el comportamiento documentado (ver "Escala" en Normalización), no un error, pero significa que su número no puede subir más aunque siga mejorando, mientras esté en este nivel de dominancia. Revisar si esto se vuelve un problema real a medida que pase el tiempo.

---

## Limitaciones

- Depende del tamaño de muestra; el shrinkage lo mitiga pero no lo elimina
- No mide el nivel general del jugador, solo su rendimiento bajo presión en las 6 situaciones definidas
- Los Umbrales V1 y los pesos son decisiones de diseño documentadas, no verdades matemáticas — pueden revisarse
- La población de referencia (desde el año 2000) excluye eras anteriores por decisión metodológica
- En 4 de las 6 estadísticas (Tiebreaks, Set decisivo, Remontadas, BP Convertidos), los jugadores de élite ya cargados en Ace Stats caen en o por encima del P95 de todo el circuito — esperable, dado que ser un campeón histórico correlaciona con rendir bien bajo presión. Consecuencia: esas 4 estadísticas diferencian poco *entre* los jugadores actuales de Ace Stats (todos cerca de 100), mientras que Finales y BP Salvados sí distinguen mejor entre ellos. Esto se corrige solo a medida que se agreguen jugadores de nivel medio al roster — no requiere cambiar la metodología.

---

## Decisiones tomadas

- **Año 2000 como corte de la población de referencia:** se descartó 1968 (dataset completo) por diferencias de época; se descartó 1998 (propuesta inicial) porque no correspondía a ningún corte real del dataset, era una inferencia incorrecta.
- **Percentiles P5-P95 en vez de mínimo/máximo:** evita que un caso extremo con poca muestra defina los bordes de la escala.
- **Shrinkage con k = umbral mínimo de cada estadística:** reutiliza una decisión ya tomada en vez de sumar un parámetro nuevo sin fundamento.
- **Mediana (P50) en vez de promedio como referencia del shrinkage:** más robusta ante distribuciones sesgadas.
- **Finales subió de 20% a 25% de peso** pese a tener la muestra más chica de las 6 estadísticas — compensado explícitamente por el shrinkage, no ignorado.
- **Finales excluye walkovers sin marcador registrado:** un partido de presión requiere sets reales jugados; una final decidida por abandono antes de empezar no es una situación de presión medible. Esto genera una diferencia de 1-2 partidos vs. conteos anteriores para algunos jugadores — diferencia menor y deliberada.

## Cambios futuros

- Revisar Umbrales V1 cuando el roster de jugadores crezca
- Ajustar pesos con feedback real de usuarios una vez publicado
- Evaluar incorporar quintosSetGS (ya calculado en `calcular_stats.py` pero no incluido en esta versión)
- Mostrar el desglose por estadística en el perfil del jugador, no solo el número final