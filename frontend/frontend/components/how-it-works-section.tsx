"use client"

import { MessageCircle, Bot, BadgeCheck } from "lucide-react"
import { motion, type Variants } from "framer-motion"


export default function HowItWorksSection() {
  const steps = [
    {
      title: "Describe what you want",
      description: "Any product or service.",
      icon: MessageCircle,
    },
    {
      title: "Our AI negotiates",
      description: "With multiple US stores and providers.",
      icon: Bot,
    },
    {
      title: "You see the best deal",
      description: "And other options ranked by price.",
      icon: BadgeCheck,
    },
  ]

  const stepVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  }

  return (
    <section id="how-it-works" className="w-full py-12 md:py-16 bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">How it works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <motion.div
                key={idx}
                custom={idx}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="text-center space-y-4 p-4 rounded-lg transition-shadow hover:shadow-md"
              >
                <motion.div
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center mx-auto"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
