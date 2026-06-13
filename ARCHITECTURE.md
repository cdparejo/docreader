# 🏗️ Arquitectura de DocReader

## 📐 Diagrama General

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                        │
│  Next.js Client Components (React) + Tailwind CSS          │
├─────────────────────────────────────────────────────────────┤
│                 NEXT.JS SERVER (SSR)                         │
│  Server Components + Middleware + API Routes               │
├─────────────────────────────────────────────────────────────┤
│                  EXTERNAL SERVICES                           │
│  Supabase (Auth, DB, Storage) + Anthropic Claude API       │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 🔄 Flujo de Datos

### 1. Autenticación

\`\`\`
Usuario → /login (POST) → Supabase Auth → JWT Token → Cookie
                            ↓
                     Middleware valida
                            ↓
                   Redirige a /
\`\`\`

### 2. Extracción de PDF

\`\`\`
Usuario sube PDF
     ↓
FileReader → Base64
     ↓
POST /api/extract
     ↓
Supabase: obtener user_id
     ↓
Anthropic: procesa PDF con Claude
     ↓
Guarda en Supabase:
  - documents bucket (PDF)
  - extractions tabla (resultado)
     ↓
Retorna resultado al cliente
\`\`\`

## 📁 Estructura de Archivos

### Frontend (Cliente)

```
src/
├── app/
│   ├── page.tsx                    # Página principal (extracción)
│   ├── login/
│   │   └── page.tsx               # Formulario login
│   ├── historial/
│   │   ├── page.tsx               # Listado extracciones
│   │   └── [id]/
│   │       └── page.tsx           # Detalle extracción
│   ├── api/
│   │   ├── extract/
│   │   │   └── route.ts           # POST extracción
│   │   └── models/
│   │       └── route.ts           # GET modelos
│   └── layout.tsx                 # Layout global
│
├── components/
│   ├── pdf-upload.tsx             # Drag & drop PDF
│   ├── template-selector.tsx      # Selector plantillas (6)
│   ├── custom-fields.tsx          # Editor campos personalizados
│   ├── model-selector.tsx         # Selector modelos (Haiku/Sonnet)
│   └── navbar.tsx                 # NavBar con logout
│
├── lib/
│   ├── prompts.ts                 # Lógica de prompts por template
│   └── supabase/
│       ├── client.ts              # Cliente browser (createBrowserClient)
│       ├── server.ts              # Cliente servidor (createServerClient)
│       └── middleware.ts          # Lógica autenticación middleware
│
└── middleware.ts                  # Middleware protección rutas
```

### Backend (Servidor)

#### API Routes

| Ruta | Método | Descripción | Auth |
|------|--------|-------------|------|
| `/api/extract` | POST | Procesar PDF con Claude | ✅ |
| `/api/models` | GET | Obtener modelos disponibles | ❌ |

#### Lógica de Negocios

- **Extract Route**: Recibe PDF base64, llama a Claude API, guarda en Supabase
- **Model Selector**: Componente React que carga modelos de API

## 🗄️ Base de Datos (Supabase)

### Tablas

#### 1. `auth.users` (Supabase Auth)
- Manejada automáticamente por Supabase
- Contiene email, contraseña, sesiones

#### 2. `extractions`
```sql
id (UUID) PK
user_id (UUID) FK auth.users
file_name (text)
file_path (text)
template (text) -- general, factura, contrato, etc
custom_fields (jsonb) -- array de campos si es personalizado
result (text) -- resultado de extracción
created_at (timestamptz)

RLS: Usuarios solo ven/editan sus propias filas
```

#### 3. `models`
```sql
id (UUID) PK
name (text UNIQUE) -- "Haiku 4.5", "Sonnet 4.6"
model_id (text UNIQUE) -- "claude-haiku-4-5-20251001"
description (text)
speed (text) -- "Muy Rápido", "Rápido"
cost (text) -- "Más económico", "Moderado"
is_active (boolean)
created_at (timestamptz)

RLS: Sin RLS (datos públicos)
```

### Storage

#### Bucket: `documents`
- Privado
- Estructura: `{user_id}/{uuid}-{filename}`
- RLS: Solo el dueño puede leer/escribir/eliminar

## 🔐 Seguridad

### Autenticación
- Supabase Auth con email/password
- Tokens JWT en cookies (automático)
- Middleware valida token en cada request

### Autorización
- RLS (Row Level Security) en tablas de datos
- Usuarios solo acceden a sus propias extracciones
- Storage privado con políticas RLS

### API Security
- API Keys de Anthropic nunca se exponen al cliente
- Solo se usan en servidor (`process.env`)
- User_id del JWT para vincular extracciones

## 🔌 Integraciones Externas

### Anthropic Claude API

**Endpoint**: `https://api.anthropic.com/v1/messages`

**Request**:
```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": [
        {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": "..."}},
        {"type": "text", "text": "prompt..."}
      ]
    }
  ]
}
```

**Response**:
```json
{
  "content": [{"type": "text", "text": "resultado..."}],
  "usage": {"input_tokens": 100, "output_tokens": 50}
}
```

### Supabase

**Servicios usados**:
- Authentication (email/password)
- PostgreSQL Database
- Storage (archivos PDF)
- RLS (políticas de seguridad)

## 📊 Flujo de Usuarios

### Usuario Nuevo
1. Crea cuenta en Supabase
2. Accede a login
3. Middleware verifica autenticación
4. Si válido → redirige a `/`
5. Si inválido → redirige a `/login`

### Hacer Extracción
1. Usuario sube PDF (drag & drop)
2. Elige plantilla o modo personalizado
3. Selecciona modelo (Haiku o Sonnet)
4. Hace clic en "Extraer"
5. Cliente convierte PDF a base64
6. POST a `/api/extract` con:
   - fileBase64
   - fileName
   - template
   - customFields (si aplica)
   - prompt (generado dinámicamente)
   - model (seleccionado)
7. Servidor:
   - Verifica autenticación
   - Llama a Claude API
   - Guarda PDF en Storage
   - Guarda resultado en BD
8. Cliente muestra resultado

### Ver Historial
1. Usuario hace clic en "Historial"
2. Servidor ejecuta SELECT en tabla `extractions` (RLS filtra por user_id)
3. Muestra tabla con listado
4. Al hacer clic en fila → detalle en `/historial/[id]`

## 🚀 Deployment

### Requisitos
- Node.js 18+
- PostgreSQL (Supabase)
- Variables de entorno

### Plataformas Recomendadas
- Vercel (optimizado para Next.js)
- AWS EC2 + RDS
- DigitalOcean App Platform

### Build
```bash
npm run build
npm run start
```

## 🔄 Ciclo de Vida de una Extracción

```
Recepción
  ↓
Validación (usuario, PDF, modelo)
  ↓
Conversión a base64
  ↓
Llamada a Claude API
  ↓
Procesamiento (10-30 segundos)
  ↓
Upload PDF a Storage
  ↓
Guardado en extractions
  ↓
Respuesta al cliente
  ↓
Visualización en UI
  ↓
Accesible en /historial
```

## 📈 Escalabilidad

### Horizontal
- Desplegar múltiples instancias de Next.js detrás de load balancer
- Supabase maneja la BD automáticamente

### Vertical
- Aumentar CPU/RAM del servidor
- Caché en cliente para resultados anteriores

### Optimizaciones Futuras
- Caché de PDFs ya procesados
- Queue de extracciones (para picos)
- Compresión de almacenamiento
- Índices en BD para búsquedas rápidas

