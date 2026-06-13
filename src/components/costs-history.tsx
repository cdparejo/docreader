"use client";

import { useEffect, useState } from "react";

interface Extraction {
  id: string;
  file_name: string;
  cost_usd: number;
  input_tokens: number;
  output_tokens: number;
  model_used: string;
  created_at: string;
}

export function CostsHistory() {
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    const fetchExtractions = async () => {
      try {
        const response = await fetch("/api/extractions");
        if (!response.ok) throw new Error("Error al cargar extracciones");

        const data = await response.json();
        setExtractions(data);

        const total = data.reduce((sum: number, e: Extraction) => sum + e.cost_usd, 0);
        const tokens = data.reduce(
          (sum: number, e: Extraction) => sum + e.input_tokens + e.output_tokens,
          0
        );

        setTotalCost(total);
        setTotalTokens(tokens);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchExtractions();
  }, []);

  if (loading) return <div className="text-center py-8">Cargando...</div>;
  if (error) return <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Costo Total</p>
          <p className="text-3xl font-bold text-gray-900">${totalCost.toFixed(6)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Extracciones</p>
          <p className="text-3xl font-bold text-gray-900">{extractions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Tokens Totales</p>
          <p className="text-3xl font-bold text-gray-900">{totalTokens.toLocaleString()}</p>
        </div>
      </div>

      {/* Tabla de Extracciones */}
      {extractions.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Archivo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Modelo</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Tokens</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Costo USD</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {extractions.map((extraction) => (
                <tr key={extraction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{extraction.file_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{extraction.model_used}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {(extraction.input_tokens + extraction.output_tokens).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    ${extraction.cost_usd.toFixed(6)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(extraction.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          No hay extracciones aún
        </div>
      )}
    </div>
  );
}
