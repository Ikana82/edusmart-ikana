import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : (data?.claims ?? null);

  const pathname = request.nextUrl.pathname;

  // Belum login: arahkan ke halaman login.
  if (!claims && pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";

    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    return response;
  }

  // Sudah login: jangan kembali ke halaman login.
  if (claims && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";

    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });

    return response;
  }

  // Periksa role pengguna dari tabel profiles.
  if (claims) {
    const userId = typeof claims.sub === "string" ? claims.sub : null;
    let role = "member";

    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      role = profile?.role ?? "member";
    }

    // Halaman yang hanya boleh dibuka Admin.
    const adminOnly =
      pathname.startsWith("/admin") || pathname.endsWith("/kelola");

    // Member tidak boleh membuka halaman Admin.
    if (adminOnly && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";

      const response = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        response.cookies.set(cookie);
      });

      return response;
    }
  }

  return supabaseResponse;
}
