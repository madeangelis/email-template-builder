import type {
  Corresponsal,
  Newsletter,
  Noticia,
} from "@/types/newsletter";

/* ------------------------------------------------------------------ */
/* Utilidades base                                                     */
/* ------------------------------------------------------------------ */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHref(url: string | undefined): string {
  const trimmed = (url ?? "").trim();
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  return "#";
}

/* ------------------------------------------------------------------ */
/* UTM tracking                                                        */
/*                                                                      */
/* La plantilla real de gerontologia.org agrega estos parámetros a     */
/* TODOS los links de contenido (no a los mailto:) para medir cada     */
/* edición por separado. utm_id se arma con mes/año de la edición      */
/* (ej. "boletin_julio_2026"), extraídos ya por el parser en           */
/* encabezado.mes / encabezado.anio.                                   */
/* ------------------------------------------------------------------ */

interface UtmContext {
  mes: string;
  anio: string;
}

function withUtm(url: string, utm: UtmContext): string {
  if (!url || url === "#" || url.startsWith("mailto:")) return url;
  if (!utm.mes || !utm.anio) return url; // sin datos suficientes: no se inventa un utm_id

  const utmId = `boletin_${utm.mes}_${utm.anio}`;
  const params = `utm_source=Boletin&utm_medium=Email&utm_campaign=Boletin+${utm.anio}&utm_id=${utmId}&utm_term=boletin`;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params}`;
}

/**
 * Aplica UTM a todos los <a href> de un fragmento de HTML ya
 * sanitizado (ej. un párrafo de la Editorial). No vuelve a sanitizar:
 * asume que el HTML de entrada ya pasó por sanitizeInlineHtml.
 */
function addUtmToLinks(html: string, utm: UtmContext): string {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") ?? "";
    a.setAttribute("href", withUtm(href, utm));
  });
  return wrapper.innerHTML;
}

/* ------------------------------------------------------------------ */
/* Constantes de estilo                                                */
/*                                                                      */
/* Copiadas literalmente de la plantilla real (newsletter.html) y      */
/* factorizadas para no repetir el mismo bloque de declaraciones CSS   */
/* docenas de veces. El resultado computado es idéntico al original.   */
/* ------------------------------------------------------------------ */

const ADJUST = "-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;";
const TABLE_RESET = `${ADJUST}mso-table-lspace:0pt;mso-table-rspace:0pt;border-spacing:0;border-collapse:collapse;table-layout:fixed;margin:0 auto;`;
const TD_RESET = `${ADJUST}mso-table-lspace:0pt;mso-table-rspace:0pt;`;

const COLOR_PRIMARY = "#cc3333";
const COLOR_ACCENT = "#f3a333";
const BG_SECTION = "#f8f8f8";
const BG_ALT_SECTION = "#fafafa";
const TEXT_BODY = "#222222";

const TITLE_SERIF_28 = "font-family:'Playfair Display',serif;color:#000000;font-size:28px;margin-top:0;line-height:1.4;";
const TITLE_SERIF_18 = "font-family:'Playfair Display',serif;color:#000000;margin-top:0;line-height:1.4;font-size:18px;";
const SUBHEADING_STYLE = "display:inline-block;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:rgba(0,0,0,0.7);position:relative;margin-bottom:20px;border-bottom:#f3a333 1px solid;";
const BTN_STYLE = `text-decoration:none;background:${COLOR_ACCENT};border-radius:30px;padding:10px 15px;color:#ffffff;`;

/* ------------------------------------------------------------------ */
/* Render de una noticia individual                                    */
/* ------------------------------------------------------------------ */

function renderFuenteYTexto(n: Noticia): string {
  const fuente = n.fuente ? `${escapeHtml(n.fuente)}. ` : "";
  return `${fuente}${escapeHtml(n.texto)}`;
}

/**
 * Noticia de la sección "Internacionales" (noticiasBreves).
 * Reproduce el triple anidado de tablas que trae la plantilla real
 * para cada bloque — se preserva tal cual: es un patrón típico de
 * herramientas de armado de emails (Stripo/BEE) que garantiza
 * espaciado consistente en Outlook, y no hay beneficio en "limpiarlo".
 */
