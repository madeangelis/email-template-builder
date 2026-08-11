export interface Encabezado {
  titulo: string;
  subtitulo: string;
  sitioWeb: string;
  edicion: string;
  mes: string;
  anio: string;
}

export interface Editorial {
  titulo: string;
  parrafos: string[];
  firmaNombre: string;
  firmaEmail?: string;
  firmaCargo: string;
}

export interface Noticia {
  id: string;
  pais?: string;
  titulo: string;
  fuente?: string;
  texto: string;
  link: string;
  linkTexto: string;
}

export interface UltimasActualizaciones {
  texto: string;
  link: string;
  linkTexto: string;
}

export interface LibroRecomendado {
  seccionTitulo: string;
  subtitulo?: string;
  autor: string;
  linkDescarga: string;
  textoLink: string;
}

export interface Corresponsal {
  id: string;
  pais: string;
  nombre: string;
  email: string;
}

export interface NotaEditora {
  texto: string;
  emailCoordinadora: string;
  corresponsales: Corresponsal[];
}

export interface Footer {
  sitioWeb: string;
  editoraResponsableNombre: string;
  editoraResponsableEmail: string;
  editoraResponsableCargo: string;
  mensajeSuscripcion: string;
  linkBajaSuscripcion: string;
}

export interface PlantillaChrome {
  eyebrowInternacionales: string;
  tituloInternacionales: string;
  tituloRegionales: string;
  eyebrowNotaEditora: string;
  tituloFooterRLG: string;
  logoUrl: string;
  imagenLibroUrl: string;
}

export interface Newsletter {
  encabezado: Encabezado;
  editorial: Editorial;
  noticiasBreves: Noticia[];
  ultimasActualizaciones: UltimasActualizaciones;
  noticiasPorPais: Noticia[];
  libroRecomendado: LibroRecomendado;
  notaEditora: NotaEditora;
  footer: Footer;
  chrome: PlantillaChrome;
}

export interface ParseWarning {
  mensaje: string;
  contexto?: string;
}

export interface ParseResult {
  newsletter: Newsletter;
  warnings: ParseWarning[];
}
