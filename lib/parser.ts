import type {
  Corresponsal,
  Editorial,
  Encabezado,
  Footer,
  LibroRecomendado,
  Newsletter,
  Noticia,
  NotaEditora,
  ParseResult,
  ParseWarning,
  PlantillaChrome,
  UltimasActualizaciones,
} from "@/types/newsletter";
import { sanitizeInlineHtml, stripInlineHtml } from "@/lib/sanitize";

type RunType = "text" | "strong" | "link";

interface Run {
  type: RunType;
  text: string;
  href?: string;
}

interface Block {
  tag: string;
  runs: Run[];
  text: string;
}

function domToBlocks(container: HTMLElement): Block[] {
  const blockNodes = Array.from(
    container.querySelectorAll("p, h1, h2, h3")
  ) as HTMLElement[];

  return blockNodes.map((node) => {
    const runs: Run[] = [];

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent ?? "";
        if (text.length > 0) runs.push({ type: "text", text });
        return;
      }

      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "strong" || tag === "b") {
        const text = el.textContent ?? "";
        if (text.length > 0) runs.push({ type: "strong", text });
        return;
      }

      if (tag === "a") {
        const href = el.getAttribute("href") ?? "";
        const text = el.textContent ?? "";
        if (href || text) runs.push({ type: "link", text, href });
        return;
      }

      const text = el.textContent ?? "";
      if (text.length > 0) runs.push({ type: "text", text });
    });

    return {
      tag: node.tagName.toLowerCase(),
      runs,
      text: (node.textContent ?? "").trim(),
    };
  });
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function startsWithNormalized(text: string, prefix: string): boolean {
  return normalize(text).startsWith(normalize(prefix));
}

function getTrailingLeerMasRun(block: Block): Run | null {
  const last = block.runs[block.runs.length - 1];
  if (!last || last.type !== "link") return null;
  const normalized = normalize(last.text).replace(/[.\u2026]+$/, "").trim();
  return normalized.startsWith("leer mas") ? last : null;
}

/**
 * Un bloque es noticia si termina en link "Leer más…" Y además tiene
 * ALGUNA señal de énfasis en el título: negrita (caso normal) o el
 * propio bloque siendo un heading h1/h2/h3 (caso de mistipeo, visto
 * en la edición de referencia: 3 noticias quedaron como Heading1 sin
 * negrita interna porque el énfasis lo da el estilo del párrafo).
 */
function isNoticiaBlock(block: Block): boolean {
  const hasStrong = block.runs.some((r) => r.type === "strong" && r.text.trim());
  const isHeadingTag = block.tag === "h1" || block.tag === "h2" || block.tag === "h3";
  return (hasStrong || isHeadingTag) && getTrailingLeerMasRun(block) !== null;
}

function splitFuenteYTexto(body: string): { fuente?: string; texto: string } {
  const match = body.match(/^([\w.-]+\.[a-zA-Z]{2,4})\.\s+([\s\S]+)$/);
  if (!match) return { texto: body.trim() };
  return { fuente: match[1].trim(), texto: match[2].trim() };
}

/**
 * Fallback para bloques SIN negrita interna (título no delimitado por
 * <strong>, como los 3 casos de Heading1 mal tipeados). Se detecta el
 * límite título/fuente/cuerpo buscando el primer token con forma de
 * dominio ("algo.com") seguido de punto — el mismo patrón "fuente"
 * que separa título de cuerpo en el resto del documento.
 */
function splitTituloFuenteTextoSinNegrita(
  fullText: string
): { titulo: string; fuente?: string; texto: string } {
  const match = fullText.match(
    /^([\s\S]+?)\.\s+([\w.-]+\.[a-zA-Z]{2,4})\.\s+([\s\S]+)$/
  );
  if (!match) return { titulo: fullText.trim(), texto: "" };
  return {
    titulo: match[1].trim(),
    fuente: match[2].trim(),
    texto: match[3].trim(),
  };
}

function splitPaisYTitulo(titulo: string): { pais?: string; titulo: string } {
  const match = titulo.match(/^([A-ZÁÉÍÓÚÑ]{2,}(?:\s[A-ZÁÉÍÓÚÑ]{2,})*)\.\s*([\s\S]+)$/);
  if (!match) return { titulo };
  return { pais: match[1].trim(), titulo: match[2].trim() };
}

