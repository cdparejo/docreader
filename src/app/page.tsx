"use client";

import { useState } from "react";
import { PdfUpload } from "@/components/pdf-upload";
import { TemplateSelector } from "@/components/template-selector";
import { CustomFields } from "@/components/custom-fields";
import { PromptInput } from "@/components/prompt-input";
import { ModelSelector } from "@/components/model-selector";
import { CostInfo } from "@/components/cost-info";
import { Navbar } from "@/components/navbar";
import { Template, buildPrompt } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"template" | "custom" | "mis-prompts">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<Template>("general");
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [extractionId, setExtractionId] = useState("");
  const [costUsd, setCostUsd] = useState(0);
  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const [processingTime, setProcessingTime] = useState<number | undefined>(undefined);

  const handleFileSelect = (selectedFile: File, base64: string) => {
    setFile(selectedFile);
    setFileBase64(base64);
    setError("");
    setResult("");
  };

  const handleExtract = async () => {
    if (!file || !fileBase64) {
      setError("Por favor, selecciona un PDF");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setCostUsd(0);
    setInputTokens(0);
    setOutputTokens(0);
    setProcessingTime(undefined);

    try {
      let template: Template = "general";
      let prompt = "";

      if (activeTab === "template") {
        template = selectedTemplate;
        prompt = buildPrompt(selectedTemplate);
      } else if (activeTab === "custom") {
        template = "general";
        prompt = buildPrompt("general", customFields);
      } else if (activeTab === "mis-prompts") {
        if (!customPrompt.trim()) {
          setError("Por favor, ingresa o selecciona un prompt");
          setLoading(false);
          return;
        }
        template = "general";
        prompt = customPrompt;
      }

      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64,
          fileName: file.name,
          template,
          customFields: activeTab === "custom" ? customFields : [],
          prompt,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la extracción");
      }

      const data = await response.json();
      setResult(data.result);
      setExtractionId(data.extractionId);
      setCostUsd(data.cost || 0);
      setInputTokens(data.tokens?.input || 0);
      setOutputTokens(data.tokens?.output || 0);
      setProcessingTime(data.processingTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    alert("Resultado copiado al portapapeles");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">DocReader</h1>
          <p className="text-gray-600 mt-2">
            Extrae información de documentos PDF con IA
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Upload */}
          <div>
            <h2 className="text-lg font-semibold mb-4">1. Selecciona un PDF</h2>
            <PdfUpload onFileSelect={handleFileSelect} disabled={loading} />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-4">2. Tipo de Extracción</h2>
            <div className="flex gap-2 border-b mb-4">
              <button
                onClick={() => setActiveTab("template")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "template"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Plantillas
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "custom"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Personalizada
              </button>
              <button
                onClick={() => setActiveTab("mis-prompts")}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === "mis-prompts"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Mis Prompts
              </button>
            </div>

            {activeTab === "template" ? (
              <TemplateSelector
                selected={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            ) : activeTab === "custom" ? (
              <CustomFields
                fields={customFields}
                onFieldsChange={setCustomFields}
              />
            ) : (
              <PromptInput
                prompt={customPrompt}
                onPromptChange={setCustomPrompt}
                templateType="custom"
              />
            )}
          </div>

          {/* Model Selection */}
          <div>
            <h2 className="text-lg font-semibold mb-4">3. Modelo de IA</h2>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>

          {/* Extract Button */}
          <button
            onClick={handleExtract}
            disabled={loading || !file}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              loading || !file
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Leyendo el documento..." : "Extraer Información"}
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Cost Info */}
          {result && (
            <CostInfo
              costUsd={costUsd}
              inputTokens={inputTokens}
              outputTokens={outputTokens}
              extractionId={extractionId}
              fileName={file?.name}
              result={result}
              processingTime={processingTime}
            />
          )}

          {/* Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-green-900">Resultado</h3>
                <button
                  onClick={copyToClipboard}
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Copiar
                </button>
              </div>
              <pre className="bg-white p-4 rounded overflow-auto max-h-96 text-sm whitespace-pre-wrap break-words">
                {result}
              </pre>
              {extractionId && (
                <p className="text-xs text-gray-600">
                  ID de extracción: {extractionId}
                </p>
              )}
            </div>
          )}
        </div>
        </div>
      </main>
    </>
  );
}
