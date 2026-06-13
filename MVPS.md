# 📋 Bitácora de MVPs - DocReader

## ✅ MVP 1: COMPLETADO (2026-06-12)

**Scaffolding Inicial y Funcionalidad Base**

### Características Implementadas:
- ✅ Estructura Next.js 14 con TypeScript
- ✅ Autenticación con Supabase (email/password)
- ✅ Middleware de protección de rutas
- ✅ Drag & Drop para subir PDFs
- ✅ 6 Plantillas de extracción predefinidas
  - General: Extrae título, fecha, partes, montos, conceptos clave
  - Factura: Número, tipo, CUIT, IVA, total, CAE, condición pago
  - Contrato: Partes, objeto, vigencia, cláusulas, penalidades, rescisión
  - Liquidación: Período, empleado, CUIL, haberes, descuentos, neto
  - Impositivo: Tipo tributo, CUIT, base imponible, alícuota, saldo
  - Informe: Título, período, conclusiones, métricas, recomendaciones
- ✅ Modo Personalizado: Campos dinámicos (tags)
- ✅ API Route de extracción con Claude Sonnet 4.6
- ✅ Almacenamiento de PDFs en Supabase Storage
- ✅ Guardado de extracciones en Supabase
- ✅ Página de Historial con listado de extracciones
- ✅ Página de Detalle de extracción
- ✅ RLS (Row Level Security) en Supabase
- ✅ Interfaz responsiva con Tailwind CSS

### Archivos Creados:
- `src/app/page.tsx` - Página principal
- `src/app/login/page.tsx` - Login
- `src/app/historial/page.tsx` - Historial
- `src/app/historial/[id]/page.tsx` - Detalle extracción
- `src/app/api/extract/route.ts` - API extracción
- `src/components/pdf-upload.tsx` - Upload drag & drop
- `src/components/template-selector.tsx` - Selector plantillas
- `src/components/custom-fields.tsx` - Editor campos personalizados
- `src/components/navbar.tsx` - NavBar
- `src/lib/prompts.ts` - Lógica prompts
- `src/lib/supabase/client.ts` - Cliente browser
- `src/lib/supabase/server.ts` - Cliente servidor
- `src/middleware.ts` - Autenticación

### Base de Datos:
- Tabla `extractions` con RLS
- Bucket Storage `documents` con políticas RLS

---

## 🚀 MVP 1.1: COMPLETADO (2026-06-12)

**Selección Dinámica de Modelos**

### Características Implementadas:
- ✅ Tabla `models` en Supabase
- ✅ Modelos disponibles:
  - Haiku 4.5 (rápido, económico)
  - Sonnet 4.6 (balanceado, preciso)
- ✅ API Route `GET /api/models`
- ✅ Componente `ModelSelector` con radio buttons
- ✅ UI muestra velocidad y costo de cada modelo
- ✅ API extracción usa modelo dinámicamente
- ✅ Selección persistente en la interfaz

### Archivos Creados:
- `src/app/api/models/route.ts` - API modelos
- `src/components/model-selector.tsx` - Selector modelos
- `supabase-models.sql` - Schema tabla modelos

### Base de Datos:
- Tabla `models` (sin RLS, información pública)

---

## ✅ MVP 2: COMPLETADO (2026-06-12)

**Prompts Dinámicos Personalizados por Usuario**

### Características Implementadas:
- ✅ Tabla `user_prompts` en Supabase con RLS
  - `id` (UUID)
  - `user_id` (UUID FK auth.users)
  - `name` (texto) - nombre descriptivo
  - `prompt` (texto largo) - prompt completo
  - `template_type` (texto)
  - `created_at` (timestamptz)
- ✅ API Route `GET /api/user-prompts` - obtener prompts del usuario
- ✅ API Route `POST /api/user-prompts` - guardar nuevo prompt
- ✅ API Route `DELETE /api/user-prompts/[id]` - eliminar prompt
- ✅ Componente PromptManager para gestionar prompts guardados
- ✅ UI: Tab "Mis Prompts" junto a "Plantillas" y "Personalizada"
- ✅ Textarea para pegar prompts completos
- ✅ Listado y selector de prompts guardados
- ✅ Botón eliminar con confirmación
- ✅ RLS en tabla `user_prompts` (usuarios solo acceden sus propios prompts)

### Archivos Creados/Modificados:
- `supabase-user-prompts.sql` - Schema tabla user_prompts
- `src/app/api/user-prompts/route.ts` - API GET/POST
- `src/app/api/user-prompts/[id]/delete.ts` - API DELETE
- `src/components/prompt-input.tsx` - Input con manager integrado
- `src/components/prompt-manager.tsx` - Componente CRUD

### Base de Datos:
- Tabla `user_prompts` con RLS

---

## ✅ MVP 3: COMPLETADO (2026-06-12)

