"use client";

import { jugadores } from "../data/jugadores";
import { useState } from "react";

const colores: Record<string, string> = {
  federer: "text-red-400",
  nadal: "text-orange-400",
  djokovic: "text-yellow-400",
  alcaraz: "text-blue-400",
  sinner: "text-green-400",
  medvedev: "text-purple-400",
};

type Categoria = {
  label: string;
  valor: (j: typeof jugadores[number]) => number;
  formato: (v: number) => string;
};

const categoriasCarrera: Categoria[] = [
  {
    label: "Grand Slams",
    valor: (j) => j.grandSlams,
    formato: (v) => `${v}`,
  },
  {
    label: "Semanas en el N°1",
    valor: (j) => j.semanas1,
    formato: (v) => `${v}`,
  },
];
const categoriasPresion: Categoria[] = [
  {
    label: "vs Top 10",
    valor: (j) => j.stats.vsTop10,
    formato: (v) => `${v}%`,
  },
  {
    label: "Tiebreaks",
    valor: (j) => j.stats.tiebreaks,
    formato: (v) => `${v}%`,
  },
  {
    label: "Set decisivo",
    valor: (j) => j.stats.setDecisivo,
    formato: (v) => `${v}%`,
  },
  {
    label: "Remontadas",
    valor: (j) => j.stats.remontadas,
    formato: (v) => `${v}%`,
  },
  {
    label: "Conversión de finales",
    valor: (j) => j.stats.finales,
    formato: (v) => `${v}%`,
  },
];

const categoriasSuperficie: Categoria[] = [
  {
    label: "Dura",
    valor: (j) => j.superficie.dura.pct,
    formato: (v) => `${v}%`,
  },
  {
    label: "Arcilla",
    valor: (j) => j.superficie.arcilla.pct,
    formato: (v) => `${v}%`,
  },
  {
    label: "Césped",
    valor: (j) => j.superficie.cesped.pct,
    formato: (v) => `${v}%`,
  },
  {
    label: "Indoor",
    valor: (j) => j.superficie.indoor.pct,
    formato: (v) => `${v}%`,
  },
];

function TablaRecord({ categoria }: { categoria: Categoria }) {
  const ordenados = [...jugadores].sort(
    (a, b) => categoria.valor(b) - categoria.valor(a)
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
        {categoria.label}
      </h3>
      <div className="space-y-2">
        {ordenados.map((j, i) => (
          <div
            key={j.id}
            className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-zinc-500 text-sm w-5">{i + 1}</span>
              <span className={`font-semibold ${colores[j.id]}`}>
                {j.nombre}
              </span>
            </div>
            <span className="font-bold">{categoria.formato(categoria.valor(j))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Records() {
 const [tab, setTab] = useState<"carrera" | "presion" | "superficie">("carrera");

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Records</h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Rankings comparativos entre los grandes de la era moderna.
        </p>
      </section>

      <section className="px-6 max-w-3xl mx-auto mb-8 flex gap-2 justify-center">
        <button
          onClick={() => setTab("carrera")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            tab === "carrera"
              ? "bg-yellow-400 text-zinc-950"
              : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          Carrera
        </button>
        <button
          onClick={() => setTab("presion")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            tab === "presion"
              ? "bg-yellow-400 text-zinc-950"
              : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          Presión
        </button>
        <button
          onClick={() => setTab("superficie")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            tab === "superficie"
              ? "bg-yellow-400 text-zinc-950"
              : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          Superficie
        </button>
      </section>

<section className="px-6 max-w-3xl mx-auto mb-16 grid grid-cols-1 md:grid-cols-2 gap-4">
        {tab === "carrera" &&
          categoriasCarrera.map((cat) => (
            <TablaRecord key={cat.label} categoria={cat} />
          ))}
        {tab === "presion" &&
          categoriasPresion.map((cat) => (
            <TablaRecord key={cat.label} categoria={cat} />
          ))}
        {tab === "superficie" &&
          categoriasSuperficie.map((cat) => (
            <TablaRecord key={cat.label} categoria={cat} />
          ))}
      </section>
    </main>
  );
}