# ✨ Características de DocReader

## 1. Autenticación y Seguridad

### Login Seguro
- Email + Contraseña
- Integración con Supabase Auth
- Tokens JWT en cookies
- Middleware de protección de rutas

### Protección de Datos
- Row Level Security (RLS) en Supabase
- Usuarios solo ven sus propios datos
- Storage privado para PDFs
- API keys nunca expuestas al cliente

---

## 2. Extracción de PDF

### Drag & Drop
- Carga intuitiva de archivos
- Feedback visual en tiempo real
- Validación de tipo PDF
- Conversión automática a base64

### Procesamiento con IA
- Integración con Claude API (Anthropic)
- Soporte para Haiku 4.5 y Sonnet 4.6
- Procesamiento servidor-side (seguro)
- Tiempo de respuesta: 5-30 segundos

---

## 3. Plantillas Predefinidas

### 6 Plantillas Disponibles

#### 1. **General**
Extrae información general de cualquier documento:
- Título o asunto
- Fecha
- Partes involucradas
- Montos
- Conceptos clave

#### 2. **Factura**
Información específica para facturas:
- Número de factura
- Tipo (A, B, C)
- CUIT emisor y receptor
- Neto, IVA, percepciones
- Total y CAE
- Condición de pago

#### 3. **Contrato**
Datos de documentos contractuales:
- Partes (nombre, DNI/CUIT)
- Objeto del contrato
- Vigencia (inicio y fin)
- Monto
- Cláusulas clave
- Penalidades y rescisión
- Firmas y fechas

#### 4. **Liquidación**
Información de liquidaciones de sueldo:
- Período
- Datos del empleado (nombre, CUIL)
- Haberes brutos
- Descuentos (impuestos, aportes)
- Neto a recibir
- Aportes patronales

#### 5. **Impositivo**
Documentos fiscales y tributarios:
- Tipo de tributo (IVA, Ganancias, etc.)
- Período fiscal
- CUIT del contribuyente
- Base imponible
- Alícuota aplicada
- Monto determinado vs ingresado
- Saldo a favor/en contra
- Formulario AFIP

#### 6. **Informe**
Información de reportes e informes:
- Título
- Período cubierto
- Autor/Área responsable
- Destinatario
- Conclusiones
- Métricas clave
- Recomendaciones
- Resumen ejecutivo

---

## 4. Modo Personalizado

### Campos Dinámicos
- Define tus propios campos a extraer
- Interfaz de tags (agregar/eliminar)
- Prompts generados automáticamente
- Flexible para cualquier tipo de documento

**Ejemplo**:
```
Campos: ["Nombre del cliente", "Monto total", "Fecha de pago"]
↓
Prompt: "Extrae los siguientes campos..."
↓
Resultado: Cliente: Juan Pérez / Monto: $5000 / Fecha: 30/06/2026
```

---

## 5. Selección de Modelos

### Dos Modelos Disponibles

#### **Haiku 4.5** 🚀
- **Velocidad**: Muy Rápido
- **Precisión**: Buena
- **Costo**: Más económico
- **Tiempo**: 5-10 segundos
- **Ideal para**: Documentos simples, alta urgencia

#### **Sonnet 4.6** 🎯
- **Velocidad**: Rápido
- **Precisión**: Excelente
- **Costo**: Moderado
- **Tiempo**: 10-20 segundos
- **Ideal para**: Documentos complejos, máxima precisión

### Selector Intuitivo
- Radio buttons con descripciones
- Muestra velocidad y costo de cada modelo
- Selección persiste en la sesión
- Dinámicamente se actualiza de la BD

---

## 6. Historial de Extracciones

### Página de Listado
- Tabla con todas tus extracciones
- Filtro por usuario (RLS automático)
- Columnas: Archivo, Plantilla, Fecha
- Orden cronológico descendente
- Botón "Ver Resultado"

