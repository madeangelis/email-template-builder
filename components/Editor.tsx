"use client";

import EditorWarnings from "./editor/EditorWarnings";
import EditorEncabezado from "./editor/EditorEncabezado";
import EditorEditorial from "./editor/EditorEditorial";
import EditorNoticiasSection from "./editor/EditorNoticiasSection";
import EditorLibroRecomendado from "./editor/EditorLibroRecomendado";
import EditorNotaEditora from "./editor/EditorNotaEditora";
import EditorFooter from "./editor/EditorFooter";

/**
 * Formulario editable completo del newsletter. Cada sección lee y
 * escribe directamente sobre NewsletterContext — este componente solo
 * las ordena. La Preview (componente hermano) se suscribe al mismo
 * contexto y se actualiza sola, sin que Editor necesite saber que existe.
 */
export default function Editor() {
  return (
    <div className="space-y-4">
      <EditorWarnings />
      <EditorEncabezado />
      <EditorEditorial />
      <EditorNoticiasSection
        seccion="noticiasBreves"
        titulo="Noticias Internacionales"
        descripcion="Sección breve, sin badge de país"
        conPais={false}
      />
      <EditorNoticiasSection
        seccion="noticiasPorPais"
        titulo="Noticias por País"
        descripcion="Cada tarjeta muestra el país como badge"
        conPais={true}
      />
      <EditorLibroRecomendado />
      <EditorNotaEditora />
      <EditorFooter />
    </div>
  );
}
