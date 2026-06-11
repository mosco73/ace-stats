import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span className="font-semibold tracking-tight">Ace Stats</span>
        </div>
        <div className="flex gap-6 text-sm text-zinc-400">
          <span className="hover:text-white cursor-pointer">Jugadores</span>
          <span className="hover:text-white cursor-pointer">Rankings</span>
          <span className="hover:text-white cursor-pointer">Comparar</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Estadísticas de tenis <span className="text-yellow-400">que no encontrás en otro lado</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Tie-breaks, remontadas, rendimiento por superficie, récord vs Top 10 y mucho más.
        </p>
      </section>

      {/* Jugadores */}
      <section className="px-6 max-w-4xl mx-auto mb-10">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Jugadores destacados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Djokovic */}
          <Link href="/jugadores/djokovic">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-2xl p-6 cursor-pointer transition-all">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-yellow-400">
                  ND
                </div>
                <div>
                  <div className="font-semibold">Novak Djokovic</div>
                  <div className="text-zinc-400 text-sm">Serbia · #4 ATP</div>
                </div>
                <div className="ml-auto text-yellow-400 font-bold text-lg">#4</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">72.4%</div>
                  <div className="text-xs text-zinc-500 mt-1">Tie-breaks</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">78.1%</div>
                  <div className="text-xs text-zinc-500 mt-1">Set decisivo</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">41.7%</div>
                  <div className="text-xs text-zinc-500 mt-1">Remontadas</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-500 text-right">Ver perfil completo →</div>
            </div>
          </Link>

          {/* Alcaraz */}
          <Link href="/jugadores/alcaraz">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-2xl p-6 cursor-pointer transition-all">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-blue-400">
                  CA
                </div>
                <div>
                  <div className="font-semibold">Carlos Alcaraz</div>
                  <div className="text-zinc-400 text-sm">España · #3 ATP</div>
                </div>
                <div className="ml-auto text-yellow-400 font-bold text-lg">#3</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">64.1%</div>
                  <div className="text-xs text-zinc-500 mt-1">Tie-breaks</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">71.3%</div>
                  <div className="text-xs text-zinc-500 mt-1">Set decisivo</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">38.2%</div>
                  <div className="text-xs text-zinc-500 mt-1">Remontadas</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-500 text-right">Ver perfil completo →</div>
            </div>
          </Link>

        </div>
      </section>

    </main>
  );
}