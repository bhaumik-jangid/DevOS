const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1"

export async function trackPageView(path: string) {
  try {
    console.log("api call to :", `${API}/core/track////`)
    await fetch(`${API}/core/track////`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path,
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }),
    })
  } catch {
    // Silent fail — never break the page for analytics
  }
}
