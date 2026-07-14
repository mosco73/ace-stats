"use client";

import { jugadores, CLUTCH_RATING_PROMEDIO_ATP } from "../data/jugadores";
import { useState } from "react";

const colores: Record<string, string> = {
  federer: "text-red-400",
  nadal: "text-orange-400",
  djokovic: "text-yellow-400",
  alcaraz: "text-blue-400",
  sinner: "text-green-400",
  medvedev: "text-purple-400",
  murray: "text-cyan-400",
  zverev: "text-teal-400",
  tsitsipas: "text-sky-400",
  fritz: "text-indigo-400",
  wawrinka: "text-rose-400",
  rublev: "text-pink-400",
  ruud: "text-lime-400",
  shelton: "text-violet-400",
  delpotro: "text-fuchsia-400",
  roddick: "text-emerald-400",
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
    formato: (v) => `${v.toFixed(1)}%`,
  },
  {
    label: "Tiebreaks",
    valor: (j) => j.stats.tiebreaks,
    formato: (v) => `${v.toFixed(1)}%`,
  },
  {
    label: "Set decisivo",
    valor: (j) => j.stats.setDecisivo,
    formato: (v) => `${v.toFixed(1)}%`,
  },
  {
    label: "Remontadas",
    valor: (j) => j.stats.remontadas,
    formato: (v) => `${v.toFixed(1)}%`,
  },
  {
    label: "Conversión de finales",
    valor: (j) => j.stats.finales,
    formato: (v) => `${v.toFixed(1)}%`,
  },
];

const categoriasSuperficie: Categoria[] = [
  {
    label: "Dura",
    valor: (j) => j.superficie.dura.pct,
    formato: (v) => `${v.toFixed(1)}%`,
  },
  {
    label: "Arcilla",
    valor: (j) => j.superficie.arcilla.pct,
    formato: (v) => `${v.toFixed(1)}%`,
  },
  {
    label: "Césped",
    valor: (j) => j.superficie.cesped.pct,
    formato: (v) => `${v.toFixed(1)}%`,
  },
  {
    label: "Indoor",
    valor: (j) => j.superficie.indoor.pct,
    formato: (v) => `${v.toFixed(1)}%`,
  },
];

const componentesClutch = [
  { label: "Set decisivo", peso: "25%" },
  { label: "Finales", peso: "25%" },
  { label: "Tie-breaks", peso: "20%" },
  { label: "BP salvados", peso: "10%" },
  { label: "BP convertidos", peso: "10%" },
  { label: "Remontadas", peso: "10%" },
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

function SeccionMetricas() {
  const ordenados = [...jugadores].sort(
    (a, b) => b.clutchRating.total - a.clutchRating.total
  );

  return (
    <div className="space-y-4 md:col-span-2">
      {/* Header de la métrica */}
      <div className="bg-zinc-900 border border-yellow-400/40 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <span>⭐</span>
          <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest">
            Clutch Rating
          </h2>
        </div>
        <p className="text-zinc-300">
          La métrica propia de Ace Stats. Mide el rendimiento bajo presión
          combinando seis situaciones clave de la carrera de un jugador,
          comparadas contra todo el circuito ATP desde el año 2000.
        </p>
      </div>

      {/* Ranking */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Ranking histórico
        </h3>
        <div className="space-y-3">
          {ordenados.map((j, i) => (
            <div key={j.id} className="py-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-sm w-5">{i + 1}</span>
                  <span className={`font-semibold ${colores[j.id]}`}>
                    {j.nombre}
                  </span>
                </div>
                <span className="font-bold text-lg">
                  {j.clutchRating.total.toFixed(1)}
                </span>
              </div>
              <div className="ml-8 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${j.clutchRating.total.toFixed(1)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-zinc-500 text-sm mt-4">
          Promedio ATP: {CLUTCH_RATING_PROMEDIO_ATP} · Escala 0-100
        </p>
      </div>

      {/* Cómo se calcula */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          ¿Cómo se calcula?
        </h3>
        <p className="text-zinc-300 mb-4">
          Cada componente es el percentil del jugador dentro del circuito: un
          97 significa &ldquo;mejor que el 97% de los jugadores ATP en esa
          situación&rdquo;. El número final es el promedio ponderado de las
          seis, con ajuste estadístico para muestras chicas.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {componentesClutch.map((c) => (
            <div
              key={c.label}
              className="flex items-center justify-between bg-zinc-800/60 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-zinc-300">{c.label}</span>
              <span className="text-sm font-semibold text-yellow-400">
                {c.peso}
              </span>
            </div>
          ))}
        </div>
        <p className="text-zinc-500 text-sm mt-4">
          El desglose completo de cada jugador está en su perfil.
        </p>
      </div>
    </div>
  );
}

export default function Records() {
  const [tab, setTab] = useState<
    "metricas" | "carrera" | "presion" | "superficie"
  >("metricas");

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="px-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Records</h1>
        <p className="text-zinc-400 text-lg max-w-xl mx-auto">
          Rankings comparativos entre los grandes de la era moderna.
        </p>
      </section>

      <section className="px-6 max-w-3xl mx-auto mb-8 flex gap-2 justify-center flex-wrap">
        <button
          onClick={() => setTab("metricas")}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            tab === "metricas"
              ? "bg-yellow-400 text-zinc-950"
              : "bg-zinc-900 text-zinc-400 hover:text-white"
          }`}
        >
          ⭐ Métricas
        </button>
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
        {tab === "metricas" && <SeccionMetricas />}
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
