-- Crear tabla models
CREATE TABLE models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  model_id text NOT NULL UNIQUE,
  description text,
  speed text,
  cost text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insertar modelos disponibles
INSERT INTO models (name, model_id, description, speed, cost, is_active) VALUES
  (
    'Haiku 4.5',
    'claude-haiku-4-5-20251001',
    'Modelo rápido y económico. Ideal para tareas simples y respuestas rápidas.',
    'Muy Rápido',
    'Más económico',
    true
  ),
  (
    'Sonnet 4.6',
    'claude-sonnet-4-6',
    'Modelo balanceado. Excelente relación velocidad-precisión para la mayoría de tareas.',
    'Rápido',
    'Moderado',
    true
  );

-- Nota: No se necesita RLS para esta tabla porque los modelos son públicos
