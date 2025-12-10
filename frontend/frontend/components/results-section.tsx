"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import BestDealCard from "./best-deal-card"
import OffersGrid from "./offers-grid"
import NegotiationTimeline from "./negotiation-timeline"

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

interface ResultsSectionProps {
  data: {
    ranked_offers: RankedOffer[]
    negotiation_log: NegotiationLog[]
    ai_used: string
    best_deal: RankedOffer | Record<string, never>
  }
}

export default function ResultsSection({ data }: ResultsSectionProps) {
  const [showNegotiationLog, setShowNegotiationLog] = useState(false)
  const hasBestDeal = "agent" in data.best_deal && data.best_deal.agent

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full py-12 md:py-16"
    >
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Best Deal Card */}
        {hasBestDeal && <BestDealCard deal={data.best_deal as RankedOffer} />}

        {/* Offers Grid */}
        <OffersGrid offers={data.ranked_offers} />

        {/* Negotiation Timeline */}
        {data.negotiation_log.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => setShowNegotiationLog(!showNegotiationLog)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {showNegotiationLog ? "▼" : "▶"} See how AI negotiated for you
            </button>
            {showNegotiationLog && <NegotiationTimeline logs={data.negotiation_log} />}
          </div>
        )}
      </div>
    </motion.section>
  )
}