### Página de Detalle
- Información completa de la extracción
- Nombre del archivo
- Plantilla usada
- Fecha exacta
- Resultado completo con scroll
- Botón copiar al portapapeles
- Navegación atrás al historial

### Accesibilidad
- Links desde navbar
- URLs amigables: `/historial`, `/historial/[id]`
- Protegidas con middleware

---

## 7. Interfaz de Usuario

### Diseño
- Clean y moderno con Tailwind CSS
- Responsive (mobile, tablet, desktop)
- Modo claro (light mode)
- NavBar con opciones principales

### Componentes

#### **NavBar**
- Logo "DocReader"
- Links: Historial, Cerrar Sesión
- Visible en todas las páginas autenticadas

#### **Página Principal**
1. **Sección PDF**: Drag & Drop
2. **Sección Plantillas**: Grid de 6 templates
3. **Sección Modelo**: Radio buttons Haiku/Sonnet
4. **Botón Extraer**: CTA principal
5. **Panel Resultado**: Resultado en verde con copia

#### **Página Login**
- Formulario centrado
- Campos: Email, Contraseña
- Validación de entrada
- Manejo de errores visible

#### **Página Historial**
- Tabla responsive
- Información clara
- Navegación fluida

---

## 8. Almacenamiento

### Supabase Storage
- Bucket `documents` privado
- Estructura: `{user_id}/{uuid}-{filename}`
- RLS: Solo el dueño puede acceder
- Almacenamiento ilimitado (plan Supabase)

### Base de Datos
- Tabla `extractions` con RLS
- Información vinculada a usuario
- Búsquedas rápidas con índices
- Integridad referencial garantizada

---

## 9. Rendimiento

### Optimizaciones
- Conversión base64 en cliente (no congestiona servidor)
- Caché de modelos en memoria
- Middleware eficiente
- API routes sin extra middleware

### Tiempos
- Carga inicial: < 2 segundos
- Modelo drop-down: < 1 segundo
- Procesamiento PDF: 5-30 segundos (según modelo)
- Mostrar resultado: < 1 segundo

---

## 10. Manejo de Errores

### Validaciones
- PDF obligatorio
- Modelo obligatorio
- Información visible al usuario
- Recuperación clara de errores

### Mensajes
- "Por favor, selecciona un PDF"
- "Error en la extracción" (con detalles en consola)
- "No se encontró la extracción" (en detalle)
- Colores: Rojo para errores, Verde para éxito

---

## 11. Seguridad Adicional

### No Exponer Datos
- API keys solo en servidor
- User IDs del JWT
- Validación en cada request
- Logs de errores seguros

### Validación de Input
- Formato base64 verificado
- Tamaño de archivo validado
- Caracteres especiales escapados
- SQL injection prevenido con ORM

---

## 12. Roadmap (Próximas Características)

### MVP 2 - Prompts Personalizados
- Tabla `user_prompts` en BD
- CRUD de prompts por usuario
- UI: "Mis Prompts" section
- Copiar/pegar prompts completos
- RLS para privacidad

### MVP 3 - Control de Costos
- Columna `cost_usd` en extracciones
- Tabla `pricing` con costos
- Dashboard con métricas
- Gráficas de gasto
- Alertas de presupuesto
- Panel admin (opcional)

### MVP 4+ - Futuro
- Más modelos (GPT-4, Gemini)
- Webhooks para notificaciones
- API pública
- Integración con Slack/Teams
- Análisis de tendencias

---

## 13. Casos de Uso

### Empresa de Contabilidad
- Procesar facturas automáticamente
- Extraer datos para auditoría
- Mantener historial con timestamps
- Controlar costos por cliente

### Recursos Humanos
- Procesar liquidaciones
- Extraer datos de contratos
- Buscar información rápidamente
- Compilar documentación

### Sector Legal
- Analizar contratos
- Extraer cláusulas clave
- Mantener repositorio
- Audit trail automático

### Sector Financiero
- Procesar impuestos y AFIP
- Extraer datos de bancos
- Validar documentación
- Mantener registros cumplimiento

