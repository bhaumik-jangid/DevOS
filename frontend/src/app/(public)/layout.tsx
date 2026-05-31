import { NavBar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"
import { PageTracker } from "@/components/public/page-tracker"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111113] text-white">
      <PageTracker />
      <NavBar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
