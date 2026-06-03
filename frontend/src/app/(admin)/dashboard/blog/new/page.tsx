import { Topbar } from "@/components/admin/topbar"
import { BlogForm } from "@/components/admin/blog-form"

export default function NewBlogPostPage() {
  return (
    <>
      <Topbar title="New post" description="Write and publish a blog post" />
      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-6">
        <BlogForm />
      </main>
    </>
  )
}
