import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isStaffPath(pathname: string): boolean {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (isStaffPath(request.nextUrl.pathname)) {
    response.headers.set("Content-Security-Policy", "frame-ancestors 'none';");
  } else {
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors https://admin.shopify.com https://*.myshopify.com;",
    );
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
