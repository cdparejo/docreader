-- Agregar tabla de roles de usuario
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' o 'admin'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- RLS Policies para user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio rol
CREATE POLICY "Users can view their own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Solo admins pueden actualizar roles
CREATE POLICY "Only admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Actualizar RLS en tabla de prompts para solo permitir admin modification
DROP POLICY IF EXISTS "Prompts are updatable by authenticated users" ON prompts;

CREATE POLICY "Only admins can update prompts"
  ON prompts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Los usuarios autenticados pueden ver prompts pero no modificarlos
DROP POLICY IF EXISTS "Prompts are viewable by authenticated users" ON prompts;

CREATE POLICY "All authenticated users can view prompts"
  ON prompts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Función auxiliar para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = user_id AND user_roles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Insertar usuario demo como admin (cambiar el email por uno real)
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'admin@example.com';
