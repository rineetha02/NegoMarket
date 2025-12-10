"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface BestDealCardProps {
  deal: {
    agent: string
    price: number
    details: string
  }
}

export default function BestDealCard({ deal }: BestDealCardProps) {
  const firstLetter = deal.agent.charAt(0).toUpperCase()
  const detailsSnippet = deal.details.split("\n")[0].substring(0, 150)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-primary/5 border-2 border-primary rounded-xl p-6 md:p-8 space-y-4"
    >
      {/* Badge and Header */}
      <div className="flex items-center gap-3">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
          Best deal
        </span>
      </div>

      {/* Content */}
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">{firstLetter}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-foreground">{deal.agent}</h3>
          <p className="text-sm text-muted-foreground">{detailsSnippet}</p>
          <p className="text-xs text-muted-foreground italic">AI compared multiple options to pick this for you.</p>
        </div>

        <div className="text-right">
          <div className="text-3xl md:text-4xl font-bold text-primary">${deal.price.toFixed(2)}</div>
        </div>
      </div>
    </motion.div>
  )
}
