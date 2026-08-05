"use client";

import { useNewsletter } from "@/lib/newsletterContext";
import EditorSection from "./EditorSection";
import { FieldInput, FieldTextarea } from "./EditorField";

export default function EditorFooter() {
  const { newsletter, updateFooter } = useNewsletter();
  const { footer } = newsletter;

  return (
    <EditorSection
      titulo="Footer"
      descripcion='El link de "Desuscribirse" queda fijo con {unsubscription_url} — no se edita acá'
      defaultAbierto={false}
    >
      <div className="space-y-3">
        <FieldInput
          label="Sitio web"
          value={footer.sitioWeb}
          onChange={(sitioWeb) => updateFooter({ sitioWeb })}
        />
        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label="Editora responsable — nombre"
            value={footer.editoraResponsableNombre}
            onChange={(editoraResponsableNombre) => updateFooter({ editoraResponsableNombre })}
          />
          <FieldInput
            label="Editora responsable — email"
            value={footer.editoraResponsableEmail}
            onChange={(editoraResponsableEmail) => updateFooter({ editoraResponsableEmail })}
          />
        </div>
        <FieldInput
          label="Editora responsable — cargo"
          value={footer.editoraResponsableCargo}
          onChange={(editoraResponsableCargo) => updateFooter({ editoraResponsableCargo })}
        />
        <FieldTextarea
          label="Mensaje de suscripción"
          value={footer.mensajeSuscripcion}
          onChange={(mensajeSuscripcion) => updateFooter({ mensajeSuscripcion })}
          rows={2}
          hint="No se usa en el HTML final de la plantilla actual (el botón usa {unsubscription_url}), pero queda disponible si cambia la plantilla"
        />
      </div>
    </EditorSection>
  );
}
