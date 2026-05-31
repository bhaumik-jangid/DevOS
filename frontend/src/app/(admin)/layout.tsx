"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Sidebar } from "@/components/admin/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, fetchMe } = useAuthStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (!initialized.current) {
      initialized.current = true
      fetchMe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        {children}
      </div>
    </div>
  )
}
