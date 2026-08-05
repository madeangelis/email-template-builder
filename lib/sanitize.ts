/**
 * Sanitización de HTML enriquecido en línea (inline).
 *
 * Alcance deliberadamente acotado: la Editorial solo necesita texto
 * corrido con algún link o palabra en negrita/cursiva ocasional, NUNCA
 * estructuras de bloque (tablas, divs, imágenes, scripts). Cualquier
 * tag fuera de la allowlist se descarta conservando su contenido de
 * texto; cualquier atributo fuera de la allowlist se descarta.
 *
 * Corre en el navegador (usa DOMParser), igual que parser.ts.
 */

const ALLOWED_TAGS = new Set(["a", "strong", "em", "br", "b", "i"]);

/** Normaliza <b>/<i> a <strong>/<em> para no duplicar semántica. */
const TAG_NORMALIZATION: Record<string, string> = {
  b: "strong",
  i: "em",
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Solo http(s) y mailto sobreviven; cualquier otro esquema cae a "#". */
function sanitizeHref(href: string | null): string {
  const trimmed = (href ?? "").trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return escapeHtml(trimmed);
  return "#";
}

function sanitizeNode(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const rawTag = el.tagName.toLowerCase();
  const innerHtml = Array.from(el.childNodes).map(sanitizeNode).join("");

  if (!ALLOWED_TAGS.has(rawTag)) {
    // Tag no permitido: se descarta el tag pero se conserva el contenido,
    // para no perder texto que el usuario sí quería mantener.
    return innerHtml;
  }

  const tag = TAG_NORMALIZATION[rawTag] ?? rawTag;

  if (tag === "br") return "<br />";

  if (tag === "a") {
    const href = sanitizeHref(el.getAttribute("href"));
    return `<a href="${href}">${innerHtml}</a>`;
  }

  return `<${tag}>${innerHtml}</${tag}>`;
}

/**
 * Sanitiza un fragmento de HTML en línea. Es idempotente: sanitizar
 * dos veces el mismo string da el mismo resultado, por lo que es
 * seguro aplicarlo tanto al guardar en el Editor como, de nuevo, justo
 * antes de insertar en el HTML final.
 */
export function sanitizeInlineHtml(html: string): string {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  return Array.from(wrapper.childNodes).map(sanitizeNode).join("");
}

/**
 * Extrae el texto plano de un fragmento de HTML enriquecido, sin tags.
 * Útil para previews cortas, alt text, o cualquier lugar donde no
 * queramos (o no podamos) renderizar HTML.
 */
export function stripInlineHtml(html: string): string {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  return (wrapper.textContent ?? "").trim();
}
