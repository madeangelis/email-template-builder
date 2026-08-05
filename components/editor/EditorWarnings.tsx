"use client";

import { useState } from "react";
import { useNewsletter } from "@/lib/newsletterContext";

/**
 * Muestra las advertencias no bloqueantes del parser/parseDocx (ver
 * ParseWarning en types/newsletter.ts). No impide seguir trabajando —
 * es una señal de "revisá esto a mano", no un error fatal.
 */
export default function EditorWarnings() {
  const { warnings } = useNewsletter();
  const [descartado, setDescartado] = useState(false);

  if (warnings.length === 0 || descartado) return null;

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-800">
            {warnings.length === 1
              ? "Se encontró 1 detalle al leer el documento"
              : `Se encontraron ${warnings.length} detalles al leer el documento`}
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-amber-700">
            {warnings.map((w, i) => (
              <li key={i}>
                {w.mensaje}
                {w.contexto && <span className="text-amber-500"> — “{w.contexto.slice(0, 60)}…”</span>}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setDescartado(true)}
          className="flex-shrink-0 text-xs text-amber-500 hover:text-amber-700"
        >
          Descartar
        </button>
      </div>
    </div>
  );
}
