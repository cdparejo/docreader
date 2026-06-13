import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import { calculateCost, isSupportedModel } from "@/lib/pricing";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { fileBase64, fileName, template, customFields, prompt, model } =
      body;

    if (!fileBase64 || !fileName || !template || !prompt || !model) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validar que el modelo sea soportado
    if (!isSupportedModel(model)) {
      return NextResponse.json(
        { error: "Unsupported model" },
        { status: 400 }
      );
    }

    // Iniciar medición de tiempo
    const processingStartTime = Date.now();

    // Procesar según el modelo
    let result = "";
    let input_tokens = 0;
    let output_tokens = 0;

    if (model.startsWith("gemini")) {
      // Gemini de Google
      if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json(
          { error: "Google API key not configured" },
          { status: 503 }
        );
      }

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model: model });

      // Convertir base64 a Buffer y enviar como archivo MIME
      const pdfBuffer = Buffer.from(fileBase64, "base64");

      const response = await geminiModel.generateContent([
        {
          inlineData: {
            mimeType: "application/pdf",
            data: fileBase64,
          },
        },
        {
          text: prompt,
        },
      ]);

      result = response.response.text();

      // Obtener conteo de tokens real
      const countResult = await geminiModel.countTokens([
        {
          inlineData: {
            mimeType: "application/pdf",
            data: fileBase64,
          },
        },
        {
          text: prompt,
        },
      ]);

      input_tokens = countResult.totalTokens || 0;
      output_tokens = Math.ceil((result.length / 4)); // Aproximación conservadora
    } else {
      // Claude de Anthropic
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const message = await client.messages.create({
        model: model,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: fileBase64,
                },
              } as any,
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      });

      result =
        message.content[0].type === "text" ? message.content[0].text : "";

      input_tokens = message.usage.input_tokens;
      output_tokens = message.usage.output_tokens;
    }

    // Calcular tiempo de procesamiento en segundos
    const processingTimeMs = Date.now() - processingStartTime;
    const processingTimeSeconds = (processingTimeMs / 1000).toFixed(2);

    // Calcular costo basado en tokens utilizados
    const costCalc = calculateCost(model, {
      input_tokens,
      output_tokens,
    });

    // Generar ID único para el archivo
    const fileId = uuidv4();
    const filePath = `${user.id}/${fileId}-${fileName}`;

    // Subir el PDF a Storage
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, Buffer.from(fileBase64, "base64"), {
        contentType: "application/pdf",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    // Guardar la extracción en la base de datos
    const { data: extraction, error: dbError } = await supabase
      .from("extractions")
      .insert({
        user_id: user.id,
        file_name: fileName,
        file_path: filePath,
        template,
        custom_fields: customFields ? customFields : null,
        result,
        model_used: model,
        input_tokens,
        output_tokens,
        cost_usd: costCalc.total_cost,
        processing_time_seconds: parseFloat(processingTimeSeconds),
      })
      .select("id")
      .single();

    if (dbError) {
      return NextResponse.json(
        { error: "Failed to save extraction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      result,
      extractionId: extraction.id,
      cost: costCalc.total_cost,
      tokens: {
        input: input_tokens,
        output: output_tokens,
      },
      processingTime: parseFloat(processingTimeSeconds),
    });
  } catch (error) {
    console.error("Extract API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
