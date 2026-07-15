# Ace Stats — Roadmap

> Última actualización: 15/07/2026
> Este documento vive en el repo para no depender de que una conversación
> vieja con Claude no se pierda (ya nos pasó una vez con un script).

## Visión

Una plataforma de estadísticas avanzadas de tenis: StatMuse (deep stats) +
Tennis Abstract (análisis avanzado) + Letterboxd (comunidad). Un lugar
donde los fans descubren estadísticas interesantes, no solo resultados.

---

## v1.0 — Fundación ✅ COMPLETA (15/07/2026)

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
- [x] **Roster completo: 30 jugadores** (6→30 en cuatro días, sprints de ~5;
  generador automático `scripts/generar_jugador.py` valida cada bloque)
- [x] Aviso "datos actualizados al 27/06/2026" para jugadores activos
- [x] Prolijada general: `.toFixed(1)` en todos los campos numéricos
- [x] Mostrar BP salvados/convertidos % en el perfil

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
- [x] **Identidad visual: el color comunica tipos de dato, no personas**
  (decisión 14/07). Azul=dura, naranja=arcilla, verde=césped,
  violeta=indoor, amarillo=marca/Clutch. Nombres de jugadores en blanco;
  se eliminaron los mapas de color por jugador (no escalaba a 30+).
- [x] Fix histórico: clases Tailwind dinámicas rotas en barras de
  superficie (`bg-${color}-400` no compila; mapa de clases completas).
- [x] Nav con "← Volver" en Records; el Volver del perfil apunta al
  índice `/jugadores` (hub de exploración con 30 jugadores).
- [ ] **Página `/metodologia`** — PRIORIDAD #1 post-roster: CLUTCH_RATING.md
  traducido a lenguaje de usuario (qué mide, pesos, por qué desde 2000,
  colores de confianza, historial de revisiones). La tarjeta del perfil y
  el "¿Cómo se calcula?" de Records linkean ahí. La transparencia
  metodológica es la credibilidad de la métrica.
- [ ] Línea "vs. circuito ATP desde 2000" en la tarjeta Clutch del perfil.
- [ ] V·D junto al % en las tarjetas "vs Top 10 por superficie" (los 0.0%
  legítimos de muestra chica parecen bug sin contexto).
- [ ] **Rendimiento por torneo (precalculado)**: 4 GS + Masters 1000 por
  jugador. Se puede con el modelo actual (generador lo escupe); los
  filtros temporales dinámicos NO — esos son v2.0.
- [ ] Estadísticas adicionales: récord vs Top 20, récord por ronda, por
  temporada/década, % de sets y juegos ganados.
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

## v2.0 — El motor: base de datos + preguntas en lenguaje natural

**Objetivo:** que la web calcule al vuelo en lugar de mostrar números
precalculados. Todas las ideas de julio 2026 convergen acá.

**Requiere:** los ~200k partidos en una base de datos real + lógica de
cálculo en el servidor. No se puede hacer con un `.ts` editado a mano.

- [ ] Migración de partidos a base de datos
- [ ] **Stats filtrables**: por torneo, por año, por ventana temporal
  ("últimos 3 meses", "temporada 2024") — imposibles de precalcular
- [ ] **Búsqueda/chat en lenguaje natural** estilo StatMuse ("¿quién es
  más clutch, Delpo o Murray?"). Evaluar UI: barra de búsqueda, chat,
  o ambas.
- [ ] Contenido dinámico derivado ("los más clutch de esta temporada") —
  insumo directo para el canal de contenido

## v3.0 — Comunidad (estilo Letterboxd)

**Objetivo:** que la plataforma deje de ser "una web de stats" y pase a
ser "un lugar donde los fans de tenis se juntan".

- [ ] Cuentas y perfiles de usuario
- [ ] Opiniones/comentarios sobre jugadores
- [ ] Listas y tops personalizados, compartibles ("Mi GOAT ranking",
  "Top 10 partidos históricos", "los 5 más clutch según yo")
- [ ] Favoritos, seguir a otros usuarios
- Nota de secuencia: v2.0 alimenta a v3.0 — la comunidad discute mejor
  cuando hay stats filtrables y chat para respaldar los debates.

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
- **Avatares de jugadores:** probar caricaturas IA con test de 4 caras
  (estilos consistentes, ojo al "olor a IA" que dañaría la credibilidad);
  fallback a siluetas estilizadas. Si van fotos reales: SOLO Wikimedia
  Commons con licencia verificada foto por foto + atribución. Derecho de
  imagen de jugadores: riesgo bajo mientras el proyecto sea gratuito,
  crece con monetización. Hacer DESPUÉS de /metodologia.
- **Finales ponderadas por categoría de torneo:** candidata a Clutch V1.2
  — detalle en `CLUTCH_RATING.md`, Cambios futuros.
- **Mantenimiento periódico de datos:** los rankings de activos envejecen
  semana a semana (se aceptó como limitación con el disclaimer de fecha).
  Wawrinka, Nishikori, Monfils, Goffin y Bautista Agut anunciaron retiro
  a fin de 2026 → pasarlos a `ranking: -1` cuando ocurra. Refresh de CSVs
  TML + recálculo: definir cadencia (¿mensual?).
- **Licencia de datos:** CC BY-NC-SA (no comercial). Resuelto para el
  proyecto gratuito con atribución en el footer; requiere resolución
  (otra fuente, permiso o asesoría) antes de cualquier monetización.

---

## Regla de oro para no dispersarse

Cada vez que surja una idea nueva en el camino, antes de sumarla acá:
1. ¿En qué versión entra, según lo que necesita (solo cálculo vs. usuarios vs. base de datos)?
2. ¿Hay algo de una versión anterior sin terminar todavía?

Si la respuesta a (2) es sí, la idea nueva espera su turno.
