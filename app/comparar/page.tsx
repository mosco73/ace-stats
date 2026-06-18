import { jugadores } from "../data/jugadores";

export default function CompararPage() {
  const j1 = jugadores[0]; // Djokovic
  const j2 = jugadores[2]; // Sinner

  const filas = [
    { label: "Tie-breaks ganados", key: "tiebreaks" },
    { label: "Set decisivo", key: "setDecisivo" },
    { label: "Remontadas", key: "remontadas" },
    { label: "vs Top 10", key: "vsTop10" },
    { label: "Conversión finales", key: "finales" },
    { label: "Indoor", key: "indoor" },
  ] as const;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <a href="/" className="font-semibold tracking-tight hover:text-yellow-400">Ace Stats</a>
        </div>
        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="/" className="hover:text-white">← Volver</a>
        </div>
      </nav>

      <section className="px-6 py-10 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">Comparador de jugadores</h1>

        <div className="grid grid-cols-3 items-center mb-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-yellow-400 mx-auto mb-2">
              ND
            </div>
            <div className="font-semibold text-sm">{j1.nombre}</div>
            <div className="text-zinc-500 text-xs">{j1.pais} · #{j1.ranking}</div>
          </div>
          <div className="text-center text-zinc-500 font-semibold">VS</div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-green-400 mx-auto mb-2">
              JS
            </div>
            <div className="font-semibold text-sm">{j2.nombre}</div>
            <div className="text-zinc-500 text-xs">{j2.pais} · #{j2.ranking}</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          {filas.map((fila) => {
            const v1 = j1.stats[fila.key];
            const v2 = j2.stats[fila.key];
            const ganaJ1 = v1 > v2;
            const ganaJ2 = v2 > v1;

            return (
              <div key={fila.key}>
                <div className="grid grid-cols-3 items-center text-sm mb-2">
                  <div className={`text-left font-bold ${ganaJ1 ? "text-yellow-400" : "text-zinc-300"}`}>
                    {v1}%
                  </div>
                  <div className="text-center text-zinc-500 text-xs">{fila.label}</div>
                  <div className={`text-right font-bold ${ganaJ2 ? "text-yellow-400" : "text-zinc-300"}`}>
                    {v2}%
                  </div>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-zinc-800">
                  <div className="bg-blue-400" style={{ width: `${(v1 / (v1 + v2)) * 100}%` }}></div>
                  <div className="bg-zinc-700 w-px"></div>
                  <div className="bg-green-400 flex-1"></div>
                </div>
              </div>
            );
          })}
        </div>

      </section>
    </main>
  );
}