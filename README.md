# DocReader 📄

**Plataforma de extracción de información de documentos PDF con IA**

DocReader es una aplicación Next.js que permite extraer información estructurada de documentos PDF utilizando Claude AI. Soporta plantillas predefinidas, modo personalizado y selección de modelos de IA.

## 🚀 Características Principales

- **Autenticación**: Login con Supabase Auth
- **Drag & Drop PDF**: Carga fácil de archivos PDF
- **6 Plantillas Predefinidas**: General, Factura, Contrato, Liquidación, Impositivo, Informe
- **Modo Personalizado**: Define tus propios campos a extraer
- **Selección de Modelos**: Elige entre Haiku 4.5 (rápido) o Sonnet 4.6 (preciso)
- **Historial de Extracciones**: Acceso a todas tus extracciones anteriores
- **Seguimiento de Costos**: Cálculo automático de costos basado en tokens reales (entrada/salida)
- **Dashboard de Costos**: Visualización de costos por extracción, usuario y tendencias
- **Almacenamiento en Supabase**: Datos seguros con RLS (Row Level Security)

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: API Routes (Next.js)
- **Base de Datos**: Supabase (PostgreSQL)
- **IA**: Anthropic Claude API
- **Autenticación**: Supabase Auth

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta Supabase
- API Key de Anthropic (con créditos)

## ⚙️ Instalación y Configuración

Ver: [SETUP.md](./SETUP.md)

## 📚 Documentación

- [SETUP.md](./SETUP.md) - Guía de instalación
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del proyecto
- [API.md](./API.md) - Documentación de endpoints
- [FEATURES.md](./FEATURES.md) - Descripción detallada de características
- [MVPS.md](./MVPS.md) - Bitácora de MVPs implementados y próximos

## 🔧 Desarrollo Local

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000)

## 🔐 Variables de Entorno

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
\`\`\`

## 📝 Licencia

Propiedad privada - Uso interno corporativo
