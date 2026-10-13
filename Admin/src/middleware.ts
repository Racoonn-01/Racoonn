import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect Admin Portal UI Routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/cms")) {
    const sessionCookie = request.cookies.get("racoonn_admin_session");

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (!session || !session.isLoggedIn) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin Internal API Routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/vendors") || pathname.startsWith("/api/properties") || pathname.startsWith("/api/send-email")) {
    const sessionCookie = request.cookies.get("racoonn_admin_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Admin session required" },
        { status: 401 }
      );
    }

    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (!session || !session.isLoggedIn) {
        return NextResponse.json(
          { success: false, error: "Unauthorized access: Active session required" },
          { status: 401 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Unauthorized access: Invalid session" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cms/:path*",
    "/api/admin/:path*",
    "/api/vendors/:path*",
    "/api/properties/:path*",
    "/api/send-email/:path*",
  ],
};