function parseNoticiaBlock(block: Block, id: string, detectPais: boolean): Noticia {
  const leerMasRun = getTrailingLeerMasRun(block)!;
  const contentRuns = block.runs.slice(0, block.runs.length - 1);
  const hasStrongRun = contentRuns.some((r) => r.type === "strong" && r.text.trim());

  let tituloCompleto: string;
  let fuente: string | undefined;
  let texto: string;

  if (hasStrongRun) {
    // Caso normal: la negrita delimita explícitamente el título.
    let phase: "titulo" | "cuerpo" = "titulo";
    let tituloRaw = "";
    let cuerpoRaw = "";

    for (const run of contentRuns) {
      if (phase === "titulo") {
        if (run.type === "strong") {
          tituloRaw += run.text;
          continue;
        }
        if (run.text.trim() === "") continue;
        phase = "cuerpo";
        cuerpoRaw += run.text;
        continue;
      }
      cuerpoRaw += run.text;
    }

    tituloCompleto = tituloRaw.replace(/\s+/g, " ").trim();
    const split = splitFuenteYTexto(cuerpoRaw.replace(/\s+/g, " ").trim());
    fuente = split.fuente;
    texto = split.texto;
  } else {
    // Caso sin negrita (ej. Heading1 mal tipeado): se infiere el límite
    // título/fuente/cuerpo por el patrón de dominio (ver función).
    const fullText = contentRuns
      .map((r) => r.text)
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    const split = splitTituloFuenteTextoSinNegrita(fullText);
    tituloCompleto = split.titulo;
    fuente = split.fuente;
    texto = split.texto;
  }

  const { pais, titulo } = detectPais
    ? splitPaisYTitulo(tituloCompleto)
    : { pais: undefined, titulo: tituloCompleto };

  return {
    id,
    pais,
    titulo,
    fuente,
    texto,
    link: leerMasRun.href ?? "",
    linkTexto: leerMasRun.text.trim(),
  };
}

function isSoleLinkBlock(block: Block): Run | null {
  const meaningful = block.runs.filter((r) => r.text.trim() !== "");
  if (meaningful.length === 1 && meaningful[0].type === "link") {
    return meaningful[0];
  }
  return null;
}

function firstStrongText(block: Block): string {
  return block.runs.find((r) => r.type === "strong")?.text.trim() ?? "";
}

function firstTextRun(block: Block): string {
  return block.runs.find((r) => r.type === "text")?.text.trim() ?? "";
}

/** Escape mínimo para reconstruir HTML crudo a partir de runs. */
function escapeHtmlLocal(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Reconstruye HTML en línea a partir de los runs de un bloque
 * (negrita → <strong>, link → <a href>, texto → escapado). El
 * resultado se pasa siempre por sanitizeInlineHtml antes de guardarse
 * — esta función solo arma la estructura, no es la capa de seguridad.
 */
function runsToRawHtml(runs: Run[]): string {
  return runs
    .map((r) => {
      if (r.type === "strong") return `<strong>${escapeHtmlLocal(r.text)}</strong>`;
      if (r.type === "link") {
        const href = escapeHtmlLocal(r.href ?? "");
        return `<a href="${href}">${escapeHtmlLocal(r.text)}</a>`;
      }
      return escapeHtmlLocal(r.text);
    })
    .join("");
}

/**
 * Extrae mes y año de la línea de edición ("...de Julio de 2026").
 * Se usan más adelante para calcular el utm_id de cada edición sin
 * tener que re-parsear el texto completo en el generador de HTML.
 */
function extractMesAnio(edicion: string): { mes: string; anio: string } {
  const match = edicion.match(/de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})/i);
  if (!match) return { mes: "", anio: "" };
  return { mes: normalize(match[1]), anio: match[2] };
}

