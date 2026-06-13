-- Arreglar RLS policies - VERSION SIMPLIFICADA

-- Eliminar todas las políticas viejas
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update any user role" ON user_roles;

-- Política 1: PERMITIR TODO por ahora (luego mejoramos)
-- El service role (admin API) puede hacer todo
-- Los usuarios autenticados pueden ver/insertar/actualizar
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users"
  ON user_roles
  FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
