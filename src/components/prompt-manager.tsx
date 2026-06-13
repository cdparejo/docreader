"use client";

import { useEffect, useState } from "react";

interface UserPrompt {
  id: string;
  name: string;
  prompt: string;
  template_type: string;
  is_default: boolean;
  created_at: string;
}

interface PromptManagerProps {
  onPromptSelect: (prompt: string) => void;
  templateType: string;
}

export function PromptManager({
  onPromptSelect,
  templateType,
}: PromptManagerProps) {
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", prompt: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrompts();
  }, [templateType]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/user-prompts?template_type=${templateType}`
      );
      if (response.ok) {
        const data = await response.json();
        setPrompts(data);
      }
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setError("Error al cargar prompts");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async () => {
    if (!formData.name.trim() || !formData.prompt.trim()) {
      setError("Nombre y prompt son requeridos");
      return;
    }

    try {
      const response = await fetch("/api/user-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          prompt: formData.prompt,
          template_type: templateType,
        }),
      });

      if (response.ok) {
        setFormData({ name: "", prompt: "" });
        setShowForm(false);
        setError("");
        fetchPrompts();
      } else {
        const err = await response.json();
        setError(err.error || "Error al guardar prompt");
      }
    } catch (err) {
      setError("Error al guardar prompt");
      console.error(err);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm("¿Eliminar este prompt?")) return;

    try {
      const response = await fetch(`/api/user-prompts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPrompts();
      } else {
        setError("Error al eliminar prompt");
      }
    } catch (err) {
      setError("Error al eliminar prompt");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-sm">Cargando prompts...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Mis Prompts Guardados</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showForm ? "Cancelar" : "+ Nuevo Prompt"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-2 text-sm rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="border border-gray-200 p-4 rounded-lg bg-gray-50 space-y-3">
          <input
            type="text"
            placeholder="Nombre del prompt (ej: Factura 2026)"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <textarea
            placeholder="Pega aquí tu prompt personalizado..."
            value={formData.prompt}
            onChange={(e) =>
              setFormData({ ...formData, prompt: e.target.value })
            }
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
          />
          <button
            onClick={handleSavePrompt}
            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
          >
            Guardar Prompt
          </button>
        </div>
      )}

      {prompts.length > 0 ? (
        <div className="space-y-2">
          {prompts.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 p-3 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {p.prompt}
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => onPromptSelect(p.prompt)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Usar
                  </button>
                  <button
                    onClick={() => handleDeletePrompt(p.id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !showForm ? (
        <p className="text-xs text-gray-500 text-center py-4">
          No hay prompts guardados. Crea uno nuevo.
        </p>
      ) : null}
    </div>
  );
}
