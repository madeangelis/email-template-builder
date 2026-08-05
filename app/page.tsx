"use client";

import { useState } from "react";
import { NewsletterProvider, useNewsletter } from "@/lib/newsletterContext";
import Upload from "@/components/Upload";
import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import Toolbar from "@/components/Toolbar";

type Vista = "upload" | "editor";

function PaginaInterna() {
  const [vista, setVista] = useState<Vista>("upload");
  const { reset } = useNewsletter();

  const handleNuevoBoletin = () => {
    reset();
    setVista("upload");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Boletín RLG</h1>
            <p className="text-xs text-gray-400">Generador de newsletter HTML a partir de .docx</p>
          </div>

          {vista === "editor" && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNuevoBoletin}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Subir otro .docx
              </button>
              <Toolbar />
            </div>
          )}
        </div>
      </header>

      {vista === "upload" ? (
        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <Upload onParsed={() => setVista("editor")} />
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-2">
          <div className="max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <Editor />
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Preview />
          </div>
        </div>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <NewsletterProvider>
      <PaginaInterna />
    </NewsletterProvider>
  );
}
