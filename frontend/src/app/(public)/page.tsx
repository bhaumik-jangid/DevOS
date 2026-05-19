import { getFeaturedProjects, getSkills, getExperience } from "@/lib/portfolio-api"
import { HeroSection } from "@/components/public/hero-section"
import { FeaturedProjects } from "@/components/public/featured-projects"
import { SkillsSection } from "@/components/public/skills-section"
import { ExperienceSection } from "@/components/public/experience-section"
import { ContactForm } from "@/components/public/contact-form"

export default async function HomePage() {
  const [projects, skills, experience] = await Promise.all([
    getFeaturedProjects(),
    getSkills(),
    getExperience(),
  ])

  return (
    <>
      <HeroSection />
      <FeaturedProjects projects={projects} />
      <SkillsSection skills={skills} />
      <ExperienceSection experience={experience} />

      {/* Contact */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
          Contact
        </p>
        <h2 className="text-2xl font-medium text-white mb-2">Get in touch</h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-md">
          Open to freelance projects, full-time roles, and interesting collaborations.
          Message goes directly to my Telegram.
        </p>
        <div className="max-w-lg">
          <ContactForm />
        </div>
      </section>
    </>
  )
}
