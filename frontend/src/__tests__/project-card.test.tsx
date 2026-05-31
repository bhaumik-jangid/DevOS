import { render, screen } from "@testing-library/react"
import { ProjectCard } from "@/components/public/project-card"
import { Project } from "@/types/portfolio"

const mockProject: Project = {
  id: 1,
  name: "DevOS",
  slug: "devos",
  description: "Personal developer operations platform",
  stack_tags: ["Next.js", "Django", "PostgreSQL"],
  github_url: "https://github.com/test/devos",
  live_url: "https://devos.dev",
  cover_image: null,
  status: "active",
  hosting_provider: "vercel",
  is_featured: true,
  order: 1,
}

describe("ProjectCard", () => {
  it("renders project name", () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText("DevOS")).toBeInTheDocument()
  })

  it("renders project description", () => {
    render(<ProjectCard project={mockProject} />)
    expect(
      screen.getByText(/personal developer operations platform/i)
    ).toBeInTheDocument()
  })

  it("renders stack tags", () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText("Next.js")).toBeInTheDocument()
    expect(screen.getByText("Django")).toBeInTheDocument()
  })

  it("renders status badge", () => {
    render(<ProjectCard project={mockProject} />)
    expect(screen.getByText("active")).toBeInTheDocument()
  })

  it("links to correct project page", () => {
    render(<ProjectCard project={mockProject} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/projects/devos")
  })
})
