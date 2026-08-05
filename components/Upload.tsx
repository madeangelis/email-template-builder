"use client";

import { useCallback, useRef, useState } from "react";
import { extractHtmlFromDocx } from "@/lib/parseDocx";
import { parseNewsletterHtml } from "@/lib/parser";
import { useNewsletter } from "@/lib/newsletterContext";

interface UploadProps {
  /** Se llama después de un parseo exitoso, para que el padre cambie de vista (ej. al Editor). */
  onParsed?: () => void;
}

export default function Upload({ onParsed }: UploadProps) {
  const { setNewsletter } = useNewsletter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const procesarArchivo = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".docx")) {
        setError("El archivo debe ser un .docx (Word). Formato recibido no soportado.");
        return;
      }

      setIsLoading(true);
      setError(null);
      setFileName(file.name);

      try {
        const { html, warnings: warningsExtraccion } = await extractHtmlFromDocx(file);
        const { newsletter, warnings: warningsParseo } = parseNewsletterHtml(html);

        const warnings = [
          ...warningsExtraccion.map((mensaje) => ({ mensaje })),
          ...warningsParseo,
        ];

        setNewsletter(newsletter, warnings);
        onParsed?.();
      } catch (err) {
        console.error(err);
        setError(
          "No se pudo leer el documento. Verificá que sea un .docx válido y que respete la estructura habitual del boletín."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setNewsletter, onParsed]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) procesarArchivo(file);
      e.target.value = ""; // permite volver a subir el mismo archivo si hace falta
    },
    [procesarArchivo]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) procesarArchivo(file);
    },
    [procesarArchivo]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer
          ${isDragging ? "border-emerald-500 bg-emerald-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={handleInputChange}
        />

        {isLoading ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
            <p className="text-sm text-gray-600">Leyendo {fileName}…</p>
          </>
        ) : (
          <>
            <svg
              className="h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              Arrastrá el boletín (.docx) acá, o hacé click para elegir el archivo
            </p>
            <p className="text-xs text-gray-400">
              Se procesa localmente en el navegador — no se sube a ningún servidor
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
          {error}
        </p>
      )}
    </div>
  );
}
