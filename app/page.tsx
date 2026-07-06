import Link from "next/link";
import { jugadores } from "./data/jugadores";

const destacados = jugadores.filter(j => 
  ["sinner", "djokovic", "alcaraz", "medvedev"].includes(j.id)
);

const leyendas = jugadores.filter(j => 
  ["federer", "nadal"].includes(j.id)
);

const colores: Record<string, string> = {
  federer: "text-red-400",
  nadal: "text-orange-400",
  djokovic: "text-yellow-400",
  alcaraz: "text-blue-400",
  sinner: "text-green-400",
  medvedev: "text-purple-400",
};

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {destacados.map(j => (
            <Link key={j.id} href={`/jugadores/${j.id}`}>
              <div className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-2xl p-6 cursor-pointer transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold ${colores[j.id]}`}>
                    {j.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{j.nombre}</div>
                    <div className="text-zinc-400 text-xs">{j.pais} · #{j.ranking} ATP</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-800 rounded-xl p-2 text-center">
                    <div className="text-base font-bold">{j.stats.tiebreaks}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Tie-breaks</div>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-2 text-center">
                    <div className="text-base font-bold">{j.stats.setDecisivo}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Set decisivo</div>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-2 text-center">
                    <div className="text-base font-bold">{j.stats.vsTop10}%</div>
                    <div className="text-xs text-zinc-500 mt-1">vsTop10</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-zinc-500 text-right">Ver perfil completo →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 max-w-5xl mx-auto mb-16">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Leyendas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leyendas.map(j => (
            <Link key={j.id} href={`/jugadores/${j.id}`}>
              <div className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-2xl p-6 cursor-pointer transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold ${colores[j.id]}`}>
                    {j.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold">{j.nombre}</div>
                    <div className="text-zinc-400 text-sm">{j.pais} · Retirado</div>
                  </div>
                  <div className="ml-auto text-zinc-400 font-bold text-sm">{j.grandSlams} GS</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{j.stats.tiebreaks}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Tie-breaks</div>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{j.superficie.arcilla.pct}%</div>
                    <div className="text-xs text-zinc-500 mt-1">Arcilla</div>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{j.semanas1}</div>
                    <div className="text-xs text-zinc-500 mt-1">Sem. #1</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-zinc-500 text-right">Ver perfil completo →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}