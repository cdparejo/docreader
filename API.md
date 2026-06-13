# 🔌 Documentación de API

## Endpoints Disponibles

### 1. POST /api/extract
**Procesar un PDF y extraer información**

#### Autenticación
- ✅ Requerida (Supabase Auth JWT)
- Token en Cookie (automático)

#### Request Body
```json
{
  "fileBase64": "JVBERi0xLjQKJeLj...",
  "fileName": "factura_2026.pdf",
  "template": "factura",
  "customFields": [],
  "prompt": "Extrae de esta factura...",
  "model": "claude-sonnet-4-6"
}
```

#### Parámetros
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `fileBase64` | string | ✅ | PDF codificado en base64 |
| `fileName` | string | ✅ | Nombre original del archivo |
| `template` | string | ✅ | Tipo de extracción: `general`, `factura`, `contrato`, `liquidacion`, `impuesto`, `informe` |
| `customFields` | array | ✅ | Array de campos personalizados (vacío si usa template) |
| `prompt` | string | ✅ | Prompt generado dinámicamente |
| `model` | string | ✅ | Modelo a usar: `claude-haiku-4-5-20251001` o `claude-sonnet-4-6` |

#### Response - Éxito (200)
```json
{
  "result": "FACTURA NÚMERO: 001-123456\nFECHA: 2026-06-11...",
  "extractionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Response - Error (400)
```json
{
  "error": "Missing required fields"
}
```

#### Response - Error (401)
```json
{
  "error": "Unauthorized"
}
```

#### Response - Error (500)
```json
{
  "error": "Internal server error"
}
```

#### Ejemplos de Uso

**JavaScript/Fetch**:
```javascript
const response = await fetch('/api/extract', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileBase64: base64Data,
    fileName: 'documento.pdf',
    template: 'factura',
    customFields: [],
    prompt: 'Extrae de esta factura...',
    model: 'claude-sonnet-4-6'
  })
});

const { result, extractionId } = await response.json();
```

**cURL**:
```bash
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{
    "fileBase64": "...",
    "fileName": "factura.pdf",
    "template": "factura",
    "customFields": [],
    "prompt": "Extrae...",
    "model": "claude-sonnet-4-6"
  }'
```

---

### 2. GET /api/models
**Obtener lista de modelos disponibles**

#### Autenticación
- ❌ No requerida (datos públicos)

#### Query Parameters
Ninguno

#### Response - Éxito (200)
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Haiku 4.5",
    "model_id": "claude-haiku-4-5-20251001",
    "description": "Modelo rápido y económico. Ideal para tareas simples y respuestas rápidas.",
    "speed": "Muy Rápido",
    "cost": "Más económico",
    "is_active": true,
    "created_at": "2026-06-12T03:30:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Sonnet 4.6",
    "model_id": "claude-sonnet-4-6",
    "description": "Modelo balanceado. Excelente relación velocidad-precisión para la mayoría de tareas.",
    "speed": "Rápido",
    "cost": "Moderado",
    "is_active": true,
    "created_at": "2026-06-12T03:30:00Z"
  }
]
```

#### Response - Error (500)
```json
{
  "error": "Failed to fetch models"
}
```

#### Ejemplos de Uso

**JavaScript/Fetch**:
```javascript
const response = await fetch('/api/models');
const models = await response.json();

models.forEach(model => {
  console.log(`${model.name} (${model.speed}, ${model.cost})`);
});
```

**React Hook**:
```javascript
const [models, setModels] = useState([]);

useEffect(() => {
  fetch('/api/models')
    .then(r => r.json())
    .then(setModels)
    .catch(console.error);
}, []);
```

---

## Códigos de Error

| Código | Mensaje | Causa |
|--------|---------|-------|
| 400 | Missing required fields | Faltan parámetros en request |
| 401 | Unauthorized | Usuario no autenticado |
| 500 | Failed to upload file | Error en Supabase Storage |
| 500 | Failed to save extraction | Error en BD |
| 500 | Internal server error | Error no especificado |

---

## Rate Limiting

Actualmente **sin límites de rate**, pero se recomienda:
- Máximo 1 extracción por usuario cada 5 segundos
- Máximo 100 extracciones por usuario por día

---

## Autenticación

Las APIs protegidas requieren autenticación con Supabase JWT:

1. JWT viene automáticamente en Cookie (manejo de Supabase)
2. Middleware lo valida en cada request
3. User ID se extrae del token para vincular datos

---

## Pruebas

### Endpoint de Extracción

**Requerimientos**:
- Archivo PDF válido (no vacío)
- API Key de Anthropic con créditos
- Usuario autenticado

**Tiempo de respuesta**:
- Haiku 4.5: 5-10 segundos
- Sonnet 4.6: 10-20 segundos

### Endpoint de Modelos

**Tiempo de respuesta**: < 1 segundo

---

## Cambios Futuros

Próximos MVPs agregarán:
- `GET /api/user-prompts` - Obtener prompts personalizados
- `POST /api/user-prompts` - Crear prompt personalizado
- `DELETE /api/user-prompts/[id]` - Eliminar prompt
- `GET /api/user-stats` - Estadísticas y costos por usuario

