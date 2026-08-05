"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Newsletter } from "@/types/newsletter";
import { generateHtml } from "@/lib/htmlGenerator";

interface NewsletterTemplateProps {
  data: Newsletter;
  /** Ancho del viewport simulado, en px. Por defecto 600 (igual al email real). */
  width?: number;
}

/**
 * Renderiza el HTML final del boletín (el mismo que generan Copiar y
 * Descargar) dentro de un iframe sandboxeado. No hay una segunda
 * implementación en JSX: lo que ves acá es exactamente lo que se va
 * a pegar en Mailchimp/Brevo/WordPress Newsletter.
 */
export default function NewsletterTemplate({ data, width = 600 }: NewsletterTemplateProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);

  const html = useMemo(() => generateHtml(data), [data]);

  const ajustarAltura = () => {
    const doc = iframeRef.current?.contentWindow?.document;
    if (doc?.documentElement) {
      setHeight(doc.documentElement.scrollHeight + 16);
    }
  };

  // El srcDoc cambia con cada edición; onLoad recalcula la altura para
  // que el iframe nunca recorte contenido ni deje espacio vacío de más.
  useEffect(() => {
    ajustarAltura();
  }, [html]);

  return (
    <div className="mx-auto" style={{ width, maxWidth: "100%" }}>
      <iframe
        ref={iframeRef}
        srcDoc={html}
        onLoad={ajustarAltura}
        title="Vista previa del boletín"
        sandbox="allow-same-origin"
        className="w-full rounded-md border border-gray-200 bg-white"
        style={{ height }}
      />
    </div>
  );
}
