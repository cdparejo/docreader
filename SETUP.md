# ⚙️ Guía de Instalación y Configuración

## 1. Requisitos Previos

- **Node.js 18+** - Descarga desde [nodejs.org](https://nodejs.org)
- **Git** - Control de versiones
- **Cuenta Supabase** - [supabase.com](https://supabase.com)
- **Cuenta Anthropic** - [console.anthropic.com](https://console.anthropic.com)

## 2. Clonar el Repositorio

\`\`\`bash
cd C:\DATOS\Cristian\Desarrollo\info_extract
git clone <repo-url>
cd docreader
\`\`\`

## 3. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

Paquetes principales instalados:
- `next@16.2.9` - Framework web
- `@supabase/supabase-js` - Cliente Supabase
- `@supabase/ssr` - SSR support
- `@anthropic-ai/sdk` - AI API
- `tailwindcss` - Estilos CSS
- `typescript` - Type safety

## 4. Configurar Supabase

### 4.1 Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "New Project"
3. Rellena:
   - **Name**: `docreader`
   - **Database Password**: Contraseña segura
   - **Region**: La más cercana a ti
4. Espera 2-3 minutos a que se cree

### 4.2 Crear Schema de Base de Datos

1. Ve a **SQL Editor** en tu proyecto Supabase
2. Haz clic en **"New query"**
3. Copia el contenido de `supabase-schema.sql`
4. Pégalo en el editor
5. Haz clic en **"Run"**

### 4.3 Crear Tabla de Modelos

1. Repite el paso anterior con el contenido de `supabase-models.sql`
2. Haz clic en **"Run"**

### 4.4 Crear Usuario de Prueba

1. Ve a **Authentication → Users**
2. Haz clic en **"Add user"**
3. Email: `docreader@test.com`
4. Password: `123456`
5. Haz clic en **"Create user"**

### 4.5 Obtener Credenciales

1. Ve a **Settings → API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 5. Configurar Anthropic API

### 5.1 Obtener API Key

1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea cuenta o inicia sesión
3. Ve a **API Keys**
4. Haz clic en **"Create Key"**
5. Copia la key (comienza con `sk-ant-`)

### 5.2 Agregar Créditos

1. Ve a **Plans & Billing**
2. Agrega método de pago (tarjeta de crédito)
3. Compra créditos (mínimo $5 USD)
4. Espera 5-10 minutos a que se procesen

## 6. Configurar Variables de Entorno

### 6.1 Crear archivo `.env.local`

En la raíz del proyecto (`docreader/.env.local`):

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
\`\`\`

Reemplaza los valores con los que obtuviste arriba.

### 6.2 Verificar Variables

\`\`\`bash
cat .env.local
\`\`\`

Debería mostrar las 3 variables configuradas.

## 7. Iniciar Servidor de Desarrollo

\`\`\`bash
npm run dev
\`\`\`

Salida esperada:
\`\`\`
▲ Next.js 16.2.9
- Local:         http://localhost:3000
✓ Ready in 500ms
\`\`\`

## 8. Acceder a la Aplicación

1. Abre [http://localhost:3000](http://localhost:3000)
2. Deberías ver la página de login
3. Inicia sesión con:
   - Email: `docreader@test.com`
   - Password: `123456`

## 9. Probar Funcionalidad

### 9.1 Subir un PDF

1. Haz clic en zona de drag & drop
2. Selecciona un archivo PDF
3. Espera a que se cargue

### 9.2 Elegir Plantilla

1. En "Tipo de Extracción", elige "Facturas" (por ejemplo)
2. En "Modelo de IA", elige "Sonnet 4.6" (más preciso)

### 9.3 Hacer Extracción

1. Haz clic en "Extraer Información"
2. Espera a que procese (puede tomar 10-20 segundos)
3. Verás el resultado en verde abajo

### 9.4 Ver Historial

1. Haz clic en "Historial" (arriba)
2. Deberías ver la extracción que acabas de hacer

## 10. Troubleshooting

### Error: "Your credit balance is too low"

**Solución**: Agrega créditos a tu cuenta Anthropic (paso 5.2)

### Error: "Unauthorized"

**Solución**: Verifica que estés logueado. Si no, el middleware te redirige a login.

### Error: "Missing required fields"

**Solución**: Asegúrate de haber:
1. Seleccionado un PDF
2. Elegido un modelo
3. Completado todos los campos requeridos

### Página en blanco después de login

**Solución**: Espera 30 segundos a que cargue. Si persiste, abre las DevTools (F12) y revisa la consola de errores.

## 11. Compilar para Producción

\`\`\`bash
npm run build
npm run start
\`\`\`

## 12. Estructura de Carpetas

\`\`\`
docreader/
├── src/
│   ├── app/
│   │   ├── api/          # API Routes
│   │   ├── login/        # Página login
│   │   ├── historial/    # Historial
│   │   └── page.tsx      # Inicio
│   ├── components/       # Componentes React
│   ├── lib/             # Utilidades
│   └── middleware.ts    # Auth
├── public/              # Archivos estáticos
├── .env.local          # Variables secretas
├── README.md           # Documentación
└── package.json        # Dependencias
\`\`\`

## 13. Comandos Útiles

\`\`\`bash
# Desarrollo
npm run dev

# Compilar
npm run build

# Ejecutar compilación
npm run start

# Análisis de tipos
npm run typecheck

# Linter
npm run lint
\`\`\`

## 14. Soporte

Para reportar problemas:
- Revisa [MVPS.md](./MVPS.md) para roadmap
- Consulta [ARCHITECTURE.md](./ARCHITECTURE.md) para entender el código

