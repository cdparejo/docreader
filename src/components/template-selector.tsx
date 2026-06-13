"use client";

import { Template } from "@/lib/prompts";

const TEMPLATES: Array<{ id: Template; name: string; description: string }> = [
  { id: "general", name: "General", description: "Extracción de contenido general" },
  { id: "factura", name: "Factura", description: "Datos de facturas y comprobantes" },
  { id: "contrato", name: "Contrato", description: "Cláusulas y términos contractuales" },
  { id: "liquidacion", name: "Liquidación", description: "Liquidación de sueldos" },
  { id: "impuesto", name: "Impositivo", description: "Documentos fiscales y tributarios" },
  { id: "informe", name: "Informe", description: "Reportes e informes" },
];

interface TemplateSelectorProps {
  selected: Template;
  onSelect: (template: Template) => void;
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`p-4 rounded-lg border-2 text-left transition-colors ${
            selected === template.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <p className="font-semibold text-sm">{template.name}</p>
          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
        </button>
      ))}
    </div>
  );
}
