import { NextRequest, NextResponse } from "next/server"

const ADMIN_ROUTES = ["/dashboard"]
const PUBLIC_ONLY_ROUTES = ["/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get("access_token")?.value

  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
  const isPublicOnly = PUBLIC_ONLY_ROUTES.includes(pathname)

  if (isAdminRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isPublicOnly && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}