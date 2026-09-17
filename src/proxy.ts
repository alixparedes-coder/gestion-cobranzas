import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege todo lo que esté bajo /panel (la app real: cartera, correos,
 * importación). La landing pública ("/") y "/login" quedan afuera. Las
 * rutas /api tienen su propio chequeo de sesión dentro de cada handler
 * (acá no, porque una API debe responder 401, no redirigir a /login).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesParaEstablecer) {
          cookiesParaEstablecer.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesParaEstablecer.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const usuario = data.user;

  const esRutaDeApp = request.nextUrl.pathname.startsWith("/panel");
  const esLogin = request.nextUrl.pathname.startsWith("/login");

  if (!usuario && esRutaDeApp) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (usuario && esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/panel/:path*", "/login"],
};
