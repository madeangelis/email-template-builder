"use client";

import type { Noticia } from "@/types/newsletter";
import { FieldInput, FieldTextarea } from "./EditorField";

interface EditorNoticiaItemProps {
  noticia: Noticia;
  index: number;
  total: number;
  /** Si true, muestra el campo "país" (sección "noticias por país"). */
  conPais: boolean;
  onChange: (patch: Partial<Noticia>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function EditorNoticiaItem({
  noticia,
  index,
  total,
  conPais,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: EditorNoticiaItemProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">Noticia {index + 1}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Mover arriba"
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowIcon direction="up" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            title="Mover abajo"
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowIcon direction="down" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            title="Eliminar noticia"
            className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {conPais && (
          <FieldInput
            label="País"
            value={noticia.pais ?? ""}
            onChange={(pais) => onChange({ pais })}
            placeholder="ARGENTINA"
            hint="Se muestra en mayúsculas como badge sobre el título"
          />
        )}

        <FieldInput
          label="Título"
          value={noticia.titulo}
          onChange={(titulo) => onChange({ titulo })}
        />

        <FieldInput
          label="Fuente (opcional)"
          value={noticia.fuente ?? ""}
          onChange={(fuente) => onChange({ fuente })}
          placeholder="lanacion.com.ar"
        />

        <FieldTextarea
          label="Texto"
          value={noticia.texto}
          onChange={(texto) => onChange({ texto })}
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label="Link"
            value={noticia.link}
            onChange={(link) => onChange({ link })}
            placeholder="https://..."
          />
          <FieldInput
            label="Texto del link"
            value={noticia.linkTexto}
            onChange={(linkTexto) => onChange({ linkTexto })}
            placeholder="Leer más"
          />
        </div>
      </div>
    </div>
  );
}

function ArrowIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={direction === "up" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}