function renderNoticiaBreve(n: Noticia, utm: UtmContext): string {
  return `
              <tr style="${ADJUST}">
                <td valign="top" width="100%" style="${TD_RESET}padding-top:20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
                    <tr style="${ADJUST}">
                      <td valign="top" width="100%" style="${TD_RESET}padding-top:20px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
                          <tr style="${ADJUST}">
                            <td class="text-services" style="${TD_RESET}padding:10px 10px 0;text-align:left;" align="left">
                              <h3 style="${ADJUST}${TITLE_SERIF_18}">${escapeHtml(n.titulo)}</h3>
                              <p style="${ADJUST}color:${TEXT_BODY};">${renderFuenteYTexto(n)}</p>
                              <p style="${ADJUST}color:${TEXT_BODY};">
                                <a href="${withUtm(safeHref(n.link), utm)}" class="btn btn-primary" style="${ADJUST}${BTN_STYLE}">${escapeHtml(n.linkTexto || "Leer más")}</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;
}

/**
 * Noticia de la sección "por país" (noticiasPorPais). Estructura más
 * simple (doble anidado) e incluye el badge de país como "subheading".
 */
function renderNoticiaPais(n: Noticia, utm: UtmContext): string {
  return `
              <tr style="${ADJUST}">
                <td class="bg_light email-section" style="${TD_RESET}background:${BG_ALT_SECTION};padding:0;width:100%;" width="100%">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="${TABLE_RESET}">
                    <tr style="${ADJUST}">
                      <td valign="middle" width="50%" style="${TD_RESET}">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
                          <tr style="${ADJUST}">
                            <td class="text-services" style="${TD_RESET}text-align:left;padding:20px 30px;" align="left">
                              <div class="heading-section" style="${ADJUST}">
                                <span class="subheading" style="${ADJUST}${SUBHEADING_STYLE}">${escapeHtml(n.pais ?? "")}</span>
                                <h2 style="${ADJUST}${TITLE_SERIF_18}">${escapeHtml(n.titulo)}</h2>
                                <p style="${ADJUST}color:${TEXT_BODY};">${renderFuenteYTexto(n)}</p>
                                <p style="${ADJUST}color:${TEXT_BODY};">
                                  <a href="${withUtm(safeHref(n.link), utm)}" class="btn btn-primary" style="${ADJUST}${BTN_STYLE}">${escapeHtml(n.linkTexto || "Leer más")}</a>
                                </p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`;
}

/* ------------------------------------------------------------------ */
/* Corresponsal (columna del footer)                                   */
/* ------------------------------------------------------------------ */

function renderCorresponsal(c: Corresponsal): string {
  return `
                          <li style="${ADJUST}list-style:none;margin-bottom:10px;">
                            ${escapeHtml(c.pais)}:<br style="${ADJUST}" /><a href="mailto:${escapeHtml(c.email)}" style="${ADJUST}text-decoration:none;color:rgba(255,255,255,1);">${escapeHtml(c.nombre)}</a>
                          </li>`;
}

/* ------------------------------------------------------------------ */
/* Secciones                                                            */
/* ------------------------------------------------------------------ */

function renderHead(newsletter: Newsletter): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" style="${ADJUST}background:#f1f1f1;margin:0 auto;padding:0;height:100%;width:100%;">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <meta name="viewport" content="width=device-width" />
  <title>${escapeHtml(newsletter.encabezado.titulo)} - ${escapeHtml(newsletter.encabezado.edicion)}</title>
  <link href="https://fonts.googleapis.com/css?family=Playfair+Display:400,400i,700,700i" rel="stylesheet" />
  <style>
    @media only screen and (min-device-width: 320px) and (max-device-width: 374px) { u~div .email-container { min-width: 320px !important; } }
    @media only screen and (min-device-width: 375px) and (max-device-width: 413px) { u~div .email-container { min-width: 375px !important; } }
    @media only screen and (min-device-width: 414px) { u~div .email-container { min-width: 414px !important; } }
    @media screen and (max-width: 500px) {
      .icon { text-align: left; }
      .text-services { padding-left: 0; padding-right: 20px; text-align: left; }
    }
    html,body{margin:0!important;padding:0!important;width:100%!important;height:100%!important;}
    table{border-collapse:collapse!important;border-spacing:0!important;}
    img{border:0;outline:none;text-decoration:none;display:block;height:auto;-ms-interpolation-mode:bicubic;}
    table,td{mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;}
    a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}
    div[style*="margin: 16px 0"]{margin:0!important;}
  </style>
</head>`;
}

