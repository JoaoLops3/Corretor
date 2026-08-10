import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

function withNoStore(res: NextResponse) {
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
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return withNoStore(NextResponse.redirect(loginUrl));
  }

  if (isLoggedIn && isLoginPage) {
    if (req.nextUrl.searchParams.get("reason") !== "expired") {
      return withNoStore(NextResponse.redirect(new URL("/", req.nextUrl.origin)));
    }
  }

  // Equipe só para gerente/admin
  if (
    isLoggedIn &&
    path.startsWith("/equipe") &&
    role !== "ADMIN" &&
    role !== "GERENTE"
  ) {
    return withNoStore(NextResponse.redirect(new URL("/", req.nextUrl.origin)));
  }

  return withNoStore(NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon.svg).*)",
  ],
};
