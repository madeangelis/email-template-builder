/**
 * Mammoth no publica tipos propios ni existe @types/mammoth en npm.
 * Esta declaración cubre únicamente la superficie que usamos en
 * lib/parseDocx.ts — no es un tipado completo de la librería.
 */
declare module "mammoth" {
  export interface ConversionMessage {
    type: "warning" | "error";
    message: string;
  }

  export interface ConversionResult {
    value: string;
    messages: ConversionMessage[];
  }

  export interface ConvertToHtmlOptions {
    styleMap?: string[];
    convertImage?: unknown;
  }

  export interface ImageElement {
    contentType: string;
    read(encoding: "base64"): Promise<string>;
  }

  export const images: {
    imgElement: (
      transform: (image: ImageElement) => Promise<Record<string, string>>
    ) => unknown;
  };

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer },
    options?: ConvertToHtmlOptions
  ): Promise<ConversionResult>;
}
