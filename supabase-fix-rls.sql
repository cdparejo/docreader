-- Arreglar RLS policies en user_roles para que admins vean todos los usuarios

-- Primero, eliminar las políticas viejas
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can update any user role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Política 1: Cualquiera puede ver su propio rol
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Política 2: Admins pueden ver todos los roles
CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política 3: Los admins pueden crear/actualizar roles
CREATE POLICY "Admins can manage roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política 4: El sistema (service role) puede insertar nuevos roles
-- (sin esta, los nuevos usuarios no se pueden crear desde el API)
CREATE POLICY "Service role can insert roles"
  ON user_roles FOR INSERT
  WITH CHECK (true);
