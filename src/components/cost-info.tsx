"use client";

import { useState } from "react";

interface CostInfoProps {
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
  extractionId?: string;
  fileName?: string;
  result?: string;
  processingTime?: number;
}

export function CostInfo({ costUsd, inputTokens, outputTokens, extractionId, fileName, result, processingTime }: CostInfoProps) {
  const totalTokens = inputTokens + outputTokens;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    if (!result) return;

    try {
      setDownloading(true);

      const blob = new Blob([result], { type: "application/json" });

      // Generar nombre con fecha_hora_minuto_segundo_nombrearchivo
      const now = new Date();
      const fecha = now.getFullYear().toString().padStart(4, '0') +
                    (now.getMonth() + 1).toString().padStart(2, '0') +
                    now.getDate().toString().padStart(2, '0');
      const hora = now.getHours().toString().padStart(2, '0');
      const minuto = now.getMinutes().toString().padStart(2, '0');
      const segundo = now.getSeconds().toString().padStart(2, '0');

      // Obtener nombre del archivo sin extensión .pdf
      const nombreArchivoSinExtension = fileName
        ? fileName.replace(/\.pdf$/i, '')
        : 'extraction';
      const downloadFileName = `${fecha}_${hora}${minuto}${segundo}_${nombreArchivoSinExtension}.json`;

      // Crear link de descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloading(false);
    } catch (error) {
      console.error("Error en descarga:", error);
      alert("Error al descargar el archivo JSON");
      setDownloading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-blue-900">Información de Costos</h3>
        {result && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`text-sm px-3 py-1 rounded transition-colors ${
              downloading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {downloading ? "⏳ Descargando..." : "⬇️ Descargar JSON"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-blue-600">Costo Total</p>
          <p className="text-2xl font-bold text-blue-900">${costUsd.toFixed(6)}</p>
        </div>

        <div>
          <p className="text-sm text-blue-600">Tokens Utilizados</p>
          <p className="text-2xl font-bold text-blue-900">{totalTokens.toLocaleString()}</p>
        </div>

        {processingTime !== undefined && (
          <div>
            <p className="text-sm text-blue-600">Tiempo de Lectura</p>
            <p className="text-2xl font-bold text-blue-900">{processingTime}s</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
        <div>
          <p className="text-xs text-blue-600">Entrada</p>
          <p className="text-sm font-semibold text-blue-900">{inputTokens.toLocaleString()} tokens</p>
        </div>
        <div>
          <p className="text-xs text-blue-600">Salida</p>
          <p className="text-sm font-semibold text-blue-900">{outputTokens.toLocaleString()} tokens</p>
        </div>
      </div>
    </div>
  );
}
