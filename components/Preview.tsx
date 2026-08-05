"use client";

import { useState } from "react";
import { useNewsletter } from "@/lib/newsletterContext";
import NewsletterTemplate from "./NewsletterTemplate";

const VIEWPORTS = {
  desktop: 600,
  movil: 375,
} as const;

type Viewport = keyof typeof VIEWPORTS;

export default function Preview() {
  const { newsletter } = useNewsletter();
  const [viewport, setViewport] = useState<Viewport>("desktop");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Vista previa</h2>
        <div className="flex overflow-hidden rounded-md border border-gray-200 text-xs">
          {(Object.keys(VIEWPORTS) as Viewport[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setViewport(v)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                viewport === v
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {v === "desktop" ? "Escritorio" : "Móvil"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-100 p-4">
        {/* Barra tipo cliente de correo: de/asunto, para dar contexto visual */}
        <div
          className="mx-auto mb-3 rounded-md border border-gray-200 bg-white px-4 py-3 text-xs text-gray-600"
          style={{ width: VIEWPORTS[viewport], maxWidth: "100%" }}
        >
          <p>
            <span className="font-semibold text-gray-800">De:</span>{" "}
            {newsletter.encabezado.subtitulo || "Red Latinoamericana de Gerontología"}
          </p>
          <p className="mt-0.5">
            <span className="font-semibold text-gray-800">Asunto:</span>{" "}
            {newsletter.encabezado.titulo || "Boletín"}
            {newsletter.encabezado.edicion ? ` — ${newsletter.encabezado.edicion}` : ""}
          </p>
        </div>

        <NewsletterTemplate data={newsletter} width={VIEWPORTS[viewport]} />
      </div>
    </div>
  );
}
