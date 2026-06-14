"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Obtener el nombre de usuario y rol si el usuario existe
        if (user) {
          try {
            // Obtener perfil
            const profileResponse = await fetch("/api/user/profile");
            if (profileResponse.ok) {
              const profile = await profileResponse.json();
              const displayNameValue = profile?.display_name || user.email?.split("@")[0] || "Usuario";
              setDisplayName(displayNameValue);
            } else {
              setDisplayName(user.email?.split("@")[0] || "Usuario");
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            setDisplayName(user.email?.split("@")[0] || "Usuario");
          }

          try {
            // Obtener rol
            const roleResponse = await fetch("/api/user/role");
            if (roleResponse.ok) {
              const roleData = await roleResponse.json();
              setIsAdmin(roleData.role === "admin");
            }
          } catch (error) {
            console.error("Error fetching role:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/login");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          DocReader
        </Link>
        <div className="flex gap-4 items-center">
          <Link
            href="/historial"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Historial
          </Link>
          <Link
            href="/costs"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Costos
          </Link>
          <Link
            href="/prompts"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Prompts
          </Link>
          {!loading && isAdmin && (
            <Link
              href="/admin/usuarios"
              className="text-purple-600 hover:text-purple-900 font-medium"
            >
              👤 Usuarios
            </Link>
          )}

          {!loading && user && (
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="text-right">
                <Link
                  href="/perfil"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  {displayName}
                </Link>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded font-medium"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
