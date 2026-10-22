export async function trackPageView(path: string): Promise<void> {
  if (typeof window === "undefined") return
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || "/api/v1"
    const url = API.endsWith("/") ? `${API}core/track/` : `${API}/core/track/`
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: document.referrer || "",
        user_agent: navigator.userAgent || "",
      }),
    })
  } catch {
    // Non-critical — fail silently
  }
}
