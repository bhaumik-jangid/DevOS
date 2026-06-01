"use client"

import { useState, KeyboardEvent } from "react"
import { X } from "lucide-react"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = "Type and press Enter" }: TagInputProps) {
  const [input, setInput] = useState("")

  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) {
      onChange([...tags, val])
    }
    setInput("")
  }

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag))

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      add()
    }
    if (e.key === "Backspace" && !input && tags.length) {
      remove(tags[tags.length - 1])
    }
  }

  return (
    <div className="min-h-10.5 w-full bg-[#1a1a1c] border border-zinc-800 rounded-lg
                    px-3 py-2 flex flex-wrap gap-1.5 items-center
                    focus-within:border-amber-500/60 focus-within:ring-1
                    focus-within:ring-amber-500/20 transition-colors">
      {tags.map((tag) => (
        <span key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded
                     bg-zinc-800 text-zinc-300 text-xs font-mono">
          {tag}
          <button type="button" onClick={() => remove(tag)}
            className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length ? "" : placeholder}
        className="flex-1 min-w-24 bg-transparent text-white text-sm
                   placeholder-zinc-600 outline-none"
      />
    </div>
  )
}