export function parseNewsletterHtml(html: string): ParseResult {
  const container = document.createElement("div");
  container.innerHTML = html;
  const blocks = domToBlocks(container);
  const warnings: ParseWarning[] = [];

  let i = 0;
  const next = () => blocks[i++];
  const peek = () => blocks[i];

  const tituloBlock = next();
  const subtituloBlock = next();
  const sitioWebBlock = next();
  const edicionBlock = next();
  const edicionTexto = edicionBlock?.text ?? "";
  const { mes, anio } = extractMesAnio(edicionTexto);

  const encabezado: Encabezado = {
    titulo: tituloBlock?.text ?? "",
    subtitulo: subtituloBlock?.text ?? "",
    sitioWeb: sitioWebBlock?.text ?? "",
    edicion: edicionTexto,
    mes,
    anio,
  };

  const editorialTituloBlock = next();
  if (!editorialTituloBlock || !startsWithNormalized(editorialTituloBlock.text, "editorial")) {
    warnings.push({
      mensaje: "No se encontró el título de la Editorial en la posición esperada.",
      contexto: editorialTituloBlock?.text,
    });
  }

  const parrafos: string[] = [];
  let firmaNombre = "";
  let firmaEmail: string | undefined;

  while (peek() && !isSoleLinkBlock(peek())?.href?.startsWith("mailto:") && !isNoticiaBlock(peek())) {
    const block = next();
    const html = sanitizeInlineHtml(runsToRawHtml(block.runs));
    if (stripInlineHtml(html)) parrafos.push(html);
  }

  const firmaBlock = peek();
  const firmaLink = firmaBlock ? isSoleLinkBlock(firmaBlock) : null;
  if (firmaLink?.href?.startsWith("mailto:")) {
    next();
    firmaNombre = firmaLink.text.trim();
    firmaEmail = firmaLink.href.replace("mailto:", "").trim();
  } else {
    warnings.push({ mensaje: "No se encontró la firma de la Editorial (link mailto)." });
  }

  const firmaCargo = !isNoticiaBlock(peek()) ? next()?.text ?? "" : "";

  const editorial: Editorial = {
    titulo: editorialTituloBlock?.text ?? "",
    parrafos,
    firmaNombre,
    firmaEmail,
    firmaCargo,
  };

  const noticiasBreves: Noticia[] = [];
  let contador = 1;
  while (peek() && isNoticiaBlock(peek())) {
    noticiasBreves.push(parseNoticiaBlock(next(), `noticia-breve-${contador}`, false));
    contador++;
  }

  const ultimasBlock = next();
  const ultimasLink = ultimasBlock?.runs.find((r) => r.type === "link");
  if (!ultimasBlock || !startsWithNormalized(firstStrongText(ultimasBlock), "ultimas actualizaciones")) {
    warnings.push({
      mensaje: 'No se encontró el bloque "Últimas Actualizaciones" en la posición esperada.',
      contexto: ultimasBlock?.text,
    });
  }
  const ultimasActualizaciones: UltimasActualizaciones = {
    texto: firstStrongText(ultimasBlock) || "Últimas Actualizaciones:",
    link: ultimasLink?.href ?? "",
    linkTexto: ultimasLink?.text.trim() ?? "",
  };

  const noticiasPorPais: Noticia[] = [];
  contador = 1;
  while (peek() && isNoticiaBlock(peek())) {
    noticiasPorPais.push(parseNoticiaBlock(next(), `noticia-pais-${contador}`, true));
    contador++;
  }

  const libroTituloBlock = next();
  if (!libroTituloBlock || !startsWithNormalized(firstStrongText(libroTituloBlock) || libroTituloBlock.text, "opcion por la vejez")) {
    warnings.push({
      mensaje: 'No se encontró la sección "Opción por la Vejez" en la posición esperada.',
      contexto: libroTituloBlock?.text,
    });
  }

  const librosLineasPlanas: string[] = [];
  let libroLinkRun: Run | null = null;
  while (peek() && !libroLinkRun) {
    const block = peek();
    const soleLink = isSoleLinkBlock(block);
    if (soleLink) {
      libroLinkRun = soleLink;
      next();
      break;
    }
    if (isNoticiaBlock(block) || startsWithNormalized(firstStrongText(block), "nota de la editora")) {
      break;
    }
    librosLineasPlanas.push(next().text);
  }

  const libroRecomendado: LibroRecomendado = {
    seccionTitulo: libroTituloBlock?.text ?? "Opción por la Vejez",
    subtitulo: librosLineasPlanas.length > 1 ? librosLineasPlanas[0] : undefined,
    autor: librosLineasPlanas.length > 0 ? librosLineasPlanas[librosLineasPlanas.length - 1] : "",
    linkDescarga: libroLinkRun?.href ?? "",
    textoLink: libroLinkRun?.text.trim() ?? "",
  };

  const notaBlock = next();
  const notaEditora = parseNotaEditora(notaBlock, warnings);

  const footer = parseFooter(blocks, i, warnings);

  // El .docx nunca trae estos textos/URLs (son "chrome" fijo de la
  // plantilla, no contenido editorial), así que se completan con los
  // valores actuales de la plantilla real. Quedan editables en el
  // Editor por si se necesita ajustar alguno puntualmente.
  const chrome: PlantillaChrome = {
    eyebrowInternacionales: "Últimas actualizaciones",
    tituloInternacionales: "Internacionales",
    tituloRegionales: "Regionales",
    eyebrowNotaEditora: "NOTA DE LA EDITORA",
    tituloFooterRLG: "RLG",
    logoUrl: "https://www.gerontologia.org/wp-content/uploads/2025/12/cropped-logo_gerontologia.png",
    imagenLibroUrl: "https://www.gerontologia.org/wp-content/uploads/2022/04/Opcion-por-la-vejez.jpg",
  };

  return {
    newsletter: {
      encabezado,
      editorial,
      noticiasBreves,
      ultimasActualizaciones,
      noticiasPorPais,
      libroRecomendado,
      notaEditora,
      footer,
      chrome,
    },
    warnings,
  };
}

