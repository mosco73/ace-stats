# Ace Stats — Roadmap

> Última actualización: 12/07/2026
> Este documento vive en el repo para no depender de que una conversación
> vieja con Claude no se pierda (ya nos pasó una vez con un script).

## Visión

Una plataforma de estadísticas avanzadas de tenis: StatMuse (deep stats) +
Tennis Abstract (análisis avanzado) + Letterboxd (comunidad). Un lugar
donde los fans descubren estadísticas interesantes, no solo resultados.

---

## v1.0 — Fundación (en curso, ~85% hecho)

**Objetivo:** la base sólida de datos y arquitectura sobre la que se
construye todo lo demás.

- [x] Web funcionando, publicada en Vercel
- [x] Arquitectura dinámica (`/jugadores/[nombre]` lee de `jugadores.ts`)
- [x] Comparador de 2 jugadores
- [x] Datos reales (no inventados) para 6 jugadores, desde dataset histórico
- [x] Metodología de cálculo documentada y reproducible (`calcular_stats.py`)
- [x] 11 estadísticas avanzadas por jugador, auditadas contra ATP oficial donde se puede
- [x] Guardar `calcular_stats.py` en `ace-stats/scripts/`
- [x] Datos frescos hasta 2026 (fuente TennisMyLife, mismo esquema Sackmann)
- [ ] Llegar a ~30 jugadores (activos primero, leyendas después)
- [ ] Aviso "datos actualizados al [fecha]" para jugadores activos
- [ ] Prolijada general: `.toFixed(1)` en todos los campos numéricos
- [ ] Mostrar BP salvados/convertidos % en el perfil (ya calculados, no visibles)

## v1.5 — Profundidad y marca propia (en curso, núcleo hecho)

**Objetivo:** features que no necesitan usuarios ni base de datos nueva,
solo más cálculo sobre los datos que ya existen.

- [x] **Records / leaderboard** — `/records` con tabs Métricas, Carrera,
  Presión y Superficie. Link "Rankings" activo en la navbar.
- [x] **Clutch Rating** — fórmula propia V1.1 (percentil real + shrinkage),
  documentada en `CLUTCH_RATING.md` con historial de revisiones. Visible
  en el perfil de cada jugador (desglose) y en la tab Métricas de Records
  (ranking + explicación). La tab Métricas es el hogar de las métricas
  propias de Ace Stats: si algún día hay una segunda, entra ahí sin
  rediseño. Sin placeholders de métricas que no existen.
- [ ] Estadísticas adicionales: récord vs Top 20, récord por ronda, por
  torneo, por temporada/década, % de sets y juegos ganados.
- [ ] Court pace data (velocidad de superficie por torneo) — idea surgida
  del análisis del competidor Tennis Tour Data.

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

## Ideas anotadas (sin versión asignada)

Cosas pensadas y deliberadamente no hechas todavía. Cada una tiene su
razón documentada; ninguna se arranca sin pasar por la regla de oro.

- **Contenido en español atado al calendario ATP** (video corto + posts
  usando Ace Stats como motor de datos; el Telegram es el grupo de
  prueba). En pausa hasta que la web esté más completa — decisión del
  12/07: no quemar el anuncio del Clutch Rating con la versión mínima.
- **Mejoras del Clutch Rating** (transformación de la cola alta, vista
  "percentil entre élite") — detalladas en `CLUTCH_RATING.md`, sección
  Cambios futuros. Solo si los datos lo muestran necesario.
- **Promedio ponderado cuando falta una componente del Clutch Rating:**
  hoy un jugador sin datos en una stat pierde ese peso entero (baja el
  total). Discutible; revisar cuando entren jugadores con carreras cortas.
- **Barras del ranking Métricas ancladas en el promedio ATP** (46.9) en
  vez de 0, para amplificar diferencias visuales entre la élite.
  Refinamiento estético, no urgente.
- **Licencia de datos:** CC BY-NC-SA (no comercial). Resuelto para el
  proyecto gratuito con atribución en el footer; requiere resolución
  (otra fuente, permiso o asesoría) antes de cualquier monetización.

---

## Regla de oro para no dispersarse

Cada vez que surja una idea nueva en el camino, antes de sumarla acá:
1. ¿En qué versión entra, según lo que necesita (solo cálculo vs. usuarios vs. base de datos)?
2. ¿Hay algo de una versión anterior sin terminar todavía?

Si la respuesta a (2) es sí, la idea nueva espera su turno.
