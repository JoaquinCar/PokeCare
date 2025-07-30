"use client"

import { Heart, Zap, Apple, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PokemonCareStatusProps {
  pokemon: any
  className?: string
}

export function PokemonCareStatus({ pokemon, className = "" }: PokemonCareStatusProps) {
  const getOverallStatus = () => {
    const avgStat = (pokemon.happiness + pokemon.health + pokemon.energy + pokemon.hunger) / 4

    if (avgStat < 20)
      return {
        level: "critical",
        text: "Critical Care Needed",
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
        icon: AlertTriangle,
        message: `${pokemon.pokemon_name} needs immediate attention!`,
      }
    if (avgStat < 40)
      return {
        level: "low",
        text: "Needs Care",
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        icon: Clock,
        message: `${pokemon.pokemon_name} could use some care soon.`,
      }
    if (avgStat < 60)
      return {
        level: "medium",
        text: "Doing Okay",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 border-yellow-200",
        icon: Clock,
        message: `${pokemon.pokemon_name} is doing alright.`,
      }
    if (avgStat < 80)
      return {
        level: "good",
        text: "Doing Well",
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        icon: CheckCircle,
        message: `${pokemon.pokemon_name} is in good condition!`,
      }
    return {
      level: "excellent",
      text: "Perfect Condition",
      color: "text-green-700",
      bgColor: "bg-green-50 border-green-300",
      icon: CheckCircle,
      message: `${pokemon.pokemon_name} is in perfect condition! ✨`,
    }
  }

  const getStatNeed = (statName: string, value: number) => {
    if (value < 20) return { urgency: "critical", text: "Critical", color: "text-red-600" }
    if (value < 40) return { urgency: "high", text: "Low", color: "text-orange-600" }
    if (value < 60) return { urgency: "medium", text: "Fair", color: "text-yellow-600" }
    if (value < 85) return { urgency: "low", text: "Good", color: "text-green-600" }
    return { urgency: "none", text: "Full", color: "text-green-700" }
  }

  const status = getOverallStatus()
  const StatusIcon = status.icon

  const stats = [
    { name: "Happiness", value: pokemon.happiness, icon: Heart, color: "text-red-500" },
    { name: "Health", value: pokemon.health, icon: Shield, color: "text-green-500" },
    { name: "Energy", value: pokemon.energy, icon: Zap, color: "text-yellow-500" },
    { name: "Hunger", value: pokemon.hunger, icon: Apple, color: "text-blue-500" },
  ]

  return (
    <Card className={`${status.bgColor} border-2 ${className}`}>
      <CardContent className="p-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <span className={`font-bold ${status.color}`}>{status.text}</span>
          </div>
          <span className="text-sm text-gray-600 capitalize">{pokemon.pokemon_name}</span>
        </div>

        {/* Status Message */}
        <p className={`text-sm mb-3 ${status.color}`}>{status.message}</p>

        {/* Individual Stat Needs */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat) => {
            const need = getStatNeed(stat.name, stat.value)
            const StatIcon = stat.icon

            return (
              <div key={stat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <StatIcon className={`w-3 h-3 ${stat.color}`} />
                  <span className="font-medium">{stat.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${need.color}`}>{stat.value}%</span>
                  <span className={`text-xs ${need.color}`}>({need.text})</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Care Recommendations */}
        {status.level === "critical" && (
          <div className="mt-3 p-2 bg-red-100 rounded-lg">
            <p className="text-xs text-red-700 font-medium">🚨 Feed immediately! All stats are dangerously low.</p>
          </div>
        )}
        {status.level === "low" && (
          <div className="mt-3 p-2 bg-orange-100 rounded-lg">
            <p className="text-xs text-orange-700 font-medium">⏰ Consider feeding soon to maintain good health.</p>
          </div>
        )}
        {status.level === "excellent" && (
          <div className="mt-3 p-2 bg-green-100 rounded-lg">
            <p className="text-xs text-green-700 font-medium">✨ Your Pokémon is thriving! Keep up the great care!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
