-- Agregar modelos de OpenAI para MVP 4
INSERT INTO models (name, model_id, description, speed, cost, is_active, provider) VALUES
  (
    'GPT-4 Turbo',
    'gpt-4-turbo',
    'Modelo avanzado de OpenAI. Excelente para tareas complejas y precisión máxima.',
    'Rápido',
    'Premium',
    true,
    'openai'
  ),
  (
    'GPT-4',
    'gpt-4',
    'Modelo base de OpenAI. Gran capacidad de razonamiento y precisión.',
    'Moderado',
    'Premium',
    true,
    'openai'
  ),
  (
    'GPT-3.5 Turbo',
    'gpt-3.5-turbo',
    'Modelo rápido y económico de OpenAI. Buena relación costo-efectividad.',
    'Muy Rápido',
    'Económico',
    true,
    'openai'
  );
