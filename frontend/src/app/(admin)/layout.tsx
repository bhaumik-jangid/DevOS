"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Sidebar } from "@/components/admin/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, fetchMe } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchMe()
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex">
      <Sidebar />
      {/* pt-14 on mobile to clear the fixed top bar, 0 on desktop */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        {children}
      </div>
    </div>
  )
}
