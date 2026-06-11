export default function AlcarazPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <a href="/" className="font-semibold tracking-tight hover:text-yellow-400">Ace Stats</a>
        </div>
        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="/" className="hover:text-white">← Volver</a>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 py-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-blue-400">
            CA
          </div>
          <div>
            <h1 className="text-3xl font-bold">Carlos Alcaraz</h1>
            <p className="text-zinc-400 mt-1">España · Diestro · Pro desde 2018</p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">4 Grand Slams</span>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">3 semanas #1</span>
              <span className="text-xs bg-yellow-400 text-zinc-900 px-3 py-1 rounded-full font-semibold">#3 ATP</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Estadísticas avanzadas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Tie-breaks ganados</div>
            <div className="text-2xl font-bold">64.1%</div>
            <div className="text-xs text-zinc-500 mt-1">198 jugados</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Set decisivo</div>
            <div className="text-2xl font-bold">71.3%</div>
            <div className="text-xs text-zinc-500 mt-1">Top 10 ATP activo</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Remontadas</div>
            <div className="text-2xl font-bold">38.2%</div>
            <div className="text-xs text-green-400 mt-1">+8.9% vs promedio ATP</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">vs Top 10</div>
            <div className="text-2xl font-bold">54.8%</div>
            <div className="text-xs text-zinc-500 mt-1">89 partidos</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Conversión finales</div>
            <div className="text-2xl font-bold">57.1%</div>
            <div className="text-xs text-zinc-500 mt-1">16 títulos / 28 finales</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">5to set en Grand Slams</div>
            <div className="text-2xl font-bold">66.7%</div>
            <div className="text-xs text-zinc-500 mt-1">8 victorias · 4 derrotas</div>
          </div>
        </div>

        {/* Superficie */}
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Rendimiento por superficie
        </h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Dura</span>
              </div>
              <span className="font-semibold">76.3%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{width: "76.3%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">198V · 62D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Arcilla</span>
              </div>
              <span className="font-semibold">82.4%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-orange-400 h-2 rounded-full" style={{width: "82.4%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">154V · 33D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Césped</span>
              </div>
              <span className="font-semibold">79.1%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{width: "79.1%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">72V · 19D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Indoor</span>
              </div>
              <span className="font-semibold">71.8%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{width: "71.8%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">89V · 35D</div>
          </div>
        </div>

      </section>
    </main>
  );
}