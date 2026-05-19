import { getFeaturedProjects, getSkills, getExperience } from "@/lib/portfolio-api"
import { HeroSection } from "@/components/public/hero-section"
import { FeaturedProjects } from "@/components/public/featured-projects"
import { SkillsSection } from "@/components/public/skills-section"
import { ExperienceSection } from "@/components/public/experience-section"

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
    </>
  )
}
