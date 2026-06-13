-- Tabla de auditoría para historial de cambios de prompts
CREATE TABLE prompt_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'updated', 'restored', 'created'
  old_prompt_text TEXT,
  new_prompt_text TEXT,
  old_description TEXT,
  new_description TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_prompt_audit_template ON prompt_audit(template_name);
CREATE INDEX idx_prompt_audit_changed_at ON prompt_audit(changed_at DESC);

-- Función para registrar cambios automáticamente
CREATE OR REPLACE FUNCTION log_prompt_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO prompt_audit (template_name, action, old_prompt_text, new_prompt_text, old_description, new_description, changed_by)
  VALUES (
    NEW.template_name,
    'updated',
    OLD.prompt_text,
    NEW.prompt_text,
    OLD.description,
    NEW.description,
    NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auditoría automática
CREATE TRIGGER prompt_update_trigger
AFTER UPDATE ON prompts
FOR EACH ROW
EXECUTE FUNCTION log_prompt_change();

-- RLS Policies
ALTER TABLE prompt_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs are viewable by authenticated users"
  ON prompt_audit FOR SELECT
  USING (auth.role() = 'authenticated');
