"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Download, GitBranch, ExternalLink, MapPin } from "lucide-react"
import { Profile } from "@/types/portfolio"

interface HeroSectionProps {
  profile: Profile | null
  config: Record<string, string>
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8090"

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } }
}

export function HeroSection({ profile, config }: HeroSectionProps) {
  const heroBg = profile?.photo_primary ? `${BACKEND}${profile.photo_primary}` : null

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background image — landscape, fades left to right */}
      {heroBg && (
        <>
          {/* Desktop — image on right half, fade from left */}
          <div className="absolute inset-0 hidden sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroBg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-right"
            />
            {/* Gradient mask — solid black on left, transparent on right */}
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(to right, #111113 0%, #111113 40%, #111113cc 60%, #11111380 75%, transparent 100%)"
              }} />
            {/* Top and bottom fades */}
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, #111113 0%, transparent 15%, transparent 85%, #111113 100%)"
              }} />
          </div>

          {/* Mobile — image on top half */}
          <div className="absolute inset-x-0 top-0 h-[50vh] sm:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroBg}
              alt=""
              className="w-full h-full object-cover object-top"
            />
            {/* Fade to background at bottom */}
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(to bottom, transparent 0%, transparent 50%, #111113 100%)"
              }} />
          </div>
        </>
      )}

      {/* Dark overlay when no image */}
      {!heroBg && (
        <div className="absolute inset-0 bg-[#111113]" />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 w-full">

        {/* Mobile: content below image */}
        <div className="pt-[52vh] sm:pt-0 pb-16 sm:py-20 lg:py-0 sm:min-h-screen
                        sm:flex sm:items-center">
          <motion.div
            className="max-w-lg"
            variants={container}
            initial="hidden"
            animate="visible">

            {/* Availability badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 mb-5">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full
                              border border-zinc-700/60 bg-zinc-900/80 backdrop-blur-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  profile?.available_for_work ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                }`} />
                <span className="text-xs text-zinc-400 font-mono">
                  {profile?.available_for_work ? "Available for work" : "Not available"}
                </span>
              </div>
            </motion.div>

            {/* Name */}
            <motion.h1 variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white
                         leading-tight mb-3">
              {profile?.name || "Developer"}
            </motion.h1>

            {/* Role */}
            <motion.p variants={item}
              className="text-lg sm:text-xl text-amber-400/90 font-mono mb-3">
              {profile?.tagline || "Full-stack Engineer"}
            </motion.p>

            {/* Location */}
            {profile?.location && (
              <motion.div variants={item}
                className="flex items-center gap-1.5 text-zinc-500 text-sm mb-5">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </motion.div>
            )}

            {/* Bio */}
            <motion.p variants={item}
              className="text-zinc-400 leading-relaxed mb-7
                         text-sm sm:text-base max-w-md">
              {profile?.bio}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex items-center gap-3 flex-wrap mb-7">
              <Link href="/#contact"
                className="inline-flex items-center gap-2 bg-amber-500
                           hover:bg-amber-400 text-black text-sm font-semibold
                           px-5 py-2.5 rounded-lg transition-colors duration-150
                           min-h-11">
                Hire me
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link href="/projects"
                className="inline-flex items-center gap-2 border border-zinc-700
                           hover:border-zinc-500 text-zinc-300 hover:text-white
                           text-sm px-5 py-2.5 rounded-lg transition-colors
                           min-h-11">
                View projects
              </Link>

              {profile?.resume && (
                <a href={`${BACKEND}${profile.resume}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-500
                             hover:text-white text-sm transition-colors
                             min-h-11 px-2">
                  <Download className="w-4 h-4" />
                  Resume
                </a>
              )}
            </motion.div>

            {/* Social links */}
            <motion.div variants={item} className="flex items-center gap-5">
              {(config.github_url || profile?.github_url) && (
                <a href={config.github_url || profile?.github_url}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-zinc-500
                             hover:text-white text-sm transition-colors">
                  <GitBranch className="w-4 h-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              )}
              {(config.linkedin_url || profile?.linkedin_url) && (
                <a href={config.linkedin_url || profile?.linkedin_url}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-zinc-500
                             hover:text-white text-sm transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              )}
              {(config.phone || profile?.phone) && (
                <a href={`tel:${config.phone || profile?.phone}`}
                  className="text-zinc-500 hover:text-white text-sm
                             font-mono transition-colors">
                  {config.phone || profile?.phone}
                </a>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
