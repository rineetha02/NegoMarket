"use client"

import { Tag, Grid3X3, PiggyBank } from "lucide-react"
import { motion } from "framer-motion"

export default function BenefitsStrip() {
  const benefits = [
    {
      title: "Always get a better offer",
      description: "AI negotiates with multiple stores and providers for you.",
      icon: Tag,
    },
    {
      title: "Works for anything",
      description: "Phones, laptops, haircuts, repairs—just describe what you want.",
      icon: Grid3X3,
    },
    {
      title: "Save time and money",
      description: "Skip calling around and comparing tabs. Let AI do the work.",
      icon: PiggyBank,
    },
  ]

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  }

  return (
    <section className="w-full py-12 md:py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={idx}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="text-center space-y-3 p-4 rounded-lg transition-shadow hover:shadow-md"
              >
                <motion.div
                  className="flex justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
