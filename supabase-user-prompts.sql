-- Crear tabla user_prompts
CREATE TABLE user_prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  prompt text NOT NULL,
  template_type text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),

  CONSTRAINT valid_template_type CHECK (template_type IN ('general', 'factura', 'contrato', 'liquidacion', 'impuesto', 'informe', 'custom'))
);

-- Crear índices
CREATE INDEX idx_user_prompts_user_id ON user_prompts(user_id);
CREATE INDEX idx_user_prompts_template_type ON user_prompts(template_type);
CREATE UNIQUE INDEX idx_unique_default_per_type ON user_prompts(user_id, template_type) WHERE is_default = true;

-- Habilitar RLS
ALTER TABLE user_prompts ENABLE ROW LEVEL SECURITY;

-- Política de lectura
CREATE POLICY "Users can read own prompts"
  ON user_prompts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política de inserción
CREATE POLICY "Users can insert own prompts"
  ON user_prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política de actualización
CREATE POLICY "Users can update own prompts"
  ON user_prompts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política de eliminación
CREATE POLICY "Users can delete own prompts"
  ON user_prompts
  FOR DELETE
  USING (auth.uid() = user_id);
