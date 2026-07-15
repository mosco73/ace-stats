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

**Escala (V1.1 — percentil real):** el subscore de cada estadística es el **percentil del jugador dentro de la población de referencia**, calculado sobre valores ya ajustados por shrinkage (tanto el del jugador como los de toda la población, para comparar en igualdad de condiciones). Un subscore de 97.3 significa literalmente "mejor que el 97.3% del circuito en esa estadística". Los empates se resuelven con midrank (los jugadores empatados comparten el punto medio de sus posiciones).

Se abandonó la interpolación lineal P5→0 / P95→100 de la V1.0 porque saturaba: todo valor por encima del P95 se truncaba a 100, y los jugadores de élite superan el P95 en casi todas las estadísticas. El caso límite fue Sinner con 100.0 y las 6 componentes en 100 — la métrica no podía distinguir entre los jugadores que Ace Stats existe para comparar. Con percentil real, la resolución en la cola alta se conserva: superar el P95 por 0.3 puntos y superarlo por 8 puntos producen subscores distintos.

**Distribución de referencia (circuito ATP 2000-2026, tras aplicar Umbrales V1):**

| Estadística | P5 | P50 | P95 | Jugadores en la muestra |
|---|---|---|---|---|
| Tiebreaks | 39.6 | 50.0 | 59.8 | 392 |
| Set decisivo | 35.0 | 50.0 | 62.0 | 387 |
| Finales | 27.3 | 45.5 | 69.7 | 110 |
| Remontadas | 8.4 | 16.4 | 27.5 | 396 |
| BP Salvados | 56.0 | 60.4 | 65.9 | 396 |
| BP Convertidos | 34.5 | 39.2 | 42.7 | 396 |

Los P50 de esta tabla siguen siendo el ancla del shrinkage. Los P5/P95 ya no definen la escala (eran la base de la V1.0) pero se conservan como referencia descriptiva de la distribución.

Calculados con `scripts/distribucion_historica.py`, que agrega la carrera completa de cada jugador ATP desde 2000 y aplica los Umbrales V1 antes de calcular percentiles. Validado cruzando los 6 jugadores actuales de Ace Stats contra `calcular_stats.py`: coinciden de forma exacta o casi exacta (Nadal, con carrera 100% posterior a 2000, coincide en las 6 estadísticas sin ninguna diferencia).

---

## Shrinkage (ajuste por tamaño de muestra)

Cuando un jugador tiene poca muestra en una estadística, su porcentaje crudo se atrae parcialmente hacia la mediana histórica, en vez de usarse tal cual o excluirse.
- **k** = el mismo umbral mínimo definido para esa estadística (ej: Finales k=10, Tiebreaks k=30, Set decisivo k=30, Remontadas k=25). Reutiliza una decisión ya tomada en vez de inventar un número nuevo.
- **mediana_referencia** = P50 de la población de referencia de esa estadística (no el promedio — más resistente a distribuciones con cola larga).

En la V1.1 el shrinkage se aplica también a **toda la población de referencia** antes de calcular percentiles, no solo al jugador evaluado. Si se rankeara el valor encogido del jugador contra los valores crudos del circuito, el shrinkage funcionaría como una penalización injusta en vez de como un ajuste simétrico.

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

Resultados obtenidos con `scripts/clutch_rating.py` (V1.1) sobre los 6 jugadores actuales de Ace Stats:

| Jugador | Clutch Rating V1.1 | (V1.0) |
|---|---:|---:|
| Novak Djokovic | 98.5 | 98.8 |
| Jannik Sinner | 98.3 | 100.0 |
| Rafael Nadal | 97.8 | 98.8 |
| Carlos Alcaraz | 96.7 | 96.9 |
| Roger Federer | 96.2 | 95.5 |
| Daniil Medvedev | 85.6 | 78.0 |

**Chequeos:**
- ✅ El ranking coincide con la percepción general del circuito: Djokovic arriba (reputación de fortaleza mental), Federer último del Big 3 — arrastrado sobre todo por BP Convertidos (81.2), consistente con su patrón real y documentado de desperdiciar break points vs. Djokovic/Nadal — y Medvedev claramente último (consistente con sus stats de presión sistemáticamente más bajas ya detectadas en sesiones anteriores).
- ✅ Ningún jugador queda fuera del rango 0-100.
- ✅ Hay variación real entre los 6 (85.6 a 98.5), sin empates en el total.
- ✅ Se resolvió el empate Nadal-Djokovic de la V1.0 (ambos 98.8) y desapareció el 100.0 chato de Sinner: sus subscores ahora van de 95.8 a 99.5.
- ✅ Los subscores diferencian dentro de cada jugador: todos tienen fortalezas y debilidades visibles en el desglose.

---

## Limitaciones

- Depende del tamaño de muestra; el shrinkage lo mitiga pero no lo elimina
- No mide el nivel general del jugador, solo su rendimiento bajo presión en las 6 situaciones definidas
- Los Umbrales V1 y los pesos son decisiones de diseño documentadas, no verdades matemáticas — pueden revisarse
- La población de referencia (desde el año 2000) excluye eras anteriores por decisión metodológica
- Rendir bien bajo presión correlaciona con ser un jugador de élite en general; la métrica no separa completamente "clutch" de "muy bueno". Es una limitación conocida de toda métrica de presión basada en resultados.
- En la cola alta (jugadores de élite), los percentiles se acercan entre sí por construcción: el top 5 de Ace Stats queda entre 96.2 y 98.5. Por ahora el orden es claro y sin empates; si al agregar más jugadores de élite la compresión se vuelve un problema, está anotada una posible transformación (ver Cambios futuros).

