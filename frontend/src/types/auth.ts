export interface User {
  id: number
  email: string
  username: string
  full_name: string
  avatar: string | null
  is_staff: boolean
  created_at: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}