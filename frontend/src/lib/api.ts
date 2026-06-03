import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

const BASE_URL = (
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL
) || "/api/v1"

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
})

// Attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem("refresh_token")

      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh })
          localStorage.setItem("access_token", data.access)
          if (original.headers) {
            original.headers.Authorization = `Bearer ${data.access}`
          }
          return api(original)
        } catch {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/login"
        }
      } else {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)