function renderLogoRow(newsletter: Newsletter, utm: UtmContext): string {
  return `
        <tr>
          <td style="text-align:center;background-color:${COLOR_PRIMARY};height:110px;padding:5px 150px;" align="center" bgcolor="${COLOR_PRIMARY}">
            <a href="${withUtm("https://www.gerontologia.org/", utm)}" style="${ADJUST}text-decoration:none;">
              <img src="${escapeHtml(newsletter.chrome.logoUrl)}" alt="logo RLG" style="${ADJUST}-ms-interpolation-mode:bicubic;width:100%;" />
            </a>
          </td>
        </tr>`;
}

function renderEdicionRow(newsletter: Newsletter, utm: UtmContext): string {
  const { encabezado } = newsletter;
  return `
              <tr style="${ADJUST}">
                <td style="${TD_RESET}text-align:center;padding:2.5em;background:rgb(209,209,209);" align="center">
                  <div class="heading-section heading-section-white" style="${ADJUST}color:rgba(255,255,255,0.8);">
                    <p style="${ADJUST}color:#323232;">${escapeHtml(encabezado.edicion)}</p>
                    <a href="${withUtm("https://www.gerontologia.org/sobre-la-rlg/", utm)}" style="${ADJUST}text-decoration:none;color:${COLOR_PRIMARY};">${escapeHtml(encabezado.sitioWeb)}</a>
                  </div>
                </td>
              </tr>`;
}

function renderEditorialRow(newsletter: Newsletter, utm: UtmContext): string {
  const { editorial } = newsletter;
  const cuerpo = editorial.parrafos
    .map((p) => addUtmToLinks(p, utm))
    .join("<br /><br />");

  const firmaLine = editorial.firmaEmail
    ? `<a href="mailto:${escapeHtml(editorial.firmaEmail)}" style="${ADJUST}">${escapeHtml(editorial.firmaNombre)}</a>`
    : escapeHtml(editorial.firmaNombre);

  return `
              <tr style="${ADJUST}">
                <td style="${TD_RESET}padding:2.5em;background:${BG_SECTION};">
                  <div class="heading-section" style="${ADJUST}text-align:center;padding:0 20px;">
                    <h2 style="${ADJUST}${TITLE_SERIF_28}">${escapeHtml(editorial.titulo)}</h2>
                    <p style="${ADJUST}color:${TEXT_BODY};text-align:left;">${cuerpo}</p>
                    <p style="${ADJUST}color:${TEXT_BODY};text-align:left;">
                      ${firmaLine}<br />${escapeHtml(editorial.firmaCargo)}
                    </p>
                  </div>
                </td>
              </tr>`;
}

function renderInternacionalesSection(newsletter: Newsletter, utm: UtmContext): string {
  const items = newsletter.noticiasBreves.map((n) => renderNoticiaBreve(n, utm)).join("");
  return `
              <tr style="${ADJUST}">
                <td style="${TD_RESET}padding:2.5em;background:${BG_SECTION};">
                  <div class="heading-section" style="${ADJUST}text-align:center;padding:0 30px;">
                    <span class="subheading" style="${ADJUST}${SUBHEADING_STYLE}">${escapeHtml(newsletter.chrome.eyebrowInternacionales)}</span>
                    <h2 style="${ADJUST}${TITLE_SERIF_28}">${escapeHtml(newsletter.chrome.tituloInternacionales)}</h2>
                  </div>
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="${TABLE_RESET}">${items}
                  </table>
                </td>
              </tr>`;
}

function renderNoticiasPorPaisSection(newsletter: Newsletter, utm: UtmContext): string {
  if (newsletter.noticiasPorPais.length === 0) return "";
  const heading = `
              <tr style="${ADJUST}">
                <td class="bg_light" style="${TD_RESET}width:100%;padding:2.5em;background:${BG_SECTION};">
                  <div class="heading-section" style="${ADJUST}text-align:center;padding:30px 30px;">
                    <h2 style="${ADJUST}${TITLE_SERIF_28}">${escapeHtml(newsletter.chrome.tituloRegionales)}</h2>
                  </div>
                </td>
              </tr>`;
  const items = newsletter.noticiasPorPais.map((n) => renderNoticiaPais(n, utm)).join("");
  return heading + items;
}

