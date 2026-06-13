import OpenAI from "openai";
import { calculateCost } from "@/lib/pricing";
import { extractTextFromPDF } from "@/lib/pdf-utils";

export interface ExtractionResult {
  result: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export async function extractWithOpenAI(
  fileBase64: string,
  prompt: string,
  model: string
): Promise<ExtractionResult> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Extraer texto del PDF
  const pdfText = await extractTextFromPDF(fileBase64);

  // Crear mensaje combinando el contenido del PDF y el prompt
  const combinedPrompt = `Documento PDF:\n\n${pdfText}\n\n---\n\n${prompt}`;

  const message = await client.chat.completions.create({
    model: model,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: combinedPrompt,
      },
    ],
  });

  // Extraer el texto de la respuesta
  const result =
    message.choices[0].message.content || "";

  // Obtener tokens utilizados
  const inputTokens = message.usage?.prompt_tokens || 0;
  const outputTokens = message.usage?.completion_tokens || 0;

  // Calcular costo
  const costCalc = calculateCost(model, {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
  });

  return {
    result,
    inputTokens,
    outputTokens,
    cost: costCalc.total_cost,
  };
}

/**
 * Valida que la API key de OpenAI esté configurada
 */
export function validateOpenAIKey(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY no está configurada en las variables de entorno"
    );
  }
}

/**
 * Obtiene el proveedor de un modelo
 */
export function getModelProvider(modelId: string): "anthropic" | "openai" {
  if (modelId.startsWith("gpt")) {
    return "openai";
  }
  if (modelId.startsWith("claude")) {
    return "anthropic";
  }
  throw new Error(`Proveedor desconocido para modelo: ${modelId}`);
}
