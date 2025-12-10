"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { motion } from "framer-motion"

interface HeroSectionProps {
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  negotiationStrength: "Quick" | "Standard" | "Max savings"
  setNegotiationStrength: Dispatch<SetStateAction<"Quick" | "Standard" | "Max savings">>
  onSubmit: (e: React.FormEvent) => Promise<void>
  loading: boolean
}

const PLACEHOLDER_EXAMPLES = [
  "iPhone 15 Pro under $900 in NYC (pickup)",
  "Haircut in NYC at 5PM under $60",
  "Screen repair in Chicago under $200",
  "MacBook Pro under $1300 in Chicago",
]

export default function HeroSection({
  query,
  setQuery,
  negotiationStrength,
  setNegotiationStrength,
  onSubmit,
  loading,
}: HeroSectionProps) {
  const randomExample = PLACEHOLDER_EXAMPLES[Math.floor(Math.random() * PLACEHOLDER_EXAMPLES.length)]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  }

  const floatingVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 4,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <section className="w-full py-12 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl mx-auto px-4 space-y-8">
        {/* Headlines */}
        <motion.div className="text-center space-y-4" variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Never overpay again.
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground text-balance">
            Describe what you need and our AI negotiates with multiple US stores and services for you.
          </motion.p>
        </motion.div>

        {/* Search Card */}
        <motion.form
          onSubmit={onSubmit}
          className="space-y-6 bg-card border border-border rounded-xl p-6 md:p-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Query Input */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={randomExample}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-lg focus:scale-[1.01] text-foreground disabled:opacity-50 transition-all duration-200"
            />
          </div>

          {/* Negotiation Strength Pills */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            {(["Quick", "Standard", "Max savings"] as const).map((strength, index) => (
              <motion.button
                key={strength}
                type="button"
                onClick={() => setNegotiationStrength(strength)}
                disabled={loading}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all disabled:opacity-50 ${
                  negotiationStrength === strength
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={negotiationStrength === strength ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {strength}
              </motion.button>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full py-6 text-base font-semibold flex items-center justify-center gap-2"
            >
              <motion.div variants={floatingVariants} animate="animate">
                <Sparkles className="w-4 h-4" />
              </motion.div>
              {loading ? "Searching..." : "Find my best deal"}
            </Button>
          </motion.div>

          {/* Reassurance Line */}
          <motion.p variants={itemVariants} className="text-xs text-muted-foreground text-center">
            Powered by AI. No tech skills required.
          </motion.p>
        </motion.form>
      </div>
    </section>
  )
}
