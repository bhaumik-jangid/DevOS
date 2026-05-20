"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, ExternalLink, FileText, MapPin, GitBranch } from "lucide-react"
import { Profile } from "@/types/portfolio"

export function HeroSection({ profile }: { profile: Profile | null }) {
  const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8090"

  return (
    <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start gap-8 sm:gap-12">

        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}>

          {profile?.available_for_work && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                            border border-zinc-800 bg-zinc-900/50 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-500 font-mono">
                Available for opportunities
              </span>
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-medium text-white leading-tight mb-3">
            {profile?.name || "Developer"}
          </h1>
          <p className="text-base sm:text-xl text-amber-500/80 font-mono mb-4">
            {profile?.tagline || "Full-stack Engineer"}
          </p>

          {profile?.location && (
            <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-5">
              <MapPin className="w-3.5 h-3.5" />
              {profile.location}
            </div>
          )}

          <p className="text-zinc-400 leading-relaxed mb-8 max-w-xl text-sm sm:text-base">
            {profile?.bio}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/projects"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400
                         text-black text-sm font-medium px-4 py-2.5 rounded-lg
                         transition-colors duration-150 active:scale-95">
              View projects
              <ArrowRight className="w-4 h-4" />
            </Link>
            {profile?.resume && (
              <a href={`${BACKEND}${profile.resume}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-zinc-700
                           hover:border-zinc-500 text-zinc-300 hover:text-white
                           text-sm px-4 py-2.5 rounded-lg transition-colors
                           active:scale-95">
                <FileText className="w-4 h-4" />
                Download CV
              </a>
            )}
          </div>

          <div className="flex items-center gap-4 mt-6 pt-6
                          border-t border-zinc-800/50 flex-wrap">
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-500 hover:text-white
                           text-sm transition-colors">
                <GitBranch className="w-4 h-4" />GitHub
              </a>
            )}
            {profile?.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-500 hover:text-white
                           text-sm transition-colors">
                <ExternalLink className="w-4 h-4" />LinkedIn
              </a>
            )}
            {profile?.phone && (
              <a href={`tel:${profile.phone}`}
                className="text-zinc-500 hover:text-white text-sm transition-colors font-mono">
                {profile.phone}
              </a>
            )}
          </div>
        </motion.div>

        {/* Photos — use regular img tag, not next/image, for local dev */}
        {(profile?.photo_primary || profile?.photo_secondary) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex gap-3 shrink-0 sm:flex-col">
            {profile?.photo_primary && (
              <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl overflow-hidden
                              border-2 border-zinc-800">
                <img
                  src={`${BACKEND}${profile.photo_primary}`}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {profile?.photo_secondary && (
              <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl overflow-hidden
                              border-2 border-zinc-800 sm:mt-2">
                <img
                  src={`${BACKEND}${profile.photo_secondary}`}
                  alt={profile.name}
                  className="w-full h-full object-cover grayscale
                             hover:grayscale-0 transition-all duration-500"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  )
}