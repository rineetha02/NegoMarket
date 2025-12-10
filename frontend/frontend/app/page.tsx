"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import BenefitsStrip from "@/components/benefits-strip"
import ResultsSection from "@/components/results-section"
import HowItWorksSection from "@/components/how-it-works-section"
import Footer from "@/components/footer"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/ai_negotiate"
console.log("API URL AT BUILD", API_URL)

interface RankedOffer {
  agent: string
  price: number
  details: string
}

interface NegotiationLog {
  round: number
  customer: string
  seller: string
  summary: string
}

interface ApiResponse {
  ranked_offers: RankedOffer[]
  negotiation_log: NegotiationLog[]
  ai_used: string
  best_deal: RankedOffer | Record<string, never>
}

export default function App() {
  const [query, setQuery] = useState("")
  const [negotiationStrength, setNegotiationStrength] = useState<"Quick" | "Standard" | "Max savings">("Standard")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ApiResponse | null>(null)
  const [prevData, setPrevData] = useState<ApiResponse | null>(null)

  const strengthMap = {
    Quick: 1,
    Standard: 3,
    "Max savings": 5,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setPrevData(data)
    setData(null)

    try {
      console.log("API URL AT RUNTIME", API_URL)

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          max_rounds: strengthMap[negotiationStrength],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection
          query={query}
          setQuery={setQuery}
          negotiationStrength={negotiationStrength}
          setNegotiationStrength={setNegotiationStrength}
          onSubmit={handleSubmit}
          loading={loading}
        />
        <AnimatePresence mode="wait">{!data && !error && !loading && <BenefitsStrip key="benefits" />}</AnimatePresence>

        <AnimatePresence>
          {loading && (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full py-16 flex justify-center"
            >
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.4,
                        delay: i * 0.2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  ))}
                </div>
                <p className="text-lg text-muted-foreground">Negotiating with stores and services…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mx-auto px-4 py-8"
            >
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <h3 className="font-semibold text-destructive mb-2">Something went wrong</h3>
                <p className="text-sm text-destructive/80 mb-4">
                  We had trouble fetching deals. Please try again in a moment.
                </p>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">Show technical details</summary>
                  <p className="mt-2 font-mono bg-muted p-2 rounded">{error}</p>
                </details>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">{data && <ResultsSection key={`results-${query}`} data={data} />}</AnimatePresence>
      </main>
      <HowItWorksSection />
      <Footer />
    </div>
  )
}
