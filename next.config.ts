import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Mammoth y el parseo del .docx corren enteramente en el navegador
   * (ver lib/parseDocx.ts y lib/parser.ts), por lo que no hace falta
   * ninguna configuración especial de servidor ni API routes para
   * este flujo.
   */
  reactStrictMode: true,
};

export default nextConfig;
