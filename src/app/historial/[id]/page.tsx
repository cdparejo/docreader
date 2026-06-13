import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { CopyButton } from "@/components/copy-button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExtractionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: extraction, error } = await supabase
    .from("extractions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !extraction) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/historial"
            className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Volver
          </Link>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-red-600">No se encontró la extracción</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/historial"
          className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Volver al Historial
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {extraction.file_name}
            </h1>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
              <p>
                <span className="font-semibold">Plantilla:</span> {extraction.template}
              </p>
              <p>
                <span className="font-semibold">Fecha:</span>{" "}
                {new Date(extraction.created_at).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Resultado</h2>
              <CopyButton text={extraction.result} />
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm whitespace-pre-wrap break-words">
              {extraction.result}
            </pre>
          </div>
        </div>
        </div>
      </main>
    </>
  );
}
