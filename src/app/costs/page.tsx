"use client";

import { Navbar } from "@/components/navbar";
import { CostsHistory } from "@/components/costs-history";

export const dynamic = "force-dynamic";

export default function CostsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Dashboard de Costos</h1>
            <p className="text-gray-600 mt-2">
              Visualiza el costo de tus extracciones y analiza tendencias
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <CostsHistory />
          </div>
        </div>
      </main>
    </>
  );
}
