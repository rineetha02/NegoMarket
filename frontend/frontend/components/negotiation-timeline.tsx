"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface NegotiationTimelineProps {
  logs: Array<{
    round: number
    customer: string
    seller: string
    summary: string
  }>
}

export default function NegotiationTimeline({ logs }: NegotiationTimelineProps) {
  const [isOpen, setIsOpen] = useState(true)

  const containerVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors"
      >
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
        How AI negotiated for you
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="bg-muted/20 border border-border rounded-lg p-6 space-y-6 overflow-hidden"
          >
            {logs.map((log, idx) => (
              <motion.div
                key={idx}
                custom={idx}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="relative space-y-2"
              >
                {/* Timeline Dot */}
                {idx < logs.length - 1 && (
                  <div className="absolute left-0 top-8 w-0.5 h-full bg-border transform -translate-x-1/2" />
                )}
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 rounded-full bg-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      Round {log.round} — Talked to {log.seller}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">{log.summary}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
