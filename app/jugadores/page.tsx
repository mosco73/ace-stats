"use client";

import Link from "next/link";
import { useState } from "react";
import { jugadores } from "../data/jugadores";

export default function JugadoresPage() {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = jugadores.filter((j) =>
    j.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

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

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Todos los jugadores</h1>

        <input
          type="text"
          placeholder="Buscar jugador..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm w-full mb-8 outline-none focus:border-yellow-400"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtrados.map((j) => (
            <Link key={j.id} href={`/jugadores/${j.id}`}>
              <div className="bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-2xl p-5 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-yellow-400">
                    {inicial(j.nombre)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{j.nombre}</div>
                    <div className="text-zinc-500 text-xs">
                      {j.pais} · {j.ranking > 0 ? `#${j.ranking}` : "Retirado"}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="text-zinc-500 text-center py-10">No se encontró ningún jugador.</div>
        )}
      </section>
    </main>
  );
}