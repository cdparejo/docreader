-- Agregar columna provider a tabla models para MVP 4
ALTER TABLE models
ADD COLUMN provider text DEFAULT 'anthropic';

-- Actualizar modelos existentes como Anthropic
UPDATE models SET provider = 'anthropic' WHERE model_id IN ('claude-haiku-4-5-20251001', 'claude-sonnet-4-6');

-- Crear índice para consultas por proveedor
CREATE INDEX idx_models_provider ON models(provider);

-- Hacer la columna NOT NULL después de establecer valores
ALTER TABLE models
ALTER COLUMN provider SET NOT NULL;
