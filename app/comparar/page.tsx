"use client";

import { useState } from "react";
import { jugadores } from "../data/jugadores";
import { rivalidades } from "../data/rivalidades";

type Jugador = typeof jugadores[number];

export default function CompararPage() {
  const [id1, setId1] = useState("djokovic");
  const [verTodos, setVerTodos] = useState(false);
  const [id2, setId2] = useState("sinner");

  const j1 = jugadores.find((j) => j.id === id1)!;
  const j2 = jugadores.find((j) => j.id === id2)!;

  const claveRivalidad = [id1, id2].sort().join("-");
  const rivalidad = id1 !== id2 ? rivalidades[claveRivalidad] : undefined;
  // Orientar los registros a/b al orden elegido en pantalla (j1 izquierda, j2 derecha)
  const reg = (campo: "total" | "dura" | "arcilla" | "cesped" | "indoor" | "finales" | "grandSlams") => {
    if (!rivalidad) return { v1: 0, v2: 0 };
    const r = rivalidad[campo];
    return rivalidad.jugadorA === id1 ? { v1: r.a, v2: r.b } : { v1: r.b, v2: r.a };
  };

  const colorSuperficie: Record<string, string> = {
    Hard: "bg-blue-400",
    Clay: "bg-orange-400",
    Grass: "bg-green-400",
    Carpet: "bg-purple-400",
  };
const inicial = (nombre: string) =>
    nombre.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  // Contexto narrativo de la rivalidad (calculado del array de partidos)
  const contexto = (() => {
    if (!rivalidad || rivalidad.partidos.length === 0) return null;
    const partidos = rivalidad.partidos;
    const primero = partidos[0];
    const ultimo = partidos[partidos.length - 1];
    // mayor racha de victorias consecutivas
    let mejorRacha = 0;
    let mejorGanador: "a" | "b" = "a";
    let rachaActual = 0;
    let ganadorActual: "a" | "b" | null = null;
    for (const p of partidos) {
      if (p.ganador === ganadorActual) {
        rachaActual++;
      } else {
        ganadorActual = p.ganador;
        rachaActual = 1;
      }
      if (rachaActual > mejorRacha) {
        mejorRacha = rachaActual;
        mejorGanador = p.ganador;
      }
    }
    const idRacha = mejorGanador === "a" ? rivalidad.jugadorA : rivalidad.jugadorB;
    const nombreRacha = jugadores.find((j) => j.id === idRacha)!.nombre;
    const anio = (f: number) => String(f).slice(0, 4);
    return {
      primera: `${primero.torneo} ${anio(primero.fecha)}`,
      ultima: `${ultimo.torneo} ${anio(ultimo.fecha)}`,
      racha: `${inicial(nombreRacha)} (${mejorRacha})`,
    };
  })();

  const desgloseH2H = [
    { label: "Dura", campo: "dura" as const, color: "bg-blue-400" },
    { label: "Arcilla", campo: "arcilla" as const, color: "bg-orange-400" },
    { label: "Césped", campo: "cesped" as const, color: "bg-green-400" },
    { label: "Indoor", campo: "indoor" as const, color: "bg-purple-400" },
    { label: "Finales", campo: "finales" as const, color: "bg-yellow-400" },
    { label: "Grand Slams", campo: "grandSlams" as const, color: "bg-yellow-400" },
  ];

  const filas: { label: string; valor: (j: Jugador) => number; sufijo: string }[] = [
    { label: "⭐ Clutch Rating", valor: (j) => j.clutchRating.total, sufijo: "" },
    { label: "Tie-breaks ganados", valor: (j) => j.stats.tiebreaks, sufijo: "%" },
    { label: "Set decisivo", valor: (j) => j.stats.setDecisivo, sufijo: "%" },
    { label: "Remontadas", valor: (j) => j.stats.remontadas, sufijo: "%" },
    { label: "vs Top 10", valor: (j) => j.stats.vsTop10, sufijo: "%" },
    { label: "Conversión finales", valor: (j) => j.stats.finales, sufijo: "%" },
    { label: "Dura", valor: (j) => j.superficie.dura.pct, sufijo: "%" },
    { label: "Arcilla", valor: (j) => j.superficie.arcilla.pct, sufijo: "%" },
    { label: "Césped", valor: (j) => j.superficie.cesped.pct, sufijo: "%" },
    { label: "Indoor", valor: (j) => j.superficie.indoor.pct, sufijo: "%" },
  ];

  
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

        {/* Selectores */}
        <div className="grid grid-cols-3 items-center mb-6 gap-4">
          <div className="text-center">
            <select
              value={id1}
              onChange={(e) => setId1(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm w-full mb-3 text-center cursor-pointer"
            >
              {jugadores.map((j) => (
                <option key={j.id} value={j.id}>{j.nombre}</option>
              ))}
            </select>
            <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-yellow-400 mx-auto mb-2">
              {inicial(j1.nombre)}
            </div>
            <div className="text-zinc-500 text-xs">{j1.pais} · {j1.ranking > 0 ? `#${j1.ranking}` : "Retirado"}</div>
          </div>

          <div className="text-center text-zinc-500 font-semibold">VS</div>

          <div className="text-center">
            <select
              value={id2}
              onChange={(e) => setId2(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm w-full mb-3 text-center cursor-pointer"
            >
              {jugadores.map((j) => (
                <option key={j.id} value={j.id}>{j.nombre}</option>
              ))}
            </select>
            <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-green-400 mx-auto mb-2">
              {inicial(j2.nombre)}
            </div>
            <div className="text-zinc-500 text-xs">{j2.pais} · {j2.ranking > 0 ? `#${j2.ranking}` : "Retirado"}</div>
          </div>
        </div>

        {/* Comparación */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5">
          {filas.map((fila) => {
            const v1 = fila.valor(j1);
            const v2 = fila.valor(j2);
            const ganaJ1 = v1 > v2;
            const ganaJ2 = v2 > v1;

            return (
              <div key={fila.label}>
                <div className="grid grid-cols-3 items-center text-sm mb-2">
                  <div className={`text-left font-bold ${ganaJ1 ? "text-yellow-400" : "text-zinc-300"}`}>
                    {v1.toFixed(1)}{fila.sufijo}
                  </div>
                  <div className="text-center text-zinc-500 text-xs">{fila.label}</div>
                  <div className={`text-right font-bold ${ganaJ2 ? "text-yellow-400" : "text-zinc-300"}`}>
                    {v2.toFixed(1)}{fila.sufijo}
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

        {/* Frente a frente */}
        {rivalidad ? (
          <div className="bg-zinc-900 border border-yellow-400/30 rounded-2xl p-6 mt-8">
            <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest mb-5 text-center">
              🎾 Frente a frente
            </h2>
            <div className="flex items-center justify-center gap-4 mb-1">
              <span className={`text-4xl font-bold ${reg("total").v1 > reg("total").v2 ? "text-yellow-400" : ""}`}>
                {reg("total").v1}
              </span>
              <span className="text-zinc-600 text-2xl">–</span>
              <span className={`text-4xl font-bold ${reg("total").v2 > reg("total").v1 ? "text-yellow-400" : ""}`}>
                {reg("total").v2}
              </span>
            </div>
            <p className="text-center text-zinc-500 text-xs mb-3">
              {reg("total").v1 + reg("total").v2} partidos
            </p>
            {contexto && (
              <p className="text-center text-zinc-500 text-xs mb-6">
                Primera vez: <span className="text-zinc-300">{contexto.primera}</span>
                {" · "}Último: <span className="text-zinc-300">{contexto.ultima}</span>
                {" · "}Mayor racha: <span className="text-zinc-300">{contexto.racha}</span>
              </p>
            )}

            <div className="space-y-3">
              {desgloseH2H.map((d) => {
                const { v1, v2 } = reg(d.campo);
                const total = v1 + v2;
                return (
                  <div key={d.label}>
                    <div className="grid grid-cols-3 items-center text-sm mb-1">
                      <div className={`text-left font-semibold ${total > 0 && v1 > v2 ? "text-yellow-400" : "text-zinc-300"}`}>{v1}</div>
                      <div className="text-center text-zinc-500 text-xs">{d.label}</div>
                      <div className={`text-right font-semibold ${total > 0 && v2 > v1 ? "text-yellow-400" : "text-zinc-300"}`}>{v2}</div>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-zinc-800">
                      {total > 0 && (
                        <>
                          <div className={d.color} style={{ width: `${(v1 / total) * 100}%`, opacity: 0.9 }}></div>
                          <div className="bg-zinc-950 w-px"></div>
                          <div className={d.color} style={{ width: `${(v2 / total) * 100}%`, opacity: 0.45 }}></div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Historial de partidos */}
            <div className="mt-6 border-t border-zinc-800 pt-5">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 text-center">
                Historial
              </h3>
              <div className="space-y-2">
                {[...rivalidad.partidos]
                  .reverse()
                  .slice(0, verTodos ? undefined : 10)
                  .map((p, i) => {
                    const ganadorId = p.ganador === "a" ? rivalidad.jugadorA : rivalidad.jugadorB;
                    const ganador = jugadores.find((j) => j.id === ganadorId)!;
                    return (
                      <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-zinc-800/60 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-zinc-500 text-xs shrink-0">{String(p.fecha).slice(0, 4)}</span>
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorSuperficie[p.superficie] ?? "bg-zinc-600"}`}></div>
                          <span className="text-zinc-300 truncate">{p.torneo}</span>
                          <span className="text-zinc-600 text-xs shrink-0">{p.ronda}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="font-semibold text-yellow-400 text-xs">{inicial(ganador.nombre)}</span>
                          <span className="text-zinc-400 text-xs">{p.score}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
              {rivalidad.partidos.length > 10 && (
                <button
                  onClick={() => setVerTodos(!verTodos)}
                  className="mt-3 w-full text-center text-xs text-zinc-500 hover:text-yellow-400 transition-colors"
                >
                  {verTodos ? "Ver menos" : `Ver los ${rivalidad.partidos.length} partidos`}
                </button>
              )}
            </div>

            <p className="text-zinc-600 text-xs mt-5 text-center">
              Head-to-head oficial ATP · sin walkovers
            </p>
          </div>
        ) : id1 !== id2 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-6 text-center text-zinc-500 text-sm">
            {j1.nombre.split(" ").pop()} y {j2.nombre.split(" ").pop()} nunca se
            enfrentaron en el circuito ATP.
          </div>
        ) : null}

      </section>
    </main>
  );
}
