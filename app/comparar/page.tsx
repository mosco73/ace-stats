"use client";

import { useState } from "react";
import { jugadores } from "../data/jugadores";

export default function CompararPage() {
  const [id1, setId1] = useState("djokovic");
  const [id2, setId2] = useState("sinner");

  const j1 = jugadores.find((j) => j.id === id1)!;
  const j2 = jugadores.find((j) => j.id === id2)!;

  const filas = [
    { label: "Tie-breaks ganados", key: "tiebreaks" },
    { label: "Set decisivo", key: "setDecisivo" },
    { label: "Remontadas", key: "remontadas" },
    { label: "vs Top 10", key: "vsTop10" },
    { label: "Conversión finales", key: "finales" },
    { label: "Indoor", key: "indoor" },
  ] as const;

  const inicial = (nombre: string) =>
    nombre.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

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
            <div className="text-zinc-500 text-xs">{j1.pais} · #{j1.ranking}</div>
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
            <div className="text-zinc-500 text-xs">{j2.pais} · #{j2.ranking}</div>
          </div>
        </div>

        {/* Comparación */}
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