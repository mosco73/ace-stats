import { jugadores, CLUTCH_RATING_PROMEDIO_ATP, DATOS_ACTUALIZADOS_AL } from "../../data/jugadores";
import { supabase } from "../../lib/supabase";
import { torneos } from "../../data/torneos";
import { notFound } from "next/navigation";
const MUESTRA_MINIMA = 10;

function ValorTarjeta({ pct, muestra, ganados, sufijo, color = "", size = "text-2xl" }: { pct: number; muestra: number | null; ganados: number | null; sufijo: string; color?: string; size?: string }) {
    if (muestra !== null && muestra < MUESTRA_MINIMA) {
        return (
            <>
                <div className="text-[15px] font-semibold text-zinc-400">
                    {pct.toFixed(1)}% <span className="text-zinc-500 font-normal">· {ganados} de {muestra}</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">Muestra limitada</div>
            </>
        );
    }
    return (
        <>
            <div className={`${size} font-bold ${color}`}>{pct.toFixed(1)}%</div>
            {sufijo && <div className="text-xs text-zinc-500 mt-1">{sufijo}</div>}
        </>
    );
}

export default async function JugadorPage({
    params,
    searchParams,
}: {
    params: Promise<{ nombre: string }>;
    searchParams: Promise<{ year?: string }>;
}) {
    const { nombre } = await params;
    const { year } = await searchParams;
    const anioSeleccionado = year ? parseInt(year, 10) : null;
    const jugador = jugadores.find((j) => j.id === nombre);

    if (!jugador) {
        notFound();
    }

    const { data: temporadas } = await supabase
        .from("stats_por_temporada")
        .select("anio")
        .eq("jugador_id", nombre)
        .order("anio", { ascending: false });

    const anios = (temporadas ?? []).map((t) => t.anio);
    let statsTemporada = null;
    if (anioSeleccionado && anios.includes(anioSeleccionado)) {
        const { data } = await supabase
            .from("stats_por_temporada")
            .select("*")
            .eq("jugador_id", nombre)
            .eq("anio", anioSeleccionado)
            .single();
        statsTemporada = data;
    }
    const stats = statsTemporada ? statsTemporada.stats_detalle : null;
    const pct = (num: number, den: number) => (den ? (100 * num) / den : 0);

    const tiebreaksPct = stats ? pct(stats.tiebreaks.ganados, stats.tiebreaks.jugados) : jugador.stats.tiebreaks;
    const setDecisivoPct = stats ? pct(stats.set_decisivo.ganados, stats.set_decisivo.jugados) : jugador.stats.setDecisivo;
    const remontadasPct = stats ? pct(stats.remontadas.exitosas, stats.remontadas.intentadas) : jugador.stats.remontadas;
    const vsTop10Pct = stats ? stats.vs_top10.pct : jugador.stats.vsTop10;
    const finalesPct = stats ? stats.finales.pct : jugador.stats.finales;
    const quintosSetGSPct = stats ? stats.quintos_set_gs.pct : jugador.stats.quintosSetGS;
    const masters1000 = stats ? stats.masters1000 : jugador.stats.masters1000;
    const bpSalvadosPct = stats ? pct(stats.bp_salvados.salvados, stats.bp_salvados.enfrentados) : jugador.stats.bpSalvados;
    const bpConvertidosPct = stats ? pct(stats.bp_convertidos.convertidos, stats.bp_convertidos.enfrentados) : jugador.stats.bpConvertidos;
    const svGanadosPct = stats ? pct(stats.saque_ganado.ganados, stats.saque_ganado.total) : jugador.stats.svGanados;
    const devGanadosPct = stats ? pct(stats.devolucion_ganada.ganados, stats.devolucion_ganada.total) : jugador.stats.devGanados;
    const etiquetaPeriodo = statsTemporada ? `Temporada ${statsTemporada.anio}` : "Carrera completa";
    const vsTop10Dura = stats ? (stats.vs_top10_dura?.pct ?? 0) : jugador.superficie.vsTop10PorSuperficie.dura;
    const vsTop10Arcilla = stats ? (stats.vs_top10_arcilla?.pct ?? 0) : jugador.superficie.vsTop10PorSuperficie.arcilla;
    const vsTop10Cesped = stats ? (stats.vs_top10_cesped?.pct ?? 0) : jugador.superficie.vsTop10PorSuperficie.cesped;
    const vd = (o: { victorias?: number; derrotas?: number } | undefined) => o ? (o.victorias ?? 0) + (o.derrotas ?? 0) : 0;

    const muestraTiebreaks = stats ? stats.tiebreaks.jugados : null;
    const muestraSetDecisivo = stats ? stats.set_decisivo.jugados : null;
    const muestraRemontadas = stats ? stats.remontadas.intentadas : null;
    const muestraVsTop10 = stats ? vd(stats.vs_top10) : null;
    const muestraFinales = stats ? vd(stats.finales) : null;
    const muestraQuintosSetGS = stats ? vd(stats.quintos_set_gs) : null;
    const muestraMasters1000 = stats ? vd(stats.masters1000) : null;
    const muestraVsTop10Dura = stats ? vd(stats.vs_top10_dura) : null;
    const muestraVsTop10Arcilla = stats ? vd(stats.vs_top10_arcilla) : null;
    const muestraVsTop10Cesped = stats ? vd(stats.vs_top10_cesped) : null;

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <a href="/" className="font-semibold tracking-tight hover:text-yellow-400">Ace Stats</a>
                </div>
                <div className="flex gap-6 text-sm text-zinc-400">
                    <a href="/jugadores" className="hover:text-white">← Volver</a>
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
                {anios.length > 0 && (
                    <div className="flex gap-2 mb-8 overflow-x-auto">
                        <a href={`/jugadores/${jugador.id}`} className={`text-sm px-4 py-2 rounded-full whitespace-nowrap ${!statsTemporada ? "bg-yellow-400 text-zinc-950 font-semibold" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                            Carrera
                        </a>
                        {anios.map((a) => (
                            <a key={a} href={`/jugadores/${jugador.id}?year=${a}`} className={`text-sm px-4 py-2 rounded-full whitespace-nowrap ${statsTemporada?.anio === a ? "bg-yellow-400 text-zinc-950 font-semibold" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                                {a}
                            </a>
                        ))}
                    </div>
                )}
                {statsTemporada && (
                    <div className="mb-6">
                        <p className="text-lg font-semibold text-white">
                            Temporada {statsTemporada.anio} · {statsTemporada.partidos_totales} partidos
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                            Datos actualizados al {new Date(statsTemporada.actualizado_en).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                )}

                {!statsTemporada && (<div className="bg-zinc-900 border-2 border-yellow-400/40 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-400">⭐</span>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
            Clutch Rating
          </h2>
        </div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-5xl font-bold">{jugador.clutchRating.total.toFixed(1)}</span>
          <span className="text-sm text-zinc-500">
            {jugador.clutchRating.confianzaGlobal === "alta"
              ? "🟢 Alta confianza"
              : jugador.clutchRating.confianzaGlobal === "moderada"
              ? "🟡 Muestra moderada"
              : "🔴 Muestra insuficiente"}
          </span>
        </div>
        <p className="text-zinc-400 text-sm mb-4">Capacidad para rendir bajo presión · vs. circuito ATP desde 2000 · <a href="/metodologia" className="text-yellow-400 hover:underline">metodología</a></p>
        <div className="flex gap-6 text-sm text-zinc-400 mb-4">
          <span>Percentil {jugador.clutchRating.percentil.toFixed(1)}</span>
          <span>Promedio ATP: {CLUTCH_RATING_PROMEDIO_ATP}</span>
        </div>
        <div className="border-t border-zinc-800 pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Tie-breaks</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{jugador.clutchRating.detalle.tiebreaks.normalizado.toFixed(1)}</span>
              <span>{jugador.clutchRating.detalle.tiebreaks.confianza === "alta" ? "🟢" : jugador.clutchRating.detalle.tiebreaks.confianza === "moderada" ? "🟡" : "🔴"}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Set decisivo</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{jugador.clutchRating.detalle.setDecisivo.normalizado.toFixed(1)}</span>
              <span>{jugador.clutchRating.detalle.setDecisivo.confianza === "alta" ? "🟢" : jugador.clutchRating.detalle.setDecisivo.confianza === "moderada" ? "🟡" : "🔴"}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Finales</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{jugador.clutchRating.detalle.finales.normalizado.toFixed(1)}</span>
              <span>{jugador.clutchRating.detalle.finales.confianza === "alta" ? "🟢" : jugador.clutchRating.detalle.finales.confianza === "moderada" ? "🟡" : "🔴"}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Remontadas</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{jugador.clutchRating.detalle.remontadas.normalizado.toFixed(1)}</span>
              <span>{jugador.clutchRating.detalle.remontadas.confianza === "alta" ? "🟢" : jugador.clutchRating.detalle.remontadas.confianza === "moderada" ? "🟡" : "🔴"}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">BP salvados</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{jugador.clutchRating.detalle.bpSalvados.normalizado.toFixed(1)}</span>
              <span>{jugador.clutchRating.detalle.bpSalvados.confianza === "alta" ? "🟢" : jugador.clutchRating.detalle.bpSalvados.confianza === "moderada" ? "🟡" : "🔴"}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">BP convertidos</span>
            <span className="flex items-center gap-2">
              <span className="font-semibold">{jugador.clutchRating.detalle.bpConvertidos.normalizado.toFixed(1)}</span>
              <span>{jugador.clutchRating.detalle.bpConvertidos.confianza === "alta" ? "🟢" : jugador.clutchRating.detalle.bpConvertidos.confianza === "moderada" ? "🟡" : "🔴"}</span>
            </span>
          </div>
        </div>
      </div> 
                )}
      
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                    Estadísticas avanzadas
                </h2>
                {!statsTemporada && jugador.ranking !== -1 && (
    <p className="text-xs text-zinc-500 mb-4">
        Datos actualizados al {DATOS_ACTUALIZADOS_AL}
    </p>
)}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Tie-breaks ganados</div>
                        <ValorTarjeta pct={tiebreaksPct} muestra={muestraTiebreaks} ganados={stats ? stats.tiebreaks.ganados : null} sufijo={etiquetaPeriodo} />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Set decisivo</div>
                        <ValorTarjeta pct={setDecisivoPct} muestra={muestraSetDecisivo} ganados={stats ? stats.set_decisivo.ganados : null} sufijo={etiquetaPeriodo} />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Remontadas</div>
                        <ValorTarjeta pct={remontadasPct} muestra={muestraRemontadas} ganados={stats ? stats.remontadas.exitosas : null} sufijo={etiquetaPeriodo} />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">vs Top 10</div>
                        <ValorTarjeta pct={vsTop10Pct} muestra={muestraVsTop10} ganados={stats ? stats.vs_top10.victorias : null} sufijo={etiquetaPeriodo} />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Conversión finales</div>
                        <ValorTarjeta pct={finalesPct} muestra={muestraFinales} ganados={stats ? stats.finales.victorias : null} sufijo={etiquetaPeriodo} />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">5to set en Grand Slams</div>
                        <ValorTarjeta pct={quintosSetGSPct} muestra={muestraQuintosSetGS} ganados={stats ? stats.quintos_set_gs.victorias : null} sufijo={etiquetaPeriodo} />
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1">Masters 1000</div>
                        <ValorTarjeta pct={masters1000.pct} muestra={muestraMasters1000} ganados={masters1000.victorias} sufijo={`${masters1000.victorias}V · ${masters1000.derrotas}D`} />
                    </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-xs text-zinc-500 mb-1">Break points salvados</div>
                    <div className="text-2xl font-bold">{bpSalvadosPct.toFixed(1)}%</div>
                    <div className="text-xs text-zinc-500 mt-1">{etiquetaPeriodo}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-xs text-zinc-500 mb-1">Break points convertidos</div>
                    <div className="text-2xl font-bold">{bpConvertidosPct.toFixed(1)}%</div>
                    <div className="text-xs text-zinc-500 mt-1">{etiquetaPeriodo}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-xs text-zinc-500 mb-1">Juegos de saque ganados</div>
                    <div className="text-2xl font-bold">{svGanadosPct.toFixed(1)}%</div>
                    <div className="text-xs text-zinc-500 mt-1">{etiquetaPeriodo}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="text-xs text-zinc-500 mb-1">Juegos de devolución ganados</div>
                    <div className="text-2xl font-bold">{devGanadosPct.toFixed(1)}%</div>
                    <div className="text-xs text-zinc-500 mt-1">{etiquetaPeriodo}</div>
                </div>
            </div>

            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                vs Top 10 por superficie
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-zinc-500 mb-1">Dura</div>
                    <ValorTarjeta pct={vsTop10Dura} muestra={muestraVsTop10Dura} ganados={stats ? stats.vs_top10_dura?.victorias ?? 0 : null} sufijo="" color="text-blue-400" size="text-xl" />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-zinc-500 mb-1">Arcilla</div>
                    <ValorTarjeta pct={vsTop10Arcilla} muestra={muestraVsTop10Arcilla} ganados={stats ? stats.vs_top10_arcilla?.victorias ?? 0 : null} sufijo="" color="text-orange-400" size="text-xl" />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                    <div className="text-xs text-zinc-500 mb-1">Césped</div>
                    <ValorTarjeta pct={vsTop10Cesped} muestra={muestraVsTop10Cesped} ganados={stats ? stats.vs_top10_cesped?.victorias ?? 0 : null} sufijo="" color="text-green-400" size="text-xl" />
                </div>
            </div>

            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Rendimiento por superficie
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
                {(["dura", "arcilla", "cesped", "indoor"] as const).map((sup) => {
                   const colores = { dura: "bg-blue-400", arcilla: "bg-orange-400", cesped: "bg-green-400", indoor: "bg-purple-400" };
                    const nombres = { dura: "Dura", arcilla: "Arcilla", cesped: "Césped", indoor: "Indoor" };
                    const d = (stats ? stats[sup] : jugador.superficie[sup]) ?? { pct: 0, victorias: 0, derrotas: 0 };
                    const color = colores[sup];
                    return (
                        <div key={sup}>
                            <div className="flex justify-between text-sm mb-2">
                                <div className="flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full ${color}`}></div>
                                    <span>{nombres[sup]}</span>
                                </div>
                                <span className="font-semibold">{d.pct.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                               <div className={`${color} h-2 rounded-full`} style={{ width: `${d.pct}%` }}></div>
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">{d.victorias}V · {d.derrotas}D</div>
                        </div>
                    );
                })}
            </div>

            {!statsTemporada && (torneos[jugador.id] ?? []).length > 0 && (
                <>
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4 mt-10">
                        Torneos grandes
                    </h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4">
                        {torneos[jugador.id].map((t) => (
                            <div key={t.torneo}>
                                <div className="flex justify-between text-sm mb-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`text-xs shrink-0 ${t.categoria === "GS" ? "text-yellow-400" : "text-zinc-500"}`}>
                                            {t.categoria === "GS" ? "GS" : "M1000"}
                                        </span>
                                        <span className="truncate">{t.torneo}</span>
                                        {t.titulos > 0 && (
                                            <span className="text-yellow-400 text-xs shrink-0">
                                                🏆{t.titulos > 1 ? `×${t.titulos}` : ""}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-semibold shrink-0">{t.pct.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${t.pct}%` }}></div>
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">{t.victorias}V · {t.derrotas}D</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
        </main >
    );
}