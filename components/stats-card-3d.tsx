import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCard3DProps {
  title: string
  value: string
  subtitle: string
  icon: ReactNode
  gradient: string
  glowColor: string
}

export function StatsCard3D({ title, value, subtitle, icon, gradient, glowColor }: StatsCard3DProps) {
  return (
    <div className="group relative transform-gpu perspective-1000">
      <Card
        className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 cursor-pointer`}
        style={{
          transform: "perspective(1000px) rotateX(10deg) rotateY(5deg)",
          boxShadow: `0 25px 50px -12px ${glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
        }}
      >
        <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>{icon}</div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-300 text-sm font-medium" dir="auto">
              {title}
            </p>
            <p className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {value}
            </p>
            <p className="text-gray-400 text-xs" dir="auto">
              {subtitle}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
