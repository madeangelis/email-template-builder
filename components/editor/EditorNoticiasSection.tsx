"use client";

import type { Noticia } from "@/types/newsletter";
import { useNewsletter } from "@/lib/newsletterContext";
import EditorSection from "./EditorSection";
import EditorNoticiaItem from "./EditorNoticiaItem";

type SeccionNoticias = "noticiasBreves" | "noticiasPorPais";

interface EditorNoticiasSectionProps {
  seccion: SeccionNoticias;
  titulo: string;
  descripcion?: string;
  /** Si true, cada tarjeta muestra el campo "país" (sección "noticias por país"). */
  conPais: boolean;
}

export default function EditorNoticiasSection({
  seccion,
  titulo,
  descripcion,
  conPais,
}: EditorNoticiasSectionProps) {
  const { newsletter, updateNoticia, addNoticia, removeNoticia, reorderNoticias } =
    useNewsletter();

  const noticias: Noticia[] = newsletter[seccion];

  return (
    <EditorSection titulo={titulo} descripcion={descripcion} contador={noticias.length}>
      <div className="space-y-3">
        {noticias.length === 0 && (
          <p className="text-sm text-gray-400">No hay noticias en esta sección todavía.</p>
        )}

        {noticias.map((noticia, index) => (
          <EditorNoticiaItem
            key={noticia.id}
            noticia={noticia}
            index={index}
            total={noticias.length}
            conPais={conPais}
            onChange={(patch) => updateNoticia(seccion, noticia.id, patch)}
            onRemove={() => removeNoticia(seccion, noticia.id)}
            onMoveUp={() => reorderNoticias(seccion, index, index - 1)}
            onMoveDown={() => reorderNoticias(seccion, index, index + 1)}
          />
        ))}

        <button
          type="button"
          onClick={() => addNoticia(seccion)}
          className="w-full rounded-md border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
        >
          + Agregar noticia
        </button>
      </div>
    </EditorSection>
  );
}
