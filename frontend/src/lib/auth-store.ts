import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "@/types/auth"
import { api } from "./api"

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post("/auth/login///", { email, password })
          localStorage.setItem("access_token", data.access)
          localStorage.setItem("refresh_token", data.refresh)
          document.cookie = `access_token=${data.access}; path=/; max-age=3600; SameSite=Strict`
          set({
            user: data.user,
            accessToken: data.access,
            refreshToken: data.refresh,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        const { refreshToken } = get()
        try {
          if (refreshToken) {
            await api.post("/auth/logout///", { refresh: refreshToken })
          }
        } finally {
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          document.cookie = "access_token=; path=/; max-age=0"
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
        }
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me///")
          set({ user: data, isAuthenticated: true })
        } catch {
          get().logout()
        }
      },
    }),
    {
      name: "devos-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)