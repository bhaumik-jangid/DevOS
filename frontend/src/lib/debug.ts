/**
 * API debug logger — logs every request and response in development.
 * Automatically disabled in production via NODE_ENV check.
 */

export function attachDebugInterceptors(axiosInstance: import("axios").AxiosInstance) {
  if (process.env.NODE_ENV !== "development") return

  axiosInstance.interceptors.request.use(
    (config) => {
      console.log(
        `%c[API] ${config.method?.toUpperCase()} ${config.baseURL || ""}${config.url}`,
        "color: #f59e0b; font-weight: bold",
        config.data ? { body: config.data } : ""
      )
      return config
    },
    (error: unknown) => {
      console.error("[API] Request error:", error)
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
    (response) => {
      console.log(
        `%c[API] ${response.status} ${response.config.url}`,
        "color: #10b981; font-weight: bold"
      )
      return response
    },
    (error: unknown) => {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        "config" in error
      ) {
        const e = error as {
          response?: { status?: number; data?: unknown }
          config?: { url?: string; method?: string }
        }
        console.error(
          `%c[API] ${e.response?.status} ${e.config?.method?.toUpperCase()} ${e.config?.url}`,
          "color: #ef4444; font-weight: bold",
          e.response?.data
        )
      }
      return Promise.reject(error)
    }
  )
}
