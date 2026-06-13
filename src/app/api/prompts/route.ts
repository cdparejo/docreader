import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_PROMPTS: Record<string, { text: string; description: string }> = {
  general: {
    text: `Analiza el documento y extrae la información en las siguientes secciones:
- **Título o Asunto**: El título o asunto principal del documento
- **Fecha**: La fecha del documento (si aparece)
- **Partes Involucradas**: Las personas, empresas u organizaciones mencionadas
- **Montos**: Los montos monetarios o cantidades relevantes
- **Conceptos Clave**: Los puntos principales o conceptos relevantes en el documento

Formatea la respuesta de manera clara y estructurada.`,
    description: "Plantilla general para análisis de documentos",
  },
  factura: {
    text: `Extrae de esta factura la siguiente información:
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
    description: "Extracción de datos de facturas",
  },
  contrato: {
    text: `Extrae del contrato la siguiente información:
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
    description: "Extracción de datos de contratos",
  },
  liquidacion: {
    text: `Extrae de esta liquidación de sueldo:
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
    description: "Extracción de datos de liquidaciones de sueldo",
  },
  impuesto: {
    text: `Extrae de este documento tributario:
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
    description: "Extracción de datos tributarios",
  },
  informe: {
    text: `Extrae de este informe:
- **Título**: Título o nombre del informe
- **Período**: Período cubierto por el informe
- **Autor/Área**: Quién preparó el informe
- **Destinatario**: A quién está dirigido
- **Conclusiones**: Las conclusiones o recomendaciones principales
- **Métricas Clave**: Números, porcentajes o indicadores importantes
- **Recomendaciones**: Acciones o cambios recomendados
- **Resumen Ejecutivo**: Un resumen breve del contenido

Mantén la estructura y los detalles importantes.`,
    description: "Extracción de datos de informes",
  },
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: prompts, error } = await supabase
      .from("prompts")
      .select("*")
      .order("template_name");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch prompts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error("Prompts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea administrador
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!userRole || userRole.role !== "admin") {
      return NextResponse.json(
        { error: "Only administrators can modify prompts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { template_name, prompt_text, description, action } = body;

    if (!template_name || !prompt_text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Restaurar a valores por defecto
    if (action === "restore") {
      const defaults = DEFAULT_PROMPTS[template_name];
      if (!defaults) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }

      const { data: prompt, error } = await supabase
        .from("prompts")
        .update({
          prompt_text: defaults.text,
          description: defaults.description,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq("template_name", template_name)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Failed to restore prompt" },
          { status: 500 }
        );
      }

      // Registrar en auditoría
      await supabase.from("prompt_audit").insert({
        template_name,
        action: "restored",
        new_prompt_text: defaults.text,
        new_description: defaults.description,
        changed_by: user.id,
      });

      return NextResponse.json({ prompt, message: "Prompt restored to defaults" });
    }

    // Actualización normal
    const { data: prompt, error } = await supabase
      .from("prompts")
      .update({
        prompt_text,
        description,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq("template_name", template_name)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update prompt" },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Prompts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    // Solo admins pueden importar/exportar prompts
    if (action === "import" || action === "export") {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (!userRole || userRole.role !== "admin") {
        return NextResponse.json(
          { error: "Only administrators can manage prompts" },
          { status: 403 }
        );
      }
    }

    // Exportar prompts
    if (action === "export") {
      const { data: prompts, error } = await supabase
        .from("prompts")
        .select("*")
        .order("template_name");

      if (error) {
        return NextResponse.json(
          { error: "Failed to export prompts" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        prompts,
        exportDate: new Date().toISOString(),
      });
    }

    // Importar prompts
    if (action === "import") {
      if (!data || !Array.isArray(data)) {
        return NextResponse.json(
          { error: "Invalid import data" },
          { status: 400 }
        );
      }

      const results = [];
      for (const prompt of data) {
        const { template_name, prompt_text, description } = prompt;

        if (!template_name || !prompt_text) continue;

        const { data: updated, error } = await supabase
          .from("prompts")
          .update({
            prompt_text,
            description,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq("template_name", template_name)
          .select()
          .single();

        if (!error) {
          results.push({ template_name, success: true });

          // Registrar en auditoría
          await supabase.from("prompt_audit").insert({
            template_name,
            action: "updated",
            new_prompt_text: prompt_text,
            new_description: description,
            changed_by: user.id,
          });
        } else {
          results.push({ template_name, success: false, error: error.message });
        }
      }

      return NextResponse.json({
        results,
        importedCount: results.filter(r => r.success).length,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Prompts API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
