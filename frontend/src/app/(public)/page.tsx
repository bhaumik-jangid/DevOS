import {
  getProfile, getFeaturedProjects, getSkills,
  getExperience, getAcademic, getAchievements, getCertifications
} from "@/lib/portfolio-api"
import { HeroSection } from "@/components/public/hero-section"
import { FeaturedProjects } from "@/components/public/featured-projects"
import { SkillsSection } from "@/components/public/skills-section"
import { ExperienceSection } from "@/components/public/experience-section"
import { AcademicSection } from "@/components/public/academic-section"
import { DSASection } from "@/components/public/dsa-section"
import { AchievementsSection } from "@/components/public/achievements-section"
import { CertificationsSection } from "@/components/public/certifications-section"
import { ContactForm } from "@/components/public/contact-form"

export default async function HomePage() {
  const [
    profile, projects, skills, experience,
    academics, achievements, certifications
  ] = await Promise.all([
    getProfile(),
    getFeaturedProjects(),
    getSkills(),
    getExperience(),
    getAcademic(),
    getAchievements(),
    getCertifications(),
  ])

  return (
    <>
      <HeroSection profile={profile} />
      <FeaturedProjects projects={projects} />
      <SkillsSection skills={skills} />
      <ExperienceSection experience={experience} />
      <AcademicSection academics={academics} />
      <DSASection profile={profile} />
      <AchievementsSection achievements={achievements} />
      <CertificationsSection certs={certifications} />

      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-1">
          Contact
        </p>
        <h2 className="text-2xl font-medium text-white mb-2">Get in touch</h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-md">
          Open to freelance projects, full-time roles, and interesting collaborations.
          Messages go directly to my Telegram.
        </p>
        <div className="max-w-lg">
          <ContactForm />
        </div>
      </section>
    </>
  )
}
