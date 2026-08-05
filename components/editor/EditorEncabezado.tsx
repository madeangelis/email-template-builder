"use client";

import { useNewsletter } from "@/lib/newsletterContext";
import EditorSection from "./EditorSection";
import { FieldInput } from "./EditorField";

export default function EditorEncabezado() {
  const { newsletter, updateEncabezado } = useNewsletter();
  const { encabezado } = newsletter;

  return (
    <EditorSection titulo="Encabezado" descripcion="Título, sitio y datos de la edición">
      <div className="space-y-3">
        <FieldInput
          label="Título"
          value={encabezado.titulo}
          onChange={(titulo) => updateEncabezado({ titulo })}
        />
        <FieldInput
          label="Subtítulo"
          value={encabezado.subtitulo}
          onChange={(subtitulo) => updateEncabezado({ subtitulo })}
        />
        <FieldInput
          label="Sitio web"
          value={encabezado.sitioWeb}
          onChange={(sitioWeb) => updateEncabezado({ sitioWeb })}
        />
        <FieldInput
          label="Edición"
          value={encabezado.edicion}
          onChange={(edicion) => updateEncabezado({ edicion })}
          placeholder="Año XXVII, Edición N° 301 de Julio de 2026"
        />

        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label="Mes"
            value={encabezado.mes}
            onChange={(mes) => updateEncabezado({ mes })}
            hint="Minúsculas, sin tildes: julio"
          />
          <FieldInput
            label="Año"
            value={encabezado.anio}
            onChange={(anio) => updateEncabezado({ anio })}
            hint="Ej: 2026"
          />
        </div>
        <p className="text-xs text-gray-400">
          Mes y año se usan para armar el <code>utm_id</code> de todos los links de esta
          edición (ej. <code>boletin_{encabezado.mes || "mes"}_{encabezado.anio || "año"}</code>).
        </p>
      </div>
    </EditorSection>
  );
}
