import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default async function HistorialPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: extractions, error } = await supabase
    .from("extractions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600">Error al cargar el historial</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Historial</h1>
          <p className="text-gray-600 mt-2">Tus extracciones anteriores</p>
        </div>

        <Link
          href="/"
          className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Volver a Inicio
        </Link>

        {!extractions || extractions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No hay extracciones aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Plantilla
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Tiempo de Lectura
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {extractions.map((extraction: any) => (
                  <tr key={extraction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {extraction.file_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {extraction.template}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(extraction.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {extraction.processing_time_seconds ? `${extraction.processing_time_seconds}s` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/historial/${extraction.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver Resultado
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </main>
    </>
  );
}
