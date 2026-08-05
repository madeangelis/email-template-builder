"use client";

import { useState } from "react";
import { useNewsletter } from "@/lib/newsletterContext";
import { generateHtml } from "@/lib/htmlGenerator";

type EstadoCopiado = "idle" | "copiado" | "error";

function nombreArchivo(mes: string, anio: string): string {
  const mesLimpio = mes || "boletin";
  const anioLimpio = anio || new Date().getFullYear().toString();
  return `boletin-${mesLimpio}-${anioLimpio}.html`;
}

export default function Toolbar() {
  const { newsletter } = useNewsletter();
  const [estadoCopiado, setEstadoCopiado] = useState<EstadoCopiado>("idle");

  const handleCopiar = async () => {
    try {
      const html = generateHtml(newsletter);
      await navigator.clipboard.writeText(html);
      setEstadoCopiado("copiado");
    } catch (err) {
      console.error(err);
      setEstadoCopiado("error");
    } finally {
      setTimeout(() => setEstadoCopiado("idle"), 2000);
    }
  };

  const handleDescargar = () => {
    const html = generateHtml(newsletter);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo(newsletter.encabezado.mes, newsletter.encabezado.anio);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopiar}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <CopyIcon />
        {estadoCopiado === "copiado"
          ? "¡Copiado!"
          : estadoCopiado === "error"
            ? "No se pudo copiar"
            : "Copiar HTML"}
      </button>

      <button
        type="button"
        onClick={handleDescargar}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        <DownloadIcon />
        Descargar HTML
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}
