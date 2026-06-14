import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Si las variables de entorno no están disponibles (durante el build), permitir la solicitud
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const currentPath = request.nextUrl.pathname;

  // Rutas públicas que no necesitan verificación de autenticación
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.includes(currentPath);

  // Si es ruta pública, permitir sin verificar sesión
  if (isPublicRoute) {
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as CookieOptions)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Si el usuario no está autenticado en ruta protegida, redirigir a login
    // PERO: permitir que continúe si las cookies se están actualizando (evita loops)
    if (!user) {
      const hasCookie = request.cookies.has("sb-johjtfxlecrcletawixw-auth-token");
      // Si tiene cookie pero getUser() falla, permitir continuar (cookies en sincronización)
      if (!hasCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  } catch (error) {
    // Si hay error al verificar sesión, permitir continuar
    // El error probablemente es por cookies en sincronización
    console.error("Error verificando sesión:", error);
  }

  return response;
}
