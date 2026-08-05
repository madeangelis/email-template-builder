"use client";

import { useState, type ReactNode } from "react";

interface EditorSectionProps {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  /** Si se pasa, muestra un contador (ej. "6 noticias") junto al título. */
  contador?: number;
  defaultAbierto?: boolean;
}

/**
 * Envoltorio visual estándar para cada bloque del Editor (Encabezado,
 * Editorial, Noticias, etc). Colapsable para que un boletín con 20+
 * noticias no se vuelva un scroll infinito.
 */
export default function EditorSection({
  titulo,
  descripcion,
  children,
  contador,
  defaultAbierto = true,
}: EditorSectionProps) {
  const [abierto, setAbierto] = useState(defaultAbierto);

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            {titulo}
            {typeof contador === "number" && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                {contador}
              </span>
            )}
          </h2>
          {descripcion && <p className="mt-0.5 text-xs text-gray-400">{descripcion}</p>}
        </div>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${abierto ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {abierto && <div className="border-t border-gray-100 px-4 py-4">{children}</div>}
    </section>
  );
}
