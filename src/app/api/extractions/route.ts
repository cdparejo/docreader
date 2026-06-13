import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar que el usuario está autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Obtener extracciones del usuario ordenadas por fecha descendente
    const { data: extractions, error } = await supabase
      .from("extractions")
      .select("id, file_name, cost_usd, input_tokens, output_tokens, model_used, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch extractions" },
        { status: 500 }
      );
    }

    return NextResponse.json(extractions);
  } catch (error) {
    console.error("Extractions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
