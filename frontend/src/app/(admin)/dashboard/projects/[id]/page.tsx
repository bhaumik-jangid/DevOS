"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Topbar } from "@/components/admin/topbar"
import { ProjectForm } from "@/components/admin/project-form"
import { api } from "@/lib/api"

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/projects/${id}/`).then((res) => {
      setProject(res.data)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <>
        <Topbar title="Edit project" />
        <main className="flex-1 px-6 py-6">
          <p className="text-zinc-600 font-mono text-sm">Loading...</p>
        </main>
      </>
    )
  }

  if (!project) {
    return (
      <>
        <Topbar title="Edit project" />
        <main className="flex-1 px-6 py-6">
          <p className="text-red-400 font-mono text-sm">Project not found</p>
        </main>
      </>
    )
  }

  return (
    <>
      <Topbar title={`Edit — ${project.name}`} description={project.slug} />
      <main className="flex-1 px-6 py-6">
        <ProjectForm initial={project} projectId={project.id} />
      </main>
    </>
  )
}
