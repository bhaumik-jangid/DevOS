import { NavBar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111113] text-white">
      <NavBar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
