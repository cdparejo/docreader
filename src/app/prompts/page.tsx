"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";

interface Prompt {
  id: string;
  template_name: string;
  prompt_text: string;
  description: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  template_name: string;
  action: string;
  old_prompt_text?: string;
  new_prompt_text?: string;
  old_description?: string;
  new_description?: string;
  changed_at: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAudit, setShowAudit] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPrompts();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/user/role");
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.role === "admin");
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
    }
  };

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/prompts");

      if (!response.ok) throw new Error("Error cargando prompts");

      const data = await response.json();
      setPrompts(data.prompts);
      if (data.prompts.length > 0) {
        selectPrompt(data.prompts[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!selectedPrompt) return;

    try {
      setAuditLoading(true);
      const response = await fetch(`/api/prompts/audit?template=${selectedPrompt.template_name}`);

      if (!response.ok) throw new Error("Error cargando historial");

      const data = await response.json();
      setAuditLogs(data.audit || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setAuditLoading(false);
    }
  };

  const exportPrompts = async () => {
    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export" }),
      });

      if (!response.ok) throw new Error("Error exportando prompts");

      const data = await response.json();
      const json = JSON.stringify(data.prompts, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompts-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess("Prompts exportados correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  const importPrompts = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error("El archivo debe contener un array de prompts");
      }

      setSaving(true);
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", data }),
      });

      if (!response.ok) throw new Error("Error importando prompts");

      const result = await response.json();
      setSuccess(`${result.importedCount} prompts importados correctamente`);

      // Recargar prompts
      await fetchPrompts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const restoreDefault = async () => {
    if (!selectedPrompt) return;

    if (!confirm("¿Estás seguro de que quieres restaurar este prompt a los valores por defecto?")) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: selectedPrompt.template_name,
          prompt_text: "",
          description: "",
          action: "restore",
        }),
      });

      if (!response.ok) throw new Error("Error restaurando prompt");

      const data = await response.json();
      setSuccess("Prompt restaurado a valores por defecto");
      selectPrompt(data.prompt);
      setPrompts(prompts.map(p => p.id === selectedPrompt.id ? data.prompt : p));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const selectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditingText(prompt.prompt_text);
    setEditingDescription(prompt.description || "");
    setError("");
    setSuccess("");
  };

  const savePrompt = async () => {
    if (!selectedPrompt) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_name: selectedPrompt.template_name,
          prompt_text: editingText,
          description: editingDescription,
        }),
      });

      if (!response.ok) throw new Error("Error guardando prompt");

      const data = await response.json();
      setSuccess("Prompt guardado correctamente");

      // Actualizar el prompt en la lista
      setPrompts(
        prompts.map((p) =>
          p.id === selectedPrompt.id ? data.prompt : p
        )
      );
      selectPrompt(data.prompt);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const resetPrompt = () => {
    if (selectedPrompt) {
      selectPrompt(selectedPrompt);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Cargando prompts...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Prompts Generales</h1>
            <p className="text-gray-600 mt-2">
              Gestiona los prompts por plantilla
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de prompts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Plantillas
              </h2>
              <div className="space-y-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => selectPrompt(prompt)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedPrompt?.id === prompt.id
                        ? "bg-blue-100 text-blue-900 border-l-4 border-blue-600"
                        : "bg-gray-50 text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium">{prompt.template_name}</div>
                    {prompt.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {prompt.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor de prompt - Solo admins */}
            {selectedPrompt && !isAdmin && (
              <div className="lg:col-span-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <p className="text-yellow-800 font-medium">
                    🔒 Solo administradores pueden editar plantillas generales
                  </p>
                  <p className="text-yellow-600 text-sm mt-2">
                    Puedes usar estas plantillas para extracciones, pero no modificarlas.
                  </p>
                </div>
              </div>
            )}

            {selectedPrompt && isAdmin && (
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900">
                    Editar: {selectedPrompt.template_name}
                  </h2>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
                      {success}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descripción de esta plantilla"
                      />
                    </div>

                    {/* Prompt Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prompt
                      </label>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        rows={12}
                        placeholder="Ingresa el prompt aquí..."
                      />
                    </div>

                    {/* Información */}
                    {selectedPrompt.updated_at && (
                      <div className="text-xs text-gray-500">
                        Última modificación:{" "}
                        {new Date(selectedPrompt.updated_at).toLocaleString(
                          "es-AR"
                        )}
                      </div>
                    )}

                    {/* Botones de acciones */}
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <button
                          onClick={savePrompt}
                          disabled={saving}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            saving
                              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                        <button
                          onClick={resetPrompt}
                          disabled={saving}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Descartar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setShowAudit(!showAudit);
                            if (!showAudit) fetchAuditLogs();
                          }}
                          className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                        >
                          📋 Historial
                        </button>
                        <button
                          onClick={restoreDefault}
                          disabled={saving}
                          className="px-4 py-2 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm disabled:opacity-50"
                        >
                          🔄 Restaurar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={exportPrompts}
                          className="px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                        >
                          📥 Exportar
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={saving}
                          className="px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm disabled:opacity-50"
                        >
                          📤 Importar
                        </button>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          importPrompts(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Historial */}
                {showAudit && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Historial de Cambios: {selectedPrompt.template_name}
                    </h3>

                    {auditLoading ? (
                      <div className="text-gray-600">Cargando historial...</div>
                    ) : auditLogs.length === 0 ? (
                      <div className="text-gray-600">Sin cambios registrados</div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {auditLogs.map((log) => (
                          <div key={log.id} className="border-l-4 border-blue-200 pl-4 py-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {log.action.toUpperCase()}
                                </span>
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Date(log.changed_at).toLocaleString("es-AR")}
                                </p>
                              </div>
                            </div>
                            {log.action === "updated" && (
                              <details className="text-xs mt-2">
                                <summary className="cursor-pointer text-gray-500">
                                  Ver detalles
                                </summary>
                                <div className="mt-2 space-y-1 text-gray-600">
                                  {log.old_description && log.new_description !== log.old_description && (
                                    <div>
                                      <span className="font-mono">Descripción: {log.old_description} → {log.new_description}</span>
                                    </div>
                                  )}
                                </div>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
