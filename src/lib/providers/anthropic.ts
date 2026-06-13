import Anthropic from "@anthropic-ai/sdk";
import { calculateCost } from "@/lib/pricing";

export interface ExtractionResult {
  result: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export async function extractWithAnthropic(
  fileBase64: string,
  prompt: string,
  model: string
): Promise<ExtractionResult> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await client.messages.create({
    model: model,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: fileBase64,
            },
          } as any,
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  // Extraer el texto de la respuesta
  const result =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Obtener tokens utilizados
  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;

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
