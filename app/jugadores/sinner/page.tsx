export default function SinnerPage() {
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

      <section className="px-6 py-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-green-400">
            JS
          </div>
          <div>
            <h1 className="text-3xl font-bold">Jannik Sinner</h1>
            <p className="text-zinc-400 mt-1">Italia · Diestro · Pro desde 2018</p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">2 Grand Slams</span>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">40 semanas #1</span>
              <span className="text-xs bg-yellow-400 text-zinc-900 px-3 py-1 rounded-full font-semibold">#1 ATP</span>
            </div>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Estadísticas avanzadas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Tie-breaks ganados</div>
            <div className="text-2xl font-bold">68.3%</div>
            <div className="text-xs text-zinc-500 mt-1">Top 10 ATP activo</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Set decisivo</div>
            <div className="text-2xl font-bold">74.2%</div>
            <div className="text-xs text-zinc-500 mt-1">Top 5 ATP activo</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Remontadas</div>
            <div className="text-2xl font-bold">39.1%</div>
            <div className="text-xs text-green-400 mt-1">+9.8% vs promedio ATP</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">vs Top 10</div>
            <div className="text-2xl font-bold">61.4%</div>
            <div className="text-xs text-zinc-500 mt-1">112 partidos</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Conversión finales</div>
            <div className="text-2xl font-bold">62.5%</div>
            <div className="text-xs text-zinc-500 mt-1">15 títulos / 24 finales</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">5to set en Grand Slams</div>
            <div className="text-2xl font-bold">71.4%</div>
            <div className="text-xs text-zinc-500 mt-1">10 victorias · 4 derrotas</div>
          </div>
        </div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          vs Top 10 por superficie
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-xs text-zinc-500 mb-1">Dura</div>
            <div className="text-xl font-bold text-blue-400">64.2%</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-xs text-zinc-500 mb-1">Arcilla</div>
            <div className="text-xl font-bold text-orange-400">55.1%</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-xs text-zinc-500 mb-1">Césped</div>
            <div className="text-xl font-bold text-green-400">58.3%</div>
          </div>
        </div>

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
              <span className="font-semibold">83.1%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{width: "83.1%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">241V · 49D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Arcilla</span>
              </div>
              <span className="font-semibold">74.6%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-orange-400 h-2 rounded-full" style={{width: "74.6%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">132V · 45D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Césped</span>
              </div>
              <span className="font-semibold">68.2%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{width: "68.2%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">58V · 27D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Indoor</span>
              </div>
              <span className="font-semibold">83.7%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{width: "83.7%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">198V · 38D</div>
          </div>
        </div>

      </section>
    </main>
  );
}