"use client";

import { useNewsletter } from "@/lib/newsletterContext";
import EditorSection from "./EditorSection";
import { FieldInput, FieldTextarea } from "./EditorField";

export default function EditorNotaEditora() {
  const {
    newsletter,
    updateNotaEditora,
    addCorresponsal,
    removeCorresponsal,
    updateCorresponsal,
  } = useNewsletter();
  const { notaEditora } = newsletter;

  return (
    <EditorSection
      titulo="Nota de la Editora"
      descripcion="Texto de cierre y lista de corresponsales por país"
      contador={notaEditora.corresponsales.length}
    >
      <div className="space-y-4">
        <FieldTextarea
          label="Texto"
          value={notaEditora.texto}
          onChange={(texto) => updateNotaEditora({ texto })}
          rows={3}
        />
        <FieldInput
          label="Email de la coordinadora"
          value={notaEditora.emailCoordinadora}
          onChange={(emailCoordinadora) => updateNotaEditora({ emailCoordinadora })}
        />

        <div className="space-y-2 border-t border-gray-100 pt-3">
          <span className="block text-xs font-medium text-gray-600">Corresponsales</span>

          {notaEditora.corresponsales.map((c) => (
            <div key={c.id} className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
              <div className="grid flex-1 grid-cols-3 gap-2">
                <FieldInput
                  label="País"
                  value={c.pais}
                  onChange={(pais) => updateCorresponsal(c.id, { pais })}
                />
                <FieldInput
                  label="Nombre"
                  value={c.nombre}
                  onChange={(nombre) => updateCorresponsal(c.id, { nombre })}
                />
                <FieldInput
                  label="Email"
                  value={c.email}
                  onChange={(email) => updateCorresponsal(c.id, { email })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeCorresponsal(c.id)}
                title="Eliminar corresponsal"
                className="mt-6 flex-shrink-0 rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addCorresponsal}
            className="w-full rounded-md border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
          >
            + Agregar corresponsal
          </button>
        </div>
      </div>
    </EditorSection>
  );
}
