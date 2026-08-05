"use client";

import { useNewsletter } from "@/lib/newsletterContext";
import EditorSection from "./EditorSection";
import { FieldInput } from "./EditorField";

export default function EditorLibroRecomendado() {
  const { newsletter, updateLibro } = useNewsletter();
  const { libroRecomendado: libro } = newsletter;

  return (
    <EditorSection titulo="Opción por la Vejez" descripcion="Recomendación de lectura del mes">
      <div className="space-y-3">
        <FieldInput
          label="Título de la sección"
          value={libro.seccionTitulo}
          onChange={(seccionTitulo) => updateLibro({ seccionTitulo })}
        />
        <FieldInput
          label="Subtítulo (opcional)"
          value={libro.subtitulo ?? ""}
          onChange={(subtitulo) => updateLibro({ subtitulo })}
        />
        <FieldInput
          label="Autor"
          value={libro.autor}
          onChange={(autor) => updateLibro({ autor })}
        />
        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label="Link de descarga"
            value={libro.linkDescarga}
            onChange={(linkDescarga) => updateLibro({ linkDescarga })}
            placeholder="https://..."
          />
          <FieldInput
            label="Texto del link"
            value={libro.textoLink}
            onChange={(textoLink) => updateLibro({ textoLink })}
            placeholder="Descargue el libro en español aquí"
          />
        </div>
      </div>
    </EditorSection>
  );
}
