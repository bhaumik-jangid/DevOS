import { NavBar } from "@/components/public/navbar"
import { Footer } from "@/components/public/footer"
import { PageTracker } from "@/components/public/page-tracker"
import { getSiteConfig } from "@/lib/portfolio-api"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig()
  return (
    <div className="min-h-screen bg-[#111113] text-white">
      <PageTracker />
      <NavBar />
      <main>{children}</main>
      <Footer config={config} />
    </div>
  )
}
