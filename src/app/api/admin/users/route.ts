import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";

// Crear cliente admin con service role key
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}

// Verificar que el usuario sea admin
async function checkIsAdmin(supabase: any, userId: string) {
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  return userRole?.role === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    const isAdmin = await checkIsAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can access this resource" },
        { status: 403 }
      );
    }

    // Usar cliente admin para obtener todos los datos
    const adminClient = getAdminClient();

    // Obtener lista de usuarios (desde user_roles) usando admin client
    const { data: userRoles, error: rolesError } = await adminClient
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Para cada usuario, obtener su perfil y email
    const usersWithProfiles = await Promise.all(
      (userRoles || []).map(async (userRole) => {
        // Obtener display_name usando admin client para evitar RLS
        const { data: profile, error: profileError } = await adminClient
          .from("user_profiles")
          .select("display_name")
          .eq("id", userRole.user_id)
          .single();

        if (profileError) {
          console.error(`Error fetching profile for ${userRole.user_id}:`, profileError);
        }

        // Obtener email desde auth.users (usando admin client)
        let authUser = null;
        try {
          const { data: authData, error: authError } = await adminClient.auth.admin.getUserById(userRole.user_id);
          if (authError) {
            console.error(`Error getting auth user ${userRole.user_id}:`, authError);
          } else {
            authUser = authData.user;
          }
        } catch (err) {
          console.error(`Exception getting auth user ${userRole.user_id}:`, err);
        }

        console.log(`User ${userRole.user_id}: profile=${JSON.stringify(profile)}, email=${authUser?.email}, authUser=${JSON.stringify(authUser)}`);
        console.log(`Result for ${userRole.user_id}: display_name="${profile?.display_name || 'Sin nombre'}", email="${authUser?.email || '---'}"`);

        return {
          user_id: userRole.user_id,
          role: userRole.role,
          created_at: userRole.created_at,
          display_name: profile?.display_name || "Sin nombre",
          email: authUser?.email || "---",
        };
      })
    );

    return NextResponse.json({ users: usersWithProfiles });
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verificar que sea admin
    const isAdmin = await checkIsAdmin(supabase, user.id);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can create users" },
        { status: 403 }
      );
    }

    const body = await request.json();
    let { email, password, displayName, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Normalizar displayName: trim y usar email prefix si está vacío
    displayName = (displayName || "").trim();
    if (!displayName) {
      displayName = email.split("@")[0];
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    try {
      const supabaseAdmin = getAdminClient();

      // Crear usuario en Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        );
      }

      // Crear rol para el usuario
      const userRole = role === "admin" ? "admin" : "user";
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: newUser.user.id,
          role: userRole,
        });

      if (roleError) {
        console.error("Error creating role:", roleError);
        throw new Error(`Failed to create role: ${roleError.message}`);
      }

      // Crear perfil
      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          id: newUser.user.id,
          display_name: displayName,
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      return NextResponse.json({
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          displayName: displayName || email.split("@")[0],
          role: userRole,
        },
      });
    } catch (authError) {
      console.error("Create user error:", authError);
      return NextResponse.json(
        { error: "Failed to create user: " + (authError instanceof Error ? authError.message : "Unknown error") },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Admin users API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
