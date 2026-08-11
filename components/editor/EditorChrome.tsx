"use client";

import { useNewsletter } from "@/lib/newsletterContext";
import EditorSection from "./EditorSection";
import { FieldInput } from "./EditorField";

/**
 * Textos y assets fijos de la plantilla que el .docx nunca trae
 * (títulos de sección, rótulos, URLs de imágenes). Se muestran acá
 * separados del resto porque conceptualmente son "diseño de la
 * plantilla", no contenido editorial de la edición — pero quedan
 * igual de editables si hace falta ajustar algo puntual.
 */
export default function EditorChrome() {
  const { newsletter, updateChrome } = useNewsletter();
  const { chrome } = newsletter;

  return (
    <EditorSection
      titulo="Textos y assets de la plantilla"
      descripcion="Títulos de sección y URLs de imágenes — no vienen del .docx"
      defaultAbierto={false}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label="Rótulo sobre 'Internacionales'"
            value={chrome.eyebrowInternacionales}
            onChange={(eyebrowInternacionales) => updateChrome({ eyebrowInternacionales })}
          />
          <FieldInput
            label="Título — Noticias breves"
            value={chrome.tituloInternacionales}
            onChange={(tituloInternacionales) => updateChrome({ tituloInternacionales })}
          />
        </div>

        <FieldInput
          label="Título — Noticias por país"
          value={chrome.tituloRegionales}
          onChange={(tituloRegionales) => updateChrome({ tituloRegionales })}
        />

        <FieldInput
          label="Rótulo — Nota de la Editora"
          value={chrome.eyebrowNotaEditora}
          onChange={(eyebrowNotaEditora) => updateChrome({ eyebrowNotaEditora })}
        />

        <FieldInput
          label="Título — columna del footer"
          value={chrome.tituloFooterRLG}
          onChange={(tituloFooterRLG) => updateChrome({ tituloFooterRLG })}
        />

        <div className="border-t border-gray-100 pt-3">
          <FieldInput
            label="URL del logo"
            value={chrome.logoUrl}
            onChange={(logoUrl) => updateChrome({ logoUrl })}
            placeholder="https://..."
          />
        </div>
        <FieldInput
          label="URL de la imagen del libro recomendado"
          value={chrome.imagenLibroUrl}
          onChange={(imagenLibroUrl) => updateChrome({ imagenLibroUrl })}
          placeholder="https://..."
        />
      </div>
    </EditorSection>
  );
}
