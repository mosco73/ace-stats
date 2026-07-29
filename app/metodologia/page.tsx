export default function Metodologia() {
  const componentes = [
    {
      nombre: "Set decisivo",
      peso: "25%",
      que: "Sets que definen el partido: el 3ro en partidos al mejor de 3, el 5to al mejor de 5.",
      porque: "Es el partido entero reducido a un set. No hay mañana. La presión más pura, con muestra grande.",
    },
    {
      nombre: "Finales",
      peso: "25%",
      que: "Porcentaje de finales ganadas sobre finales jugadas.",
      porque: "La presión de la ocasión: todo el torneo se define ahí. Es la muestra más chica de las seis, y el ajuste estadístico lo compensa.",
    },
    {
      nombre: "Tie-breaks",
      peso: "20%",
      que: "Porcentaje de tiebreaks ganados.",
      porque: "Cada punto vale muchísimo, pero es presión de set, no de partido: se puede perder un tiebreak y ganar igual.",
    },
    {
      nombre: "BP salvados",
      peso: "10%",
      que: "Break points salvados con el propio saque.",
      porque: "Presión punto a punto, pero diluida: un jugador enfrenta miles en su carrera y el dato no distingue el contexto de cada uno.",
    },
    {
      nombre: "BP convertidos",
      peso: "10%",
      que: "Break points convertidos al resto.",
      porque: "Misma lógica que los salvados: real, pero con mucho ruido de contexto.",
    },
    {
      nombre: "Remontadas",
      peso: "10%",
      que: "Partidos ganados tras perder el set 1 (Bo3) o ir 2-0 abajo (Bo5), sobre las veces en ese déficit.",
      porque: "Es la componente más mezclada con el nivel general: los mejores remontan más también por ser mejores. Por eso pesa poco.",
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <a href="/" className="font-semibold tracking-tight hover:text-yellow-400">Ace Stats</a>
        </div>
        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="/records" className="hover:text-white">← Volver</a>
        </div>
      </nav>

      <section className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          ⭐ Clutch Rating: la metodología
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Una métrica propia solo vale lo que vale su metodología. Acá está
          todo: qué mide, cómo se calcula, y qué decisiones tomamos en el
          camino. Sin cajas negras.
        </p>
      </section>

      <section className="px-6 max-w-3xl mx-auto mb-16 space-y-6">
        {/* Qué mide */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">
            Qué mide
          </h2>
          <p className="text-zinc-300 mb-3">
            Una sola pregunta: <strong className="text-white">¿quién juega
            mejor cuando más importa?</strong> El Clutch Rating combina el
            rendimiento en seis situaciones de presión de la carrera completa
            de un jugador en un número de 0 a 100.
          </p>
          <p className="text-zinc-400 text-sm">
            No mide el nivel general (para eso están los Grand Slams y el
            ranking), ni la calidad del rival, ni la importancia del torneo
            más allá de si fue una final. Es una métrica específica de
            presión.
          </p>
        </div>

        {/* Las 6 componentes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">
            Las seis componentes y sus pesos
          </h2>
          <p className="text-zinc-400 text-sm mb-5">
            Más peso cuanto más concentrada está la presión en un momento
            definitorio; menos peso cuanto más diluido o mezclado con el
            nivel general está el dato.
          </p>
          <div className="space-y-4">
            {componentes.map((c) => (
              <div key={c.nombre} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{c.nombre}</span>
                  <span className="font-bold text-yellow-400">{c.peso}</span>
                </div>
                <p className="text-zinc-400 text-sm">{c.que}</p>
                <p className="text-zinc-500 text-sm mt-1">{c.porque}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cómo se calcula */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">
            Cómo se calcula
          </h2>
          <p className="text-zinc-300 mb-3">
            Cada componente se convierte en un <strong className="text-white">
            percentil real</strong>: un subscore de 97.3 significa,
            literalmente, &ldquo;mejor que el 97.3% del circuito ATP en esa
            situación&rdquo;. El número final es el promedio ponderado de los
            seis percentiles.
          </p>
          <p className="text-zinc-400 text-sm mb-3">
            La población de referencia son todos los jugadores ATP con
            carrera desde el año 2000 y muestra suficiente (~400 jugadores,
            ~200.000 partidos). ¿Por qué desde 2000? Porque el tenis anterior
            era otro deporte: raquetas y cuerdas distintas, superficies mucho
            más rápidas, saque-volea dominante. Comparar un porcentaje de
            tiebreaks de 1985 con uno de 2015 sería mezclar peras con
            manzanas. El corte hace que el percentil sea honesto: mejor que
            el X% <em>de la era moderna</em>.
          </p>
          <p className="text-zinc-400 text-sm">
            Además, los porcentajes con poca muestra se ajustan
            estadísticamente hacia la mediana del circuito (shrinkage
            bayesiano): un jugador con 12 finales no puede compararse crudo
            contra uno con 90. El ajuste se aplica a todo el circuito por
            igual, para que la comparación sea simétrica.
          </p>
        </div>

        {/* Confianza */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">
            Los colores de confianza
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Junto a cada número mostramos cuánta evidencia lo respalda. El
            color no califica el rendimiento: califica la muestra.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1 shrink-0"></div>
              <p className="text-zinc-300 text-sm">
                <strong className="text-white">Alta confianza:</strong> muestra
                amplia (al menos el doble del mínimo requerido). El número es
                sólido.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mt-1 shrink-0"></div>
              <p className="text-zinc-300 text-sm">
                <strong className="text-white">Muestra moderada:</strong> hay
                datos suficientes, pero el número todavía puede moverse.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1 shrink-0"></div>
              <p className="text-zinc-300 text-sm">
                <strong className="text-white">Muestra insuficiente:</strong>{" "}
                pocos partidos en esa situación — tomalo con pinzas: dos
                resultados pueden cambiar todo el número.
              </p>
            </div>
          </div>
        </div>

        {/* Limitaciones */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">
            Limitaciones que reconocemos
          </h2>
          <p className="text-zinc-400 text-sm mb-2">
            Ninguna métrica es perfecta, y preferimos decirlo nosotros antes
            de que lo descubras vos:
          </p>
          <ul className="text-zinc-400 text-sm space-y-2 list-disc list-inside">
            <li>
              Una final de 250 pesa igual que una de Grand Slam. Es una
              simplificación deliberada (&ldquo;una final es una
              final&rdquo;) que estamos evaluando refinar.
            </li>
            <li>
              Rendir bajo presión correlaciona con ser muy bueno en general;
              ninguna métrica de resultados separa ambas cosas del todo.
            </li>
            <li>
              No mide la calidad del rival enfrentado en cada situación.
            </li>
            <li>
              Depende del tamaño de muestra; el ajuste estadístico lo mitiga,
              los colores de confianza lo transparentan.
            </li>
          </ul>
        </div>

        {/* Revisiones */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">
            Historial de revisiones
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-zinc-300">V1.0 — junio 2026</p>
              <p className="text-zinc-500 text-sm">
                Primera versión completa. Problema detectado: la escala
                saturaba en 100 para los jugadores de élite y no podía
                distinguir entre ellos.
              </p>
            </div>
            <div>
              <p className="font-semibold text-zinc-300">V1.1 — julio 2026 (vigente)</p>
              <p className="text-zinc-500 text-sm">
                La normalización pasó a percentil real sobre la población de
                referencia. Un solo cambio de variable, documentado y
                validado — así evoluciona una métrica seria (Elo, xG y WAR
                pasaron por lo mismo).
              </p>
            </div>
          </div>
        </div>

{/* Qué partidos entran */}
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
  <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">
    Qué partidos entran
  </h2>
  <p className="text-zinc-300 mb-3">
    Todas las estadísticas son de <strong className="text-white">nivel ATP</strong>: cuadro
    principal de ATP Tour (250, 500, Masters 1000 y ATP Finals), Grand Slams, Davis Cup
    y Juegos Olímpicos.
  </p>
  <p className="text-zinc-400 text-sm">
    Quedan afuera los Challengers, los ITF Futures y los partidos de clasificación (qualy),
    igual que en los récords oficiales de la ATP. Por eso un jugador puede aparecer sin
    temporada en un año en el que sí compitió, si ese año solo jugó Challengers.
  </p>
</div>
{/* Cómo se determina indoor */}
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
  <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-4">
    Cómo se determina indoor
  </h2>
  <p className="text-zinc-300 mb-3">
          El dato viene marcado en la fuente en la gran mayoría de los partidos:
          TennisMyLife publica un campo <code>indoor</code> para toda su base, no solo
          para los años recientes. Cuando ese campo está, lo usamos tal cual. Para la
          minoría que no lo trae hay que <strong className="text-white">inferirlo</strong>:
          tomamos como indoor los torneos cuyo nombre lo indica, una lista curada de sedes
          bajo techo, y todos los partidos jugados sobre Carpet.
        </p>
        <p className="text-zinc-400 text-sm">
          El Carpet era una superficie portátil que se instalaba dentro de estadios — Wembley,
          el circuito WCT, Philadelphia — y desapareció del circuito alrededor de 2009. Tratarlo
          como indoor cubre buena parte de los partidos viejos sin dato. Esa inferencia es la
          parte de la clasificación que no se verifica contra la fuente, y por eso queda
          documentada acá.
        </p>
</div>
        {/* Fuente */}
        <div className="bg-zinc-900 border border-yellow-400/40 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-3">
            ¿Querés el detalle completo?
          </h2>
          <p className="text-zinc-300 text-sm">
            La especificación técnica — umbrales exactos, parámetros del
            shrinkage, distribución de referencia, cada decisión con su
            justificación — es pública en{" "}
            <a
              href="https://github.com/mosco73/ace-stats/blob/main/CLUTCH_RATING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:underline"
            >
              el repositorio de Ace Stats
            </a>
             {" "}Los datos provienen de TennisMyLife.
          </p>
        </div>
      </section>
    </main>
  );
}
