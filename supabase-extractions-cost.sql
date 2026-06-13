-- Agregar columnas de tokens y costo a tabla extractions para MVP 3
ALTER TABLE extractions
ADD COLUMN input_tokens integer DEFAULT 0,
ADD COLUMN output_tokens integer DEFAULT 0,
ADD COLUMN cost_usd numeric(10, 6) DEFAULT 0.0,
ADD COLUMN model_used text;

-- Crear índices para consultas de costos
CREATE INDEX idx_extractions_cost ON extractions(cost_usd DESC);
CREATE INDEX idx_extractions_model ON extractions(model_used);

-- Crear índice combinado para análisis por usuario
CREATE INDEX idx_extractions_user_cost_date ON extractions(user_id, created_at DESC, cost_usd);
