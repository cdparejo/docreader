import * as pdfjsLib from "pdfjs-dist";

// Configurar worker de pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extrae texto de un PDF en formato base64
 */
export async function extractTextFromPDF(fileBase64: string): Promise<string> {
  try {
    const pdfData = Buffer.from(fileBase64, "base64");

    // Cargar el documento PDF
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

    let fullText = "";

    // Iterar por cada página
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");

      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Obtiene un resumen del contenido del PDF (primeras N palabras)
 */
export function getPDFSummary(text: string, maxWords: number = 500): string {
  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return text;
  }
  return words.slice(0, maxWords).join(" ") + "...";
}
