"use client";

import { useEffect, useState } from "react";

interface Model {
  id: string;
  name: string;
  model_id: string;
  description: string;
  speed: string;
  cost: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models");
        if (response.ok) {
          const data = await response.json();
          setModels(data);
          if (data.length > 0 && !selectedModel) {
            onModelChange(data[0].model_id);
          }
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [selectedModel, onModelChange]);

  if (loading) {
    return <div className="text-gray-500 text-sm">Cargando modelos...</div>;
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Modelo de IA
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.model_id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
              selectedModel === model.model_id
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <p className="font-semibold text-sm text-gray-900">{model.name}</p>
            <p className="text-xs text-gray-600 mt-1">{model.description}</p>
            <div className="flex gap-3 mt-2 text-xs text-gray-500">
              <span>⚡ {model.speed}</span>
              <span>💰 {model.cost}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
