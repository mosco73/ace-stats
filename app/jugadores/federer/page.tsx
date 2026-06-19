export default function FedererPage() {
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
          <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold text-red-400">
            RF
          </div>
          <div>
            <h1 className="text-3xl font-bold">Roger Federer</h1>
            <p className="text-zinc-400 mt-1">Suiza · Diestro · Pro desde 1998</p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">20 Grand Slams</span>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">310 semanas #1</span>
              <span className="text-xs bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full font-semibold">Retirado</span>
            </div>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Estadísticas avanzadas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Tie-breaks ganados</div>
            <div className="text-2xl font-bold">70.1%</div>
            <div className="text-xs text-zinc-500 mt-1">Carrera completa</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Set decisivo</div>
            <div className="text-2xl font-bold">69.8%</div>
            <div className="text-xs text-zinc-500 mt-1">Histórico ATP</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Remontadas</div>
            <div className="text-2xl font-bold">35.2%</div>
            <div className="text-xs text-green-400 mt-1">+6.0% vs promedio ATP</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">vs Top 10</div>
            <div className="text-2xl font-bold">62.4%</div>
            <div className="text-xs text-zinc-500 mt-1">Carrera completa</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">Conversión finales</div>
            <div className="text-2xl font-bold">63.7%</div>
            <div className="text-xs text-zinc-500 mt-1">103 títulos / 157 finales</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">5to set en Grand Slams</div>
            <div className="text-2xl font-bold">64.2%</div>
            <div className="text-xs text-zinc-500 mt-1">Histórico</div>
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
              <span className="font-semibold">83.4%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-blue-400 h-2 rounded-full" style={{width: "83.4%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">612V · 122D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Arcilla</span>
              </div>
              <span className="font-semibold">73.8%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-orange-400 h-2 rounded-full" style={{width: "73.8%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">289V · 102D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Césped</span>
              </div>
              <span className="font-semibold">87.6%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-green-400 h-2 rounded-full" style={{width: "87.6%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">198V · 28D</div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Indoor</span>
              </div>
              <span className="font-semibold">85.3%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className="bg-purple-400 h-2 rounded-full" style={{width: "85.3%"}}></div>
            </div>
            <div className="text-xs text-zinc-500 mt-1">421V · 73D</div>
          </div>
        </div>

      </section>
    </main>
  );
}