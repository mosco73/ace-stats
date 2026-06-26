import { jugadores } from "../../data/jugadores";
import { notFound } from "next/navigation";

export default async function JugadorPage({
    params,
}: {
    params: Promise<{ nombre: string }>;
}) {
    const { nombre } = await params;
    const jugador = jugadores.find((j) => j.id === nombre);

    if (!jugador) {
        notFound();
    }

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
                        {jugador.nombre.split(" ").map((p) => p[0]).join("")}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{jugador.nombre}</h1>
                        <p className="text-zinc-400 mt-1">{jugador.pais} · {jugador.mano === "L" ? "Zurdo" : "Diestro"} · Pro desde {jugador.proDesde}</p>
                        <div className="flex gap-3 mt-2">
                            <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">{jugador.grandSlams} Grand Slams</span>
                            <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full">{jugador.semanas1} semanas #1</span>
                            {jugador.ranking === -1 ? (
                                <span className="text-xs bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full font-semibold">Retirado</span>
                            ) : (
                                <span className="text-xs bg-zinc-700 text-zinc-300 px-3 py-1 rounded-full font-semibold">Ranking #{jugador.ranking}</span>
                            )}
                        </div>
                    </div>
                </div>

                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                    Estadísticas avanzadas
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Tie-breaks ganados</div>
                        <div className="text-2xl font-bold">{jugador.stats.tiebreaks}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Carrera completa</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Set decisivo</div>
                        <div className="text-2xl font-bold">{jugador.stats.setDecisivo}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Histórico ATP</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Remontadas</div>
                        <div className="text-2xl font-bold">{jugador.stats.remontadas}%</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">vs Top 10</div>
                        <div className="text-2xl font-bold">{jugador.stats.vsTop10}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Carrera completa</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Conversión finales</div>
                        <div className="text-2xl font-bold">{jugador.stats.finales}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Carrera completa</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">5to set en Grand Slams</div>
                        <div className="text-2xl font-bold">{jugador.stats.quintosSetGS}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Histórico</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Break points salvados</div>
                        <div className="text-2xl font-bold">{jugador.stats.bpSalvados}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Carrera completa</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Break points convertidos</div>
                        <div className="text-2xl font-bold">{jugador.stats.bpConvertidos}%</div>
                        <div className="text-xs text-zinc-500 mt-1">Carrera completa</div>
                    </div>
                </div>

                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                    vs Top 10 por superficie
                </h2>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                        <div className="text-xs text-zinc-500 mb-1">Dura</div>
                        <div className="text-xl font-bold text-blue-400">{jugador.superficie.vsTop10PorSuperficie.dura}%</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                        <div className="text-xs text-zinc-500 mb-1">Arcilla</div>
                        <div className="text-xl font-bold text-orange-400">{jugador.superficie.vsTop10PorSuperficie.arcilla}%</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                        <div className="text-xs text-zinc-500 mb-1">Césped</div>
                        <div className="text-xl font-bold text-green-400">{jugador.superficie.vsTop10PorSuperficie.cesped}%</div>
                    </div>
                </div>

                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                    Rendimiento por superficie
                </h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
                    {(["dura", "arcilla", "cesped", "indoor"] as const).map((sup) => {
                        const colores = { dura: "blue", arcilla: "orange", cesped: "green", indoor: "purple" };
                        const nombres = { dura: "Dura", arcilla: "Arcilla", cesped: "Césped", indoor: "Indoor" };
                        const d = jugador.superficie[sup];
                        const color = colores[sup];
                        return (
                            <div key={sup}>
                                <div className="flex justify-between text-sm mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full bg-${color}-400`}></div>
                                        <span>{nombres[sup]}</span>
                                    </div>
                                    <span className="font-semibold">{d.pct}%</span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-2">
                                    <div className={`bg-${color}-400 h-2 rounded-full`} style={{ width: `${d.pct}%` }}></div>
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">{d.victorias}V · {d.derrotas}D</div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}