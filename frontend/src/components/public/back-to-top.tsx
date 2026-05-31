// back-to-top.tsx
"use client";

import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp />
    </button>
  );
}