function parseNotaEditora(block: Block | undefined, warnings: ParseWarning[]): NotaEditora {
  if (!block) {
    warnings.push({ mensaje: 'No se encontró el bloque "Nota de la Editora".' });
    return { texto: "", emailCoordinadora: "", corresponsales: [] };
  }

  const linkRuns = block.runs
    .map((r, idx) => ({ run: r, idx }))
    .filter(({ run }) => run.type === "link");

  // El texto de intro es SOLO lo que aparece antes del primer link (el
  // mailto de la coordinadora). Tomar todos los runs no-link del bloque
  // entero arrastra los conectores sueltos entre cada corresponsal
  // ("en Argentina:", "en Brasil:", etc.), que no son parte de la frase
  // introductoria y no deberían mostrarse como si lo fueran.
  const primerLinkIndex = block.runs.findIndex((r) => r.type === "link");
  const runsIntro = primerLinkIndex === -1 ? block.runs : block.runs.slice(0, primerLinkIndex);
  const texto = runsIntro
    .map((r) => r.text)
    .join("")
    .replace(/^\s*nota de la editora\s*:?\s*/i, "") // ya se muestra como título de sección
    .replace(/\s+/g, " ")
    .trim();

  if (linkRuns.length === 0) {
    return { texto, emailCoordinadora: "", corresponsales: [] };
  }

  const emailCoordinadora = extractEmail(linkRuns[0].run);
  const corresponsales: Corresponsal[] = [];

  linkRuns.slice(1).forEach(({ run, idx }, order) => {
    const precedingText = block.runs[idx - 1];
    const email = extractEmail(run);
    const match =
      precedingText?.type === "text"
        ? precedingText.text.match(/\ben\s+(\S+)\s*:\s*(.+?)\s*[:\-–]\s*$/i)
        : null;

    if (match) {
      corresponsales.push({
        id: `corresponsal-${order + 1}`,
        pais: match[1].trim(),
        nombre: match[2].trim(),
        email,
      });
    } else {
      warnings.push({
        mensaje: "No se pudo determinar país/nombre de un corresponsal automáticamente.",
        contexto: email,
      });
      corresponsales.push({
        id: `corresponsal-${order + 1}`,
        pais: "",
        nombre: run.text.trim(),
        email,
      });
    }
  });

  return { texto, emailCoordinadora, corresponsales };
}

function extractEmail(run: Run): string {
  if (!run.href) return run.text.trim();
  if (run.href.startsWith("mailto:")) return run.href.replace("mailto:", "").trim();
  const toParam = run.href.match(/[?&]To=([^&]+)/i);
  if (toParam) return decodeURIComponent(toParam[1]);
  return run.text.trim();
}

function parseFooter(blocks: Block[], startIndex: number, warnings: ParseWarning[]): Footer {
  let i = startIndex;
  const next = () => blocks[i++];

  const sitioBlock = next();
  const sitioLink = sitioBlock ? isSoleLinkBlock(sitioBlock) : null;
  if (!sitioLink) {
    warnings.push({ mensaje: "No se encontró el link del sitio web en el footer." });
  }

  const responsableBlock = next();
  const responsableLink = responsableBlock?.runs.find((r) => r.type === "link");
  if (!responsableBlock || !startsWithNormalized(firstTextRun(responsableBlock), "editora responsable")) {
    warnings.push({
      mensaje: 'No se encontró la línea "Editora responsable" en el footer.',
      contexto: responsableBlock?.text,
    });
  }
  const cargoMatch = responsableBlock?.text.match(/,\s*([^,]+)$/);

  const suscripcionBlock = next();
  const bajaLink = suscripcionBlock?.runs.find((r) => r.type === "link");
  if (!suscripcionBlock || !startsWithNormalized(suscripcionBlock.text, "usted ha recibido")) {
    warnings.push({
      mensaje: "No se encontró el mensaje de gestión de suscripción en el footer.",
      contexto: suscripcionBlock?.text,
    });
  }

  return {
    sitioWeb: sitioLink?.text.trim() ?? "",
    editoraResponsableNombre: responsableLink?.text.trim() ?? "",
    editoraResponsableEmail: responsableLink?.href?.replace("mailto:", "").trim() ?? "",
    editoraResponsableCargo: cargoMatch?.[1]?.trim() ?? "",
    mensajeSuscripcion: suscripcionBlock?.text.replace(bajaLink?.text ?? "", "").trim() ?? "",
    linkBajaSuscripcion: bajaLink?.href ?? "",
  };
}
