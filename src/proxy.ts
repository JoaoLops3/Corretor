import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requestHasSessionCookie } from "@/lib/auth-session";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return res;
}

export default auth((req) => {
  const userId = req.auth?.user?.id;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!userId;
  const path = req.nextUrl.pathname;
  const isLoginPage = path === "/login";

  if (!isLoggedIn && !isLoginPage) {
    if (requestHasSessionCookie(req.cookies)) {
      return noStore(
        NextResponse.redirect(new URL("/api/auth/invalidate-session", req.nextUrl.origin)),
      );
    }
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return noStore(NextResponse.redirect(loginUrl));
  }

  if (isLoggedIn && isLoginPage && req.nextUrl.searchParams.get("reason") !== "expired") {
    return noStore(NextResponse.redirect(new URL("/", req.nextUrl.origin)));
  }

  if (
    isLoggedIn &&
    path.startsWith("/equipe") &&
    role !== "ADMIN" &&
    role !== "GERENTE"
  ) {
    return noStore(NextResponse.redirect(new URL("/", req.nextUrl.origin)));
  }

  return noStore(NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon.svg).*)",
  ],
};
