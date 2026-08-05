import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boletín RLG — Generador de Newsletter",
  description: "Genera el HTML del boletín mensual RLG a partir de un .docx",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
