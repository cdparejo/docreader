export type Template = "general" | "factura" | "contrato" | "liquidacion" | "impuesto" | "informe";

const DEFAULT_PROMPTS: Record<Template, string> = {
  general: `Analiza el documento y extrae la información en las siguientes secciones:
- **Título o Asunto**: El título o asunto principal del documento
- **Fecha**: La fecha del documento (si aparece)
- **Partes Involucradas**: Las personas, empresas u organizaciones mencionadas
- **Montos**: Los montos monetarios o cantidades relevantes
- **Conceptos Clave**: Los puntos principales o conceptos relevantes en el documento

Formatea la respuesta de manera clara y estructurada.`,

  factura: `Extrae de esta factura la siguiente información:
- **Número de Factura**: El número de comprobante
- **Tipo**: Tipo de factura (A, B, C, etc.)
- **Fecha**: Fecha de emisión
- **Emisor**: Nombre y CUIT del emisor
- **Receptor**: Nombre y CUIT del receptor
- **Neto**: Monto neto (sin impuestos)
- **IVA**: Impuesto al Valor Agregado
- **Percepciones**: Montos retenidos o percibidos (si aplica)
- **Total**: Monto total
- **CAE y Fecha de CAE**: Código de Autorización Electrónico (si aplica)
- **Condición de Pago**: Términos de pago
- **Conceptos**: Lista de productos o servicios facturados

Formatea como JSON o texto estructurado.`,

  contrato: `Extrae del contrato la siguiente información:
- **Partes**: Nombre, DNI/CUIT de cada parte
- **Objeto**: ¿Qué es el contrato? (venta, servicio, alquiler, etc.)
- **Fecha de Inicio**: Cuándo comienza la vigencia
- **Fecha de Vencimiento**: Cuándo termina la vigencia
- **Monto**: Valor o precio del contrato
- **Cláusulas Clave**: Las 3-5 cláusulas más importantes
- **Penalidades**: Sanciones o multas por incumplimiento (si aplica)
- **Rescisión**: Cómo se puede rescindir el contrato
- **Firmas**: Quiénes firman y fechas de firma

Presenta la información de manera clara y legible.`,

  liquidacion: `Extrae de esta liquidación de sueldo:
- **Período**: Período de liquidación (mes y año)
- **Empleado**: Nombre del empleado
- **CUIL**: Código Único de Identificación Laboral
- **Legajo**: Número de legajo (si aparece)
- **Categoría**: Cargo o categoría del empleado
- **Haberes Brutos**: Salario bruto y otros haberes
- **Descuentos**: Impuestos, aportes y otras deducciones
- **Neto**: Monto neto a recibir
- **Aportes Patronales**: Contribuciones del empleador (si aparecen)

Detalla cada rubro y monto.`,

  impuesto: `Extrae de este documento tributario:
- **Tipo de Tributo**: Qué tipo de impuesto (IVA, Ganancias, Ingresos Brutos, etc.)
- **Período**: Período fiscal correspondiente
- **CUIT**: CUIT del contribuyente
- **Jurisdicción**: Jurisdicción fiscal (nacional, provincial, municipal)
- **Base Imponible**: Monto sobre el que se calcula el impuesto
- **Alícuota**: Tasa o porcentaje aplicado
- **Monto Determinado**: Impuesto determinado o a pagar
- **Ingresado**: Monto ya pagado o ingresado
- **Saldo**: Diferencia a favor o en contra
- **Formulario AFIP**: Número de formulario (F. 1042, F. 1028, etc.)

Presenta con claridad todos los montos y conceptos.`,

  informe: `Extrae de este informe:
- **Título**: Título o nombre del informe
- **Período**: Período cubierto por el informe
- **Autor/Área**: Quién preparó el informe
- **Destinatario**: A quién está dirigido
- **Conclusiones**: Las conclusiones o recomendaciones principales
- **Métricas Clave**: Números, porcentajes o indicadores importantes
- **Recomendaciones**: Acciones o cambios recomendados
- **Resumen Ejecutivo**: Un resumen breve del contenido

Mantén la estructura y los detalles importantes.`,
};

export function buildPrompt(template: Template, customFields?: string[]): string {
  if (template === "general" && customFields && customFields.length > 0) {
    const fieldsList = customFields.map((field, index) => `${index + 1}. ${field}`).join("\n");
    return `Extrae los siguientes campos del documento con formato "Campo: Valor". Si un campo no está presente, indica "No encontrado".

${fieldsList}

Proporciona la información de manera clara y estructurada.`;
  }

  const typedTemplate = template as Template;
  return DEFAULT_PROMPTS[typedTemplate] || DEFAULT_PROMPTS.general;
}