function renderLibroRecomendadoRow(newsletter: Newsletter): string {
  const { libroRecomendado: libro } = newsletter;
  return `
              <tr style="background:${BG_ALT_SECTION};">
                <td style="text-align:center;width:100%;height:110px;" align="center">
                  <a href="${safeHref(libro.linkDescarga)}" style="${ADJUST}text-decoration:none;text-align:center;">
                    <br />
                    <img src="${escapeHtml(newsletter.chrome.imagenLibroUrl)}" alt="${escapeHtml(libro.seccionTitulo)}" style="${ADJUST}-ms-interpolation-mode:bicubic;width:30%;padding:0 210px;" />
                  </a>
                  <h2>${escapeHtml(libro.seccionTitulo)}</h2>
                  <p>
                    ${libro.subtitulo ? `${escapeHtml(libro.subtitulo)}<br />` : ""}
                    ${escapeHtml(libro.autor)}<br />
                    <a href="${safeHref(libro.linkDescarga)}">${escapeHtml(libro.textoLink)}</a>
                  </p>
                </td>
              </tr>`;
}

function renderNotaEditoraRow(newsletter: Newsletter): string {
  const { notaEditora } = newsletter;
  return `
              <tr style="${ADJUST}">
                <td class="bg_white email-section" style="${TD_RESET}background:${BG_SECTION};padding:2.5em;">
                  <div class="heading-section" style="${ADJUST}text-align:center;padding:0 30px;">
                    <span class="subheading" style="${ADJUST}${SUBHEADING_STYLE}">${escapeHtml(newsletter.chrome.eyebrowNotaEditora)}</span>
                    <p style="${ADJUST}color:${TEXT_BODY};">${escapeHtml(notaEditora.texto)}</p>
                  </div>
                </td>
              </tr>`;
}

function renderFooterColumnaRLG(newsletter: Newsletter, utm: UtmContext): string {
  const { encabezado } = newsletter;
  return `
                <td valign="top" width="33.333%" style="${TD_RESET}padding-top:20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
                    <tr style="${ADJUST}">
                      <td style="${TD_RESET}text-align:left;padding-right:10px;" align="left">
                        <h3 class="heading" style="${ADJUST}font-family:'Playfair Display',serif;margin-top:0;color:#ffffff;font-size:16px;">${escapeHtml(newsletter.chrome.tituloFooterRLG)}</h3>
                        <p style="${ADJUST}color:#fff;font-size:12px;">${escapeHtml(encabezado.subtitulo)}</p>
                        <a href="${withUtm("https://www.gerontologia.org", utm)}" style="${ADJUST}color:#fff;font-size:12px;" target="_blank" rel="noopener noreferrer">
                          ${escapeHtml(encabezado.sitioWeb)}
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>`;
}

function renderFooterColumnaContacto(newsletter: Newsletter): string {
  const { footer } = newsletter;
  return `
                <td valign="top" width="33.333%" style="${TD_RESET}padding-top:20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
                    <tr style="${ADJUST}">
                      <td style="${TD_RESET}text-align:left;padding-left:5px;padding-right:5px;" align="left">
                        <h3 class="heading" style="${ADJUST}font-family:'Playfair Display',serif;margin-top:0;color:#ffffff;font-size:16px;">Contacto</h3>
                        <ul style="${ADJUST}margin:0;padding:0;font-size:12px;">
                          <li style="${ADJUST}list-style:none;margin-bottom:10px;">
                            <span class="text" style="${ADJUST}">Editora responsable:
                              <br style="${ADJUST}" /><a href="mailto:${escapeHtml(footer.editoraResponsableEmail)}" style="${ADJUST}text-decoration:none;color:rgba(255,255,255,1);">${escapeHtml(footer.editoraResponsableNombre)}</a><br style="${ADJUST}" />${escapeHtml(footer.editoraResponsableCargo)}</span>
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </table>
                </td>`;
}

function renderFooterColumnaCorresponsales(newsletter: Newsletter): string {
  const { corresponsales } = newsletter.notaEditora;
  return `
                <td valign="top" width="33.333%" style="${TD_RESET}padding-top:20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
                    <tr style="${ADJUST}">
                      <td style="${TD_RESET}text-align:left;padding-left:10px;" align="left">
                        <h3 class="heading" style="${ADJUST}font-family:'Playfair Display',serif;margin-top:0;color:#ffffff;font-size:16px;">Corresponsales</h3>
                        <ul style="${ADJUST}margin:0;padding:0;font-size:12px;">${corresponsales.map(renderCorresponsal).join("")}
                        </ul>
                      </td>
                    </tr>
                  </table>
                </td>`;
}

