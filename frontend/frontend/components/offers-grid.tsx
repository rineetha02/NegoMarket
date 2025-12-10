"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DollarSign, FileText, ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

interface OffersGridProps {
  offers: Array<{
    agent: string
    price: number
    details: string
  }>
}

export default function OffersGrid({ offers }: OffersGridProps) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg space-y-2">
        <h3 className="font-semibold text-foreground">No deals found yet</h3>
        <p className="text-sm text-muted-foreground">
          Try adjusting your budget, city, or description. AI can work with many types of products and services.
        </p>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">All offers</h2>
        <span className="text-xs text-muted-foreground">Cheapest first</span>
      </div>

      <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
        {offers.map((offer, idx) => {
          const firstLetter = offer.agent.charAt(0).toUpperCase()
          const detailsSnippet = offer.details.split("\n")[0].substring(0, 100)

          return (
            <motion.div
              key={idx}
              variants={rowVariants}
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-foreground font-semibold text-sm">
                    {firstLetter}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border">
                  <ShoppingBag className="w-3 h-3 text-primary" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{offer.agent}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-muted-foreground truncate">{detailsSnippet}</p>
                </div>
              </div>

              <div className="flex-shrink-0 text-right flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" />
                <div className="text-lg md:text-xl font-bold text-primary">{offer.price.toFixed(2)}</div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
