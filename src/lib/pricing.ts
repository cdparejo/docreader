// Precios por modelo (USD por 1M tokens)
export const MODEL_PRICING = {
  'claude-haiku-4-5-20251001': {
    input: 0.80,
    output: 4.00,
    name: 'Haiku 4.5',
  },
  'claude-sonnet-4-6': {
    input: 3.00,
    output: 15.00,
    name: 'Sonnet 4.6',
  },
  'gemini-2.5-flash': {
    input: 0.075,
    output: 0.30,
    name: 'Gemini 2.5 Flash',
  },
};

export type ModelId = keyof typeof MODEL_PRICING;

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface CostCalculation {
  input_cost: number;
  output_cost: number;
  total_cost: number;
}

/**
 * Calcula el costo en USD basado en tokens utilizados
 */
export function calculateCost(
  modelId: ModelId | string,
  usage: TokenUsage
): CostCalculation {
  const pricing = MODEL_PRICING[modelId as ModelId];

  if (!pricing) {
    throw new Error(`Modelo no soportado: ${modelId}`);
  }

  // Convertir de 1M tokens a costo individual
  const inputCost = (usage.input_tokens * pricing.input) / 1_000_000;
  const outputCost = (usage.output_tokens * pricing.output) / 1_000_000;
  const totalCost = inputCost + outputCost;

  return {
    input_cost: Number(inputCost.toFixed(6)),
    output_cost: Number(outputCost.toFixed(6)),
    total_cost: Number(totalCost.toFixed(6)),
  };
}

/**
 * Obtiene el nombre legible del modelo
 */
export function getModelName(modelId: string): string {
  const pricing = MODEL_PRICING[modelId as ModelId];
  return pricing?.name || modelId;
}

/**
 * Valida si un modelo está soportado
 */
export function isSupportedModel(modelId: string): boolean {
  return modelId in MODEL_PRICING;
}
