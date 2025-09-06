import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface Card3DProps {
  children: ReactNode
  className?: string
}

export function Card3D({ children, className = "" }: Card3DProps) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <Card
        className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl hover:scale-[1.02] transition-all duration-300 ${className}`}
        style={{
          transform: "perspective(1000px) rotateX(5deg) rotateY(2deg)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <div className="relative z-10">{children}</div>
      </Card>
    </div>
  )
}