**Cálculo y Control de Costos**

### Características Implementadas:
- ✅ Columnas `cost_usd`, `input_tokens`, `output_tokens`, `model_used` en tabla `extractions`
- ✅ Cálculo dinámico de costos basado en tokens reales (sin tabla pricing estática)
- ✅ Precios por modelo en `src/lib/pricing.ts`:
  - Haiku 4.5: $0.80/1M entrada, $4.00/1M salida
  - Sonnet 4.6: $3.00/1M entrada, $15.00/1M salida
- ✅ Captura de `usage.input_tokens` y `usage.output_tokens` de Claude API
- ✅ Guardado de costo y tokens en cada extracción
- ✅ Componente `CostInfo` que muestra costos en tiempo real
- ✅ API Route `GET /api/extractions` - obtener extracciones con costos
- ✅ Dashboard de costos en ruta `/costs`
- ✅ Componente `CostsHistory` con:
  - Tarjetas de estadísticas (costo total, extracciones, tokens)
  - Tabla histórica de extracciones con desglose de costos
  - Ordenamiento por fecha descendente
- ✅ Enlace "Costos" en Navbar
- ✅ Información de costos visible después de cada extracción

### Archivos Creados/Modificados:
- `supabase-extractions-cost.sql` - Migración de BD
- `src/lib/pricing.ts` - Lógica de cálculo de costos
- `src/app/api/extract/route.ts` - Captura y cálculo de costos
- `src/app/api/extractions/route.ts` - API para obtener extracciones
- `src/components/cost-info.tsx` - Componente de información de costos
- `src/components/costs-history.tsx` - Dashboard de costos históricos
- `src/app/costs/page.tsx` - Página del dashboard
- `src/components/navbar.tsx` - Agregar enlace a costos
- `src/app/page.tsx` - Integrar componente CostInfo en resultados

### Base de Datos:
- Agregar columnas a tabla `extractions` (cost_usd, input_tokens, output_tokens, model_used)
- Índices para optimizar consultas de costos

---

## 📊 Resumen

| MVP | Estado | Fecha | Características |
|-----|--------|-------|-----------------|
| MVP 1 | ✅ Completado | 2026-06-12 | Extracción PDF, 6 plantillas, historial, auth |
| MVP 1.1 | ✅ Completado | 2026-06-12 | Selección dinámica de modelos (Haiku, Sonnet) |
| MVP 2 | ✅ Completado | 2026-06-12 | Prompts personalizados por usuario con CRUD |
| MVP 3 | ✅ Completado | 2026-06-12 | Cálculo de costos basado en tokens reales, Dashboard |

---

## 🔄 MVP 4: IN PROGRESS (2026-06-12)

**Multi-Provider AI Support - OpenAI Integration**

### Características Implementadas:
- ✅ Columna `provider` agregada a tabla `models`
- ✅ Modelos OpenAI insertados en BD (GPT-4 Turbo, GPT-4, GPT-3.5 Turbo)
- ✅ Precios actualizados para OpenAI:
  - GPT-4 Turbo: $10/1M entrada, $30/1M salida
  - GPT-4: $30/1M entrada, $60/1M salida
  - GPT-3.5 Turbo: $0.50/1M entrada, $1.50/1M salida
- ✅ Arquitectura multi-proveedor:
  - `src/lib/providers/anthropic.ts` - Lógica Claude
  - `src/lib/providers/openai.ts` - Lógica GPT
- ✅ API de extracción refactorizada para detectar y enrutar por proveedor
- ✅ Validación de API keys por proveedor
- ✅ SDK OpenAI agregado a dependencias

### Archivos Creados/Modificados:
- `supabase-models-provider.sql` - Migración BD
- `supabase-openai-models.sql` - Inserción modelos OpenAI
- `src/lib/providers/anthropic.ts` - Nueva abstracción
- `src/lib/providers/openai.ts` - Nueva abstracción
- `src/lib/pricing.ts` - Actualizado con precios OpenAI
- `src/app/api/extract/route.ts` - Refactorizado
- `package.json` - Agregado `openai` SDK

### Próximos Pasos:
- [ ] Ejecutar migraciones en Supabase
- [ ] Probar con modelos GPT
- [ ] Refinar manejo de PDFs para OpenAI (actualmente es para prompts de texto)
- [ ] Agregar badge de proveedor en UI

### Nota Importante:
OpenAI no soporta nativamente la entrada de PDFs como Claude. Se necesita implementar conversión PDF a imágenes o usar una librería especializada para procesar PDFs antes de enviar a GPT.

---

## 🎯 Próximas Prioridades

1. **MVP 4** (Future): Integración con más modelos (GPT-4, Gemini)
2. **MVP 5** (Future): Webhooks para notificaciones
3. **MVP 6** (Future): API pública para integración

