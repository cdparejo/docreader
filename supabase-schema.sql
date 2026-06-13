-- Crear tabla extractions
CREATE TABLE extractions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  template text NOT NULL,
  custom_fields jsonb,
  result text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar performance
CREATE INDEX idx_extractions_user_id ON extractions(user_id);
CREATE INDEX idx_extractions_created_at ON extractions(created_at DESC);

-- Habilitar RLS en tabla extractions
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;

-- Política de lectura: usuarios solo leen sus propias extracciones
CREATE POLICY "Users can read own extractions"
  ON extractions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política de inserción: usuarios solo insertan para sí mismos
CREATE POLICY "Users can insert own extractions"
  ON extractions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política de actualización: usuarios pueden actualizar sus propias extracciones
CREATE POLICY "Users can update own extractions"
  ON extractions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Crear bucket de almacenamiento "documents"
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Políticas de RLS para el bucket documents
CREATE POLICY "Users can upload to their own folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
