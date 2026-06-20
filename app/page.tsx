import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span className="font-semibold tracking-tight">Ace Stats</span>
        </div>
        <div className="flex gap-6 text-sm text-zinc-400">
          <a href="/jugadores" className="hover:text-white">Jugadores</a>
          <span className="text-zinc-600">Rankings</span>
          <a href="/comparar" className="hover:text-white">Comparar</a>
        </div>
      </nav>

      <section className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Estadísticas de tenis <span className="text-yellow-400">que no encontrás en otro lado</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Tie-breaks, remontadas, rendimiento por superficie, récord vs Top 10 y mucho más.
        </p>
      </section>

      <section className="px-6 max-w-5xl mx-auto mb-10">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Jugadores destacados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <Link href="/jugadores/sinner">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-2xl p-6 cursor-pointer transition-all">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-green-400">
                  JS
                </div>
                <div>
                  <div className="font-semibold">Jannik Sinner</div>
                  <div className="text-zinc-400 text-sm">Italia · #1 ATP</div>
                </div>
                <div className="ml-auto text-yellow-400 font-bold text-lg">#1</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">68.3%</div>
                  <div className="text-xs text-zinc-500 mt-1">Tie-breaks</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">74.2%</div>
                  <div className="text-xs text-zinc-500 mt-1">Set decisivo</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">39.1%</div>
                  <div className="text-xs text-zinc-500 mt-1">Remontadas</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-500 text-right">Ver perfil completo →</div>
            </div>
          </Link>

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

      <section className="px-6 max-w-5xl mx-auto mb-16">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Leyendas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Link href="/jugadores/federer">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-2xl p-6 cursor-pointer transition-all">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-red-400">
                  RF
                </div>
                <div>
                  <div className="font-semibold">Roger Federer</div>
                  <div className="text-zinc-400 text-sm">Suiza · Retirado</div>
                </div>
                <div className="ml-auto text-zinc-400 font-bold text-sm">20 GS</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">70.1%</div>
                  <div className="text-xs text-zinc-500 mt-1">Tie-breaks</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">87.6%</div>
                  <div className="text-xs text-zinc-500 mt-1">Césped</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">310</div>
                  <div className="text-xs text-zinc-500 mt-1">Sem. #1</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-500 text-right">Ver perfil completo →</div>
            </div>
          </Link>

          <Link href="/jugadores/nadal">
            <div className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-2xl p-6 cursor-pointer transition-all">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-orange-400">
                  RN
                </div>
                <div>
                  <div className="font-semibold">Rafael Nadal</div>
                  <div className="text-zinc-400 text-sm">España · Retirado</div>
                </div>
                <div className="ml-auto text-zinc-400 font-bold text-sm">22 GS</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">61.8%</div>
                  <div className="text-xs text-zinc-500 mt-1">Tie-breaks</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">92.1%</div>
                  <div className="text-xs text-zinc-500 mt-1">Arcilla</div>
                </div>
                <div className="bg-zinc-800 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold">209</div>
                  <div className="text-xs text-zinc-500 mt-1">Sem. #1</div>
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