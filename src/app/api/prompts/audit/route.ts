import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    const { searchParams } = new URL(request.url);
    const templateName = searchParams.get("template");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("prompt_audit")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(limit);

    if (templateName) {
      query = query.eq("template_name", templateName);
    }

    const { data: audit, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch audit logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ audit });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
