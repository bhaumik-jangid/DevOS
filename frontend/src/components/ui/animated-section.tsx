"use client"

import { motion } from "framer-motion"


interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1],
            delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedList({ children, className = "" }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({ children, className = "" }: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
