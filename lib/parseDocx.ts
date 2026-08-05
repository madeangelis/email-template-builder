import mammoth from "mammoth";

/**
 * Resultado crudo de la conversión DOCX → HTML.
 * Esta capa NO interpreta contenido de negocio (títulos, noticias, etc).
 * Su única responsabilidad es transformar el archivo binario en HTML
 * semántico y reportar cualquier advertencia que Mammoth haya emitido
 * durante la conversión (estilos no reconocidos, etc).
 */
export interface DocxExtractionResult {
  html: string;
  warnings: string[];
}

/**
 * Mapeo de estilos de Word a HTML.
 *
 * Se preservan encabezados (Heading1-3) como h1-h3 aunque el parser de
 * contenido (parser.ts) NO dependa de ellos para detectar noticias -en
 * la práctica hemos visto boletines donde un párrafo de noticia queda
 * mal etiquetado como Heading1 por error humano al redactar-. Se
 * conservan de todas formas porque son una señal útil y de bajo costo
 * para el parser (ver parser.ts), nunca la única.
 */
const STYLE_MAP = [
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='Title'] => h1.doc-title:fresh",
  "b => strong",
  "i => em",
];

/**
 * Convierte un archivo .docx a HTML crudo.
 *
 * Nota sobre imágenes: el boletín de referencia nunca incluye imágenes
 * embebidas. Para no romper si alguna edición futura sí las trajera,
 * las imágenes se omiten de forma explícita (no se generan <img> con
 * base64 gigante en el HTML) en lugar de fallar. Si en el futuro se
 * necesita soportarlas, este es el único punto del código a tocar.
 */
export async function extractHtmlFromDocx(
  file: File
): Promise<DocxExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: STYLE_MAP,
      convertImage: mammoth.images.imgElement(() => {
        // Se omite deliberadamente el contenido de la imagen.
        // Devolver un objeto de atributos vacío hace que Mammoth
        // no incruste el binario en el HTML resultante.
        return Promise.resolve({});
      }),
    }
  );

  const warnings = result.messages
    .filter((m) => m.type === "warning" || m.type === "error")
    .map((m) => m.message);

  return {
    html: result.value,
    warnings,
  };
}
