"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  Corresponsal,
  Editorial,
  Encabezado,
  Footer,
  LibroRecomendado,
  Newsletter,
  Noticia,
  NotaEditora,
  ParseWarning,
  UltimasActualizaciones,
} from "@/types/newsletter";

/* ------------------------------------------------------------------ */
/* Newsletter vacío                                                    */
/*                                                                      */
/* Estado inicial antes de subir un .docx, y base para "agregar        */
/* noticia" en cualquier sección.                                      */
/* ------------------------------------------------------------------ */

function generarId(prefijo: string): string {
  return `${prefijo}-${Math.random().toString(36).slice(2, 10)}`;
}

export function crearNoticiaVacia(conPais: boolean): Noticia {
  return {
    id: generarId("noticia"),
    pais: conPais ? "" : undefined,
    titulo: "",
    fuente: "",
    texto: "",
    link: "",
    linkTexto: "Leer más",
  };
}

function crearCorresponsalVacio(): Corresponsal {
  return { id: generarId("corresponsal"), pais: "", nombre: "", email: "" };
}

export function newsletterVacio(): Newsletter {
  return {
    encabezado: { titulo: "", subtitulo: "", sitioWeb: "", edicion: "", mes: "", anio: "" },
    editorial: { titulo: "", parrafos: [], firmaNombre: "", firmaEmail: "", firmaCargo: "" },
    noticiasBreves: [],
    ultimasActualizaciones: { texto: "", link: "", linkTexto: "" },
    noticiasPorPais: [],
    libroRecomendado: {
      seccionTitulo: "",
      subtitulo: "",
      autor: "",
      linkDescarga: "",
      textoLink: "",
    },
    notaEditora: { texto: "", emailCoordinadora: "", corresponsales: [] },
    footer: {
      sitioWeb: "",
      editoraResponsableNombre: "",
      editoraResponsableEmail: "",
      editoraResponsableCargo: "",
      mensajeSuscripcion: "",
      linkBajaSuscripcion: "",
    },
  };
}

/* ------------------------------------------------------------------ */
/* Reducer                                                              */
/* ------------------------------------------------------------------ */

type SeccionNoticias = "noticiasBreves" | "noticiasPorPais";

interface State {
  newsletter: Newsletter;
  warnings: ParseWarning[];
}

type Action =
  | { type: "SET_NEWSLETTER"; newsletter: Newsletter; warnings: ParseWarning[] }
  | { type: "RESET" }
  | { type: "UPDATE_ENCABEZADO"; patch: Partial<Encabezado> }
  | { type: "UPDATE_EDITORIAL"; patch: Partial<Omit<Editorial, "parrafos">> }
  | { type: "UPDATE_EDITORIAL_PARRAFO"; index: number; value: string }
  | { type: "ADD_EDITORIAL_PARRAFO" }
  | { type: "REMOVE_EDITORIAL_PARRAFO"; index: number }
  | { type: "UPDATE_NOTICIA"; seccion: SeccionNoticias; id: string; patch: Partial<Noticia> }
  | { type: "ADD_NOTICIA"; seccion: SeccionNoticias }
  | { type: "REMOVE_NOTICIA"; seccion: SeccionNoticias; id: string }
  | { type: "REORDER_NOTICIAS"; seccion: SeccionNoticias; fromIndex: number; toIndex: number }
  | { type: "UPDATE_ULTIMAS_ACTUALIZACIONES"; patch: Partial<UltimasActualizaciones> }
  | { type: "UPDATE_LIBRO"; patch: Partial<LibroRecomendado> }
  | { type: "UPDATE_NOTA_EDITORA"; patch: Partial<Omit<NotaEditora, "corresponsales">> }
  | { type: "ADD_CORRESPONSAL" }
  | { type: "REMOVE_CORRESPONSAL"; id: string }
  | { type: "UPDATE_CORRESPONSAL"; id: string; patch: Partial<Corresponsal> }
  | { type: "UPDATE_FOOTER"; patch: Partial<Footer> };

function moverElemento<T>(lista: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= lista.length ||
    toIndex >= lista.length
  ) {
    return lista;
  }
  const copia = [...lista];
  const [movido] = copia.splice(fromIndex, 1);
  copia.splice(toIndex, 0, movido);
  return copia;
}

