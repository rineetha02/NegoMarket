"use client"

export default function Header() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works")
    element?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold text-primary">US AI Marketplace</div>
        <button
          onClick={scrollToHowItWorks}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          How it works
        </button>
      </div>
    </header>
  )
}
