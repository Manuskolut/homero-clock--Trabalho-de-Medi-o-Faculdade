import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/session";

// Checagem otimista de autenticação: só lê o cookie, nunca bate no banco.
// A autorização de verdade (posse por loja, admin-only, etc.) acontece nas
// Server Actions/DAL — ver src/lib/dal.ts.
const PUBLIC_ROUTES = ["/login"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = PUBLIC_ROUTES.includes(path);

  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await decrypt(cookie);

  if (!isPublicRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();

  if (session?.userId) {
    // sliding expiration: renova o cookie a cada request autenticada
    const novaSessao = await encrypt({
      userId: session.userId,
      tipo: session.tipo,
      lojaId: session.lojaId,
      nome: session.nome,
    });
    response.cookies.set(SESSION_COOKIE_NAME, novaSessao, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + SESSION_DURATION_MS),
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
