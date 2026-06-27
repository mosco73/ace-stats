# Ace Stats — Roadmap

> Última actualización: 26/06/2026
> Este documento vive en el repo para no depender de que una conversación
> vieja con Claude no se pierda (ya nos pasó una vez con un script).

## Visión

Una plataforma de estadísticas avanzadas de tenis: StatMuse (deep stats) +
Tennis Abstract (análisis avanzado) + Letterboxd (comunidad). Un lugar
donde los fans descubren estadísticas interesantes, no solo resultados.

---

## v1.0 — Fundación (en curso, ~80% hecho)

**Objetivo:** la base sólida de datos y arquitectura sobre la que se
construye todo lo demás.

- [x] Web funcionando, publicada en Vercel
- [x] Arquitectura dinámica (`/jugadores/[nombre]` lee de `jugadores.ts`)
- [x] Comparador de 2 jugadores
- [x] Datos reales (no inventados) para 5 jugadores, desde dataset histórico
- [x] Metodología de cálculo documentada y reproducible (`calcular_stats.py`)
- [x] 11 estadísticas avanzadas por jugador, auditadas contra ATP oficial donde se puede
- [ ] Llegar a ~30 jugadores (activos primero, leyendas después)
- [ ] Aviso "datos actualizados al [fecha]" para jugadores activos
- [ ] Prolijada general: `.toFixed(1)` en todos los campos numéricos
- [ ] Guardar `calcular_stats.py` en `ace-stats/scripts/`

## v1.5 — Profundidad y marca propia

**Objetivo:** features que no necesitan usuarios ni base de datos nueva,
solo más cálculo sobre los datos que ya existen.

- [ ] **Records / leaderboard** — ranking de "mejor de la historia" por
  estadística (ej. mejor % de tiebreaks, más semanas en #1). No hace
  falta esperar a la base de datos: con 30 jugadores en el array ya
  se puede ordenar y mostrar un top.
- [ ] **Clutch Rating** — fórmula propia, documentada de forma transparente
  (es la marca de la casa, pero si no se explica cómo se calcula, pierde
  credibilidad).
- [ ] Estadísticas adicionales: récord vs Top 20, récord por ronda, por
  torneo, por temporada/década, % de sets y juegos ganados.

## v1.8 — Rivalries (tratamiento aparte)

**Por qué está separado de v1.5:** no es "una estadística más" — es una
**forma de dato distinta**. Las estadísticas de v1.0/v1.5 son por jugador
individual; un head-to-head es por **par de jugadores**, lo que implica
una estructura de datos nueva (no solo más campos en `jugadores.ts`).

- [ ] Página dedicada por rivalidad (ej. Djokovic vs Nadal)
- [ ] Head-to-head total, por superficie, en finales, en Grand Slams
- [ ] Duración promedio de partidos, tiebreaks jugados entre ellos

## v2.0 — Buscador estilo StatMuse

**Objetivo:** preguntas en lenguaje natural ("jugador con mejor récord
vs Top 10 desde 2015").

**Requiere:** base de datos real con cientos de jugadores. Este es el
salto de arquitectura grande — no se puede hacer con un archivo `.ts`
editado a mano.

- [ ] Migración de datos a base de datos
- [ ] Motor de búsqueda en lenguaje natural

## v3.0 — Comunidad (estilo Letterboxd)

**Objetivo:** que la plataforma deje de ser "una web de stats" y pase a
ser "un lugar donde los fans de tenis se juntan".

- [ ] Cuentas de usuario
- [ ] Listas personalizadas (ej. "Top 10 partidos históricos", "Mi GOAT ranking")
- [ ] Favoritos, seguir a otros usuarios

## v4.0 — Juego y predicción

- [ ] Brackets / torneos predictivos
- [ ] Ligas privadas entre amigos
- [ ] Predicciones de resultados

---

## Regla de oro para no dispersarse

Cada vez que surja una idea nueva en el camino, antes de sumarla acá:
1. ¿En qué versión entra, según lo que necesita (solo cálculo vs. usuarios vs. base de datos)?
2. ¿Hay algo de una versión anterior sin terminar todavía?

Si la respuesta a (2) es sí, la idea nueva espera su turno.
