import { Topbar } from "@/components/admin/topbar"
import { ProjectForm } from "@/components/admin/project-form"

export default function NewProjectPage() {
  return (
    <>
      <Topbar title="New project" description="Register a project in DevOS" />
      <main className="flex-1 px-6 py-6">
        <ProjectForm />
      </main>
    </>
  )
}
