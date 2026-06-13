-- Agregar modelo Gemini 2.5 Flash a tabla models
INSERT INTO models (name, model_id, description, speed, cost, is_active) VALUES
  (
    'Gemini 2.5 Flash',
    'gemini-2.5-flash',
    'Modelo rápido y económico de Google. Excelente para tareas simples y respuestas rápidas.',
    'Muy Rápido',
    'Más económico',
    true
  );