function renderFooterBottomRow(newsletter: Newsletter): string {
  const anio = newsletter.encabezado.anio || new Date().getFullYear().toString();
  return `
        <tr style="${ADJUST}">
          <td valign="middle" class="bg_black footer email-section" style="${TD_RESET}background:#000000;padding:2.5em;color:rgba(255,255,255,0.5);background-color:${COLOR_PRIMARY};" bgcolor="${COLOR_PRIMARY}">
            <table style="${TABLE_RESET}">
              <tr style="${ADJUST}">
                <td valign="top" width="33.333%" style="${TD_RESET}">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
                    <tr style="${ADJUST}">
                      <td style="${TD_RESET}text-align:left;padding-right:10px;font-size:12px;" align="left">
                        <p style="${ADJUST}color:#fff;">&copy; ${escapeHtml(anio)} RLG. All Rights Reserved</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td valign="top" width="33.333%" style="${TD_RESET}">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
                    <tr style="${ADJUST}">
                      <td style="${TD_RESET}text-align:right;padding-left:5px;padding-right:5px;font-size:12px;" align="right">
                        <!-- {unsubscription_url} lo completa la plataforma de envío al mandar la campaña: NO se reemplaza con el link del .docx. -->
                        <p style="${ADJUST}color:${TEXT_BODY};">
                          <a href="{unsubscription_url}" style="${ADJUST}text-decoration:none;color:rgba(255,255,255,0.4);">Desuscribirse</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
}

/* ------------------------------------------------------------------ */
/* Ensamblado final                                                     */
/* ------------------------------------------------------------------ */

/**
 * Genera el HTML final del boletín reutilizando exactamente el markup
 * y los estilos inline de la plantilla real de la RLG (newsletter.html),
 * repitiendo los bloques de noticia y corresponsal por cada elemento
 * dinámico. UTM se agrega automáticamente a todos los links de
 * contenido según mes/año de la edición; el link de "Desuscribirse"
 * se deja con el merge tag {unsubscription_url} fijo, sin tocar.
 */
export function generateHtml(newsletter: Newsletter): string {
  const utm: UtmContext = { mes: newsletter.encabezado.mes, anio: newsletter.encabezado.anio };

  return `${renderHead(newsletter)}
<body width="100%" style="${ADJUST}background:#f8f8f8;font-family:'Montserrat',sans-serif;font-weight:400;font-size:15px;line-height:1.8;color:rgba(0,0,0,0.7);mso-line-height-rule:exactly;margin:0 auto;height:100%;width:100%;padding:0;">
  <center style="${ADJUST}width:100%;background-color:#f1f1f1;">
    <div style="${ADJUST}display:none;font-size:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;font-family:sans-serif;">
      &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>
    <div style="${ADJUST}max-width:600px;margin:0 auto;" class="email-container">
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">${renderLogoRow(newsletter, utm)}
        <tr>
          <td style="${TD_RESET}">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">${renderEdicionRow(newsletter, utm)}${renderEditorialRow(newsletter, utm)}${renderInternacionalesSection(newsletter, utm)}${renderNoticiasPorPaisSection(newsletter, utm)}${renderLibroRecomendadoRow(newsletter)}${renderNotaEditoraRow(newsletter)}
            </table>
          </td>
        </tr>
      </table>
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="${TABLE_RESET}">
        <tr style="${ADJUST}">
          <td valign="middle" class="bg_black footer email-section" style="${TD_RESET}background:#000000;padding:2.5em;color:rgba(255,255,255,0.5);background-color:${COLOR_PRIMARY};" bgcolor="${COLOR_PRIMARY}">
            <table style="${TABLE_RESET}">
              <tr style="${ADJUST}">${renderFooterColumnaRLG(newsletter, utm)}${renderFooterColumnaContacto(newsletter)}${renderFooterColumnaCorresponsales(newsletter)}
              </tr>
            </table>
          </td>
        </tr>${renderFooterBottomRow(newsletter)}
      </table>
    </div>
  </center>
</body>
</html>`;
}
