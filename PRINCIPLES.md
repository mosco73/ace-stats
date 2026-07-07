# ACE STATS — PRINCIPIOS

Estos principios no son aspiracionales. Cada uno nace de una decisión real que ya tomamos, y sirven para decidir rápido cuando aparezca una situación parecida.

---

## 1. Ningún script se pierde

Todo cálculo que se corre tiene que vivir en un archivo versionado (`calcular_stats.py`), nunca solo pegado y ejecutado en la terminal.

**Por qué:** un script suelto corrido a mano fue la causa real del bug de `vsTop10PorSuperficie` de Sinner — se calculó bien una vez, nunca se guardó a disco, y quedó desalineado con el resto de los datos sin que nadie lo notara durante semanas.

---

## 2. Los datos se recalculan solos — con una excepción

Todo dato derivado (porcentajes, récords, splits por superficie) sale de `calcular_stats.py` corriendo sobre los CSV. Nunca se escribe a mano.

**Excepción:** los hechos de alto impacto público (Grand Slams, semanas en el N°1) se verifican manualmente contra fuentes oficiales (ATP), porque ahí un error del dataset sería demasiado visible como para arriesgarse.

---

## 3. No construimos infraestructura antes de necesitarla

No metemos base de datos, autenticación ni backend hasta que una feature concreta lo requiera de verdad.

**Por qué:** hoy toda la Fase 1 (Records, Rivalries, Clutch Rating, Insights V1) funciona perfecto con archivos estáticos. El día que encaremos Buscador, Comunidad o Brackets, ahí evaluamos qué herramienta usar — no antes.

---

## 4. Una métrica propia tiene que ser explicable

Si inventamos un número (como el futuro Clutch Rating), un usuario tiene que poder entender por qué un jugador tiene 94 y otro 88, en una frase.

**Por qué:** una métrica que no se puede explicar no genera confianza ni contenido para compartir — se vuelve un número más, y perdemos justo el diferencial que buscamos.

---

*Este documento crece con casos reales, no con buenas intenciones. Si un principio nuevo todavía no tiene un caso concreto detrás, va al backlog de ideas, no acá.*