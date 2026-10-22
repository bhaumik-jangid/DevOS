import { NextRequest, NextResponse } from "next/server"

// Strip protocol and trailing slash
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bhaumikjangid.me")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "")

const MAIN_DOMAIN = SITE_URL.startsWith("www.")
  ? SITE_URL.slice(4)
  : SITE_URL

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "https://devos-i1p2.onrender.com"

const RESERVED = new Set(["www", "api", "mail", "dev", "staging", "admin", "app"])

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""

  // Only handle subdomains of our main domain
  if (!host.endsWith(`.${MAIN_DOMAIN}`)) {
    return NextResponse.next()
  }

  const alias = host.replace(`.${MAIN_DOMAIN}`, "").toLowerCase()

  if (!alias || RESERVED.has(alias)) {
    return NextResponse.next()
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/v1/projects/alias/${alias}/`,
      {
        headers: {
          "User-Agent": "DevOS-Middleware/1.0",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(4000),
      }
    )

    if (res.ok) {
      const data = await res.json() as { live_url?: string }
      if (data.live_url) {
        return NextResponse.redirect(data.live_url, {
          status: 302,
          headers: {
            "Cache-Control": "no-store",
          },
        })
      }
    }
  } catch {
    // Backend unreachable — fall through to portfolio
  }

  // No alias found — send to main portfolio
  return NextResponse.redirect(`https://${MAIN_DOMAIN}`, { status: 302 })
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/).*)",
  ],
}
