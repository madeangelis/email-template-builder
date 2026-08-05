"use client";

import { useNewsletter } from "@/lib/newsletterContext";
import { sanitizeInlineHtml } from "@/lib/sanitize";
import EditorSection from "./EditorSection";
import { FieldInput, FieldTextarea } from "./EditorField";

export default function EditorEditorial() {
  const {
    newsletter,
    updateEditorial,
    updateEditorialParrafo,
    addEditorialParrafo,
    removeEditorialParrafo,
  } = useNewsletter();
  const { editorial } = newsletter;

  return (
    <EditorSection
      titulo="Editorial"
      descripcion="Los párrafos se editan como HTML fuente para conservar links dentro del texto"
    >
      <div className="space-y-4">
        <FieldInput
          label="Título"
          value={editorial.titulo}
          onChange={(titulo) => updateEditorial({ titulo })}
        />

        <div className="space-y-3">
          <span className="block text-xs font-medium text-gray-600">Párrafos</span>
          {editorial.parrafos.map((parrafo, index) => (
            <div key={index} className="flex items-start gap-2">
              <FieldTextarea
                label={`Párrafo ${index + 1}`}
                value={parrafo}
                onChange={(value) => updateEditorialParrafo(index, sanitizeInlineHtml(value))}
                rows={4}
                monospace
                hint="Solo se permiten <a href>, <strong>, <em> y <br> — cualquier otro tag se descarta al guardar"
              />
              <button
                type="button"
                onClick={() => removeEditorialParrafo(index)}
                title="Eliminar párrafo"
                className="mt-6 flex-shrink-0 rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addEditorialParrafo}
            className="w-full rounded-md border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
          >
            + Agregar párrafo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
          <FieldInput
            label="Firma — nombre"
            value={editorial.firmaNombre}
            onChange={(firmaNombre) => updateEditorial({ firmaNombre })}
          />
          <FieldInput
            label="Firma — email"
            value={editorial.firmaEmail ?? ""}
            onChange={(firmaEmail) => updateEditorial({ firmaEmail })}
          />
        </div>
        <FieldInput
          label="Firma — cargo"
          value={editorial.firmaCargo}
          onChange={(firmaCargo) => updateEditorial({ firmaCargo })}
        />
      </div>
    </EditorSection>
  );
}
