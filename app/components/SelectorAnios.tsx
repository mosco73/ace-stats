"use client";

import { useEffect, useRef } from "react";

export default function SelectorAnios({
    jugadorId,
    anios,
    anioActivo,
}: {
    jugadorId: string;
    anios: number[];
    anioActivo: number | null;
}) {
    const contenedorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const activo = contenedorRef.current?.querySelector("[data-activo='true']");
        activo?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
    }, []);

    return (
        <div ref={contenedorRef} className="flex gap-2 mb-8 overflow-x-auto">
            <a href={`/jugadores/${jugadorId}`} data-activo={anioActivo === null} className={`text-sm px-4 py-2 rounded-full whitespace-nowrap ${anioActivo === null ? "bg-yellow-400 text-zinc-950 font-semibold" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                Carrera
            </a>
            {anios.map((a) => (
                <a key={a} href={`/jugadores/${jugadorId}?year=${a}`} data-activo={anioActivo === a} className={`text-sm px-4 py-2 rounded-full whitespace-nowrap ${anioActivo === a ? "bg-yellow-400 text-zinc-950 font-semibold" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                    {a}
                </a>
            ))}
        </div>
    );
}