function reducer(state: State, action: Action): State {
  const { newsletter } = state;

  switch (action.type) {
    case "SET_NEWSLETTER":
      return { newsletter: action.newsletter, warnings: action.warnings };

    case "RESET":
      return { newsletter: newsletterVacio(), warnings: [] };

    case "UPDATE_ENCABEZADO":
      return {
        ...state,
        newsletter: { ...newsletter, encabezado: { ...newsletter.encabezado, ...action.patch } },
      };

    case "UPDATE_EDITORIAL":
      return {
        ...state,
        newsletter: { ...newsletter, editorial: { ...newsletter.editorial, ...action.patch } },
      };

    case "UPDATE_EDITORIAL_PARRAFO": {
      const parrafos = newsletter.editorial.parrafos.map((p, i) =>
        i === action.index ? action.value : p
      );
      return {
        ...state,
        newsletter: { ...newsletter, editorial: { ...newsletter.editorial, parrafos } },
      };
    }

    case "ADD_EDITORIAL_PARRAFO":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          editorial: { ...newsletter.editorial, parrafos: [...newsletter.editorial.parrafos, ""] },
        },
      };

    case "REMOVE_EDITORIAL_PARRAFO":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          editorial: {
            ...newsletter.editorial,
            parrafos: newsletter.editorial.parrafos.filter((_, i) => i !== action.index),
          },
        },
      };

    case "UPDATE_NOTICIA":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          [action.seccion]: newsletter[action.seccion].map((n) =>
            n.id === action.id ? { ...n, ...action.patch } : n
          ),
        },
      };

    case "ADD_NOTICIA": {
      const conPais = action.seccion === "noticiasPorPais";
      return {
        ...state,
        newsletter: {
          ...newsletter,
          [action.seccion]: [...newsletter[action.seccion], crearNoticiaVacia(conPais)],
        },
      };
    }

    case "REMOVE_NOTICIA":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          [action.seccion]: newsletter[action.seccion].filter((n) => n.id !== action.id),
        },
      };

    case "REORDER_NOTICIAS":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          [action.seccion]: moverElemento(
            newsletter[action.seccion],
            action.fromIndex,
            action.toIndex
          ),
        },
      };

    case "UPDATE_ULTIMAS_ACTUALIZACIONES":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          ultimasActualizaciones: { ...newsletter.ultimasActualizaciones, ...action.patch },
        },
      };

    case "UPDATE_LIBRO":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          libroRecomendado: { ...newsletter.libroRecomendado, ...action.patch },
        },
      };

    case "UPDATE_NOTA_EDITORA":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          notaEditora: { ...newsletter.notaEditora, ...action.patch },
        },
      };

    case "ADD_CORRESPONSAL":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          notaEditora: {
            ...newsletter.notaEditora,
            corresponsales: [...newsletter.notaEditora.corresponsales, crearCorresponsalVacio()],
          },
        },
      };

    case "REMOVE_CORRESPONSAL":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          notaEditora: {
            ...newsletter.notaEditora,
            corresponsales: newsletter.notaEditora.corresponsales.filter(
              (c) => c.id !== action.id
            ),
          },
        },
      };

    case "UPDATE_CORRESPONSAL":
      return {
        ...state,
        newsletter: {
          ...newsletter,
          notaEditora: {
            ...newsletter.notaEditora,
            corresponsales: newsletter.notaEditora.corresponsales.map((c) =>
              c.id === action.id ? { ...c, ...action.patch } : c
            ),
          },
        },
      };

    case "UPDATE_FOOTER":
      return {
        ...state,
        newsletter: { ...newsletter, footer: { ...newsletter.footer, ...action.patch } },
      };

    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Context + hook público                                              */
/*                                                                      */
/* El valor expuesto por useNewsletter() son funciones con nombre       */
/* claro (updateNoticia, addNoticia, etc.), no el dispatch crudo — así  */
/* los componentes no necesitan conocer la forma de las acciones.       */
/* ------------------------------------------------------------------ */

interface NewsletterContextValue {
  newsletter: Newsletter;
  warnings: ParseWarning[];
  setNewsletter: (newsletter: Newsletter, warnings: ParseWarning[]) => void;
  reset: () => void;
  updateEncabezado: (patch: Partial<Encabezado>) => void;
  updateEditorial: (patch: Partial<Omit<Editorial, "parrafos">>) => void;
  updateEditorialParrafo: (index: number, value: string) => void;
  addEditorialParrafo: () => void;
  removeEditorialParrafo: (index: number) => void;
  updateNoticia: (seccion: SeccionNoticias, id: string, patch: Partial<Noticia>) => void;
  addNoticia: (seccion: SeccionNoticias) => void;
  removeNoticia: (seccion: SeccionNoticias, id: string) => void;
  reorderNoticias: (seccion: SeccionNoticias, fromIndex: number, toIndex: number) => void;
  updateUltimasActualizaciones: (patch: Partial<UltimasActualizaciones>) => void;
  updateLibro: (patch: Partial<LibroRecomendado>) => void;
  updateNotaEditora: (patch: Partial<Omit<NotaEditora, "corresponsales">>) => void;
  addCorresponsal: () => void;
  removeCorresponsal: (id: string) => void;
  updateCorresponsal: (id: string, patch: Partial<Corresponsal>) => void;
  updateFooter: (patch: Partial<Footer>) => void;
}

const NewsletterContext = createContext<NewsletterContextValue | null>(null);

export function NewsletterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { newsletter: newsletterVacio(), warnings: [] });

  const setNewsletter = useCallback(
    (newsletter: Newsletter, warnings: ParseWarning[]) =>
      dispatch({ type: "SET_NEWSLETTER", newsletter, warnings }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const updateEncabezado = useCallback(
    (patch: Partial<Encabezado>) => dispatch({ type: "UPDATE_ENCABEZADO", patch }),
    []
  );
  const updateEditorial = useCallback(
    (patch: Partial<Omit<Editorial, "parrafos">>) => dispatch({ type: "UPDATE_EDITORIAL", patch }),
    []
  );
  const updateEditorialParrafo = useCallback(
    (index: number, value: string) => dispatch({ type: "UPDATE_EDITORIAL_PARRAFO", index, value }),
    []
  );
  const addEditorialParrafo = useCallback(
    () => dispatch({ type: "ADD_EDITORIAL_PARRAFO" }),
    []
  );
  const removeEditorialParrafo = useCallback(
    (index: number) => dispatch({ type: "REMOVE_EDITORIAL_PARRAFO", index }),
    []
  );
  const updateNoticia = useCallback(
    (seccion: SeccionNoticias, id: string, patch: Partial<Noticia>) =>
      dispatch({ type: "UPDATE_NOTICIA", seccion, id, patch }),
    []
  );
  const addNoticia = useCallback(
    (seccion: SeccionNoticias) => dispatch({ type: "ADD_NOTICIA", seccion }),
    []
  );
  const removeNoticia = useCallback(
    (seccion: SeccionNoticias, id: string) => dispatch({ type: "REMOVE_NOTICIA", seccion, id }),
    []
  );
  const reorderNoticias = useCallback(
    (seccion: SeccionNoticias, fromIndex: number, toIndex: number) =>
      dispatch({ type: "REORDER_NOTICIAS", seccion, fromIndex, toIndex }),
    []
  );
  const updateUltimasActualizaciones = useCallback(
    (patch: Partial<UltimasActualizaciones>) =>
      dispatch({ type: "UPDATE_ULTIMAS_ACTUALIZACIONES", patch }),
    []
  );
  const updateLibro = useCallback(
    (patch: Partial<LibroRecomendado>) => dispatch({ type: "UPDATE_LIBRO", patch }),
    []
  );
  const updateNotaEditora = useCallback(
    (patch: Partial<Omit<NotaEditora, "corresponsales">>) =>
      dispatch({ type: "UPDATE_NOTA_EDITORA", patch }),
    []
  );
  const addCorresponsal = useCallback(() => dispatch({ type: "ADD_CORRESPONSAL" }), []);
  const removeCorresponsal = useCallback(
    (id: string) => dispatch({ type: "REMOVE_CORRESPONSAL", id }),
    []
  );
  const updateCorresponsal = useCallback(
    (id: string, patch: Partial<Corresponsal>) =>
      dispatch({ type: "UPDATE_CORRESPONSAL", id, patch }),
    []
  );
  const updateFooter = useCallback(
    (patch: Partial<Footer>) => dispatch({ type: "UPDATE_FOOTER", patch }),
    []
  );

  const value = useMemo<NewsletterContextValue>(
    () => ({
      newsletter: state.newsletter,
      warnings: state.warnings,
      setNewsletter,
      reset,
      updateEncabezado,
      updateEditorial,
      updateEditorialParrafo,
      addEditorialParrafo,
      removeEditorialParrafo,
      updateNoticia,
      addNoticia,
      removeNoticia,
      reorderNoticias,
      updateUltimasActualizaciones,
      updateLibro,
      updateNotaEditora,
      addCorresponsal,
      removeCorresponsal,
      updateCorresponsal,
      updateFooter,
    }),
    [
      state,
      setNewsletter,
      reset,
      updateEncabezado,
      updateEditorial,
      updateEditorialParrafo,
      addEditorialParrafo,
      removeEditorialParrafo,
      updateNoticia,
      addNoticia,
      removeNoticia,
      reorderNoticias,
      updateUltimasActualizaciones,
      updateLibro,
      updateNotaEditora,
      addCorresponsal,
      removeCorresponsal,
      updateCorresponsal,
      updateFooter,
    ]
  );

  return <NewsletterContext.Provider value={value}>{children}</NewsletterContext.Provider>;
}

export function useNewsletter(): NewsletterContextValue {
  const ctx = useContext(NewsletterContext);
  if (!ctx) {
    throw new Error("useNewsletter debe usarse dentro de <NewsletterProvider>");
  }
  return ctx;
}
