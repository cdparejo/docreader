"use client";

import { useState } from "react";
import { PromptManager } from "./prompt-manager";

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  templateType: string;
}

export function PromptInput({
  prompt,
  onPromptChange,
  templateType,
}: PromptInputProps) {
  const [showManager, setShowManager] = useState(false);

  const handlePromptSelect = (selectedPrompt: string) => {
    onPromptChange(selectedPrompt);
    setShowManager(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Prompt Personalizado
        </label>
        <button
          onClick={() => setShowManager(!showManager)}
          type="button"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {showManager ? "Ocultar mis prompts" : "Ver mis prompts guardados"}
        </button>
      </div>

      {showManager && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <PromptManager
            onPromptSelect={handlePromptSelect}
            templateType={templateType}
          />
        </div>
      )}

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Pega tu prompt personalizado aquí. Ej: 'Extrae de este documento el nombre, monto y fecha...'"
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
      />

      <p className="text-xs text-gray-500">
        💡 Tip: Guarda tus prompts favoritos para reutilizarlos rápidamente.
      </p>
    </div>
  );
}
