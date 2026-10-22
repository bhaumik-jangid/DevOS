import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") || "/"
  revalidatePath(path)
  revalidatePath("/projects")
  return NextResponse.json({ revalidated: true, path })
}