---

## Decisiones tomadas

- **Año 2000 como corte de la población de referencia:** se descartó 1968 (dataset completo) por diferencias de época; se descartó 1998 (propuesta inicial) porque no correspondía a ningún corte real del dataset, era una inferencia incorrecta.
- **Percentil real en vez de interpolación lineal P5-P95 (V1.1):** la escala lineal truncaba en 100 todo lo que superara el P95 y saturaba para jugadores de élite — exactamente el segmento que Ace Stats existe para comparar. El percentil conserva resolución en la cola alta y además mejora la interpretación: el subscore *es* el percentil.
- **Shrinkage aplicado a toda la población antes de rankear (V1.1):** comparar ajustado contra ajustado; si no, el shrinkage penalizaría injustamente al jugador evaluado.
- **Shrinkage con k = umbral mínimo de cada estadística:** reutiliza una decisión ya tomada en vez de sumar un parámetro nuevo sin fundamento.
- **Mediana (P50) en vez de promedio como referencia del shrinkage:** más robusta ante distribuciones sesgadas.
- **Finales subió de 20% a 25% de peso** pese a tener la muestra más chica de las 6 estadísticas — compensado explícitamente por el shrinkage, no ignorado.
- **Finales excluye walkovers sin marcador registrado:** un partido de presión requiere sets reales jugados; una final decidida por abandono antes de empezar no es una situación de presión medible. Esto genera una diferencia de 1-2 partidos vs. conteos anteriores para algunos jugadores — diferencia menor y deliberada.
- **Un solo cambio de variable por revisión:** la V1.1 modificó únicamente la normalización (pesos, shrinkage, umbrales y confianza quedaron idénticos), para poder atribuir el impacto observado a esa única decisión.

---

## Historial de revisiones

### V1.0 (junio 2026)
Primera versión completa: 6 estadísticas ponderadas, shrinkage bayesiano hacia el P50, normalización lineal P5→0 / P95→100 con truncado, nivel de confianza por muestra.

**Problema detectado:** saturación en la cola alta. Los jugadores de élite superan el P95 del circuito en casi todas las estadísticas, por lo que el truncado a 100 borraba las diferencias entre ellos. Síntoma visible: Sinner con 100.0 y las 6 componentes en 100; Nadal y Djokovic empatados en 98.8. El documento V1.0 ya lo había marcado como "caso a observar" — la observación confirmó que sí era un problema, porque el uso principal de Ace Stats es comparar élite contra élite, y la resolución arriba importa más que abajo.

### V1.1 (julio 2026) — vigente
Cambio único: la normalización pasa de interpolación lineal P5-P95 a **percentil real dentro de la población de referencia**, con el shrinkage aplicado simétricamente a toda la población antes de rankear. Sin cambios en pesos, shrinkage, umbrales ni confianza.

**Resultado:** desapareció la saturación (ningún subscore chato en 100 para los 6 jugadores), se resolvió el empate Nadal-Djokovic, y el desglose por componente recuperó poder informativo. Efecto colateral: el promedio ATP del rating pasó de 47.6 a 46.9.

---

## Cambios futuros

- Revisar Umbrales V1 cuando el roster de jugadores crezca
- Ajustar pesos con feedback real de usuarios una vez publicado
- Evaluar incorporar quintosSetGS (ya calculado en `calcular_stats.py` pero no incluido en esta versión)
- **Transformación de la cola alta (anotado en V1.1, no implementado):** si al crecer el roster los percentiles de la élite se comprimen demasiado (ej. varios jugadores entre 99.8 y 99.9), evaluar una transformación logística o tipo Elo sobre el percentil. Solo si los datos lo muestran necesario.
- **Ponderar Finales por categoría de torneo (anotado en V1.1 tras pregunta del 14/07, no implementado):** hoy una final de 250 pesa igual que una de Grand Slam (documentado en "Qué NO mide"). Distorsión conocida: premia ganar finales accesibles (Cilic 80.5) y castiga perder finales grandes contra la élite (Tsitsipas 35.9). Defensa del statu quo: "una final es una final" es explicable en una oración, cualquier ponderación (GS x4, Masters x2...) es igual de arbitraria, y achica muestras efectivas ya chicas. Camino de decisión: con el roster de 30 completo, correr el experimento — recalcular con ponderación y comparar rankings. Si el orden casi no cambia, no vale la complejidad; si hay cruces significativos, discusión metodológica a documentar.
- **Percentil entre élite como vista secundaria (anotado en V1.1, no implementado):** mostrar opcionalmente cómo rankea un jugador dentro de una población de élite (ej. top 20 histórico). Descartado como base de la métrica: la muestra chica hace los percentiles ruidosos, y "percentil 55 entre leyendas" se lee como mediocridad aunque no lo sea. Podría funcionar como comparación adicional, nunca como el número principal.
