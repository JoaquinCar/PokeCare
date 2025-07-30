"use client"

import { Heart, Zap, Apple, Shield } from "lucide-react"

interface ClassicPokemonCareStatusProps {
  pokemon: any
  className?: string
}

export function ClassicPokemonCareStatus({ pokemon, className = "" }: ClassicPokemonCareStatusProps) {
  const getOverallStatus = () => {
    const avgStat = (pokemon.happiness + pokemon.health + pokemon.energy + pokemon.hunger) / 4

    if (avgStat < 20) return { level: "critical", text: "Critical", color: "text-red-600", bgColor: "bg-red-500" }
    if (avgStat < 40) return { level: "low", text: "Poor", color: "text-orange-600", bgColor: "bg-orange-500" }
    if (avgStat < 60) return { level: "medium", text: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-500" }
    if (avgStat < 80) return { level: "good", text: "Good", color: "text-green-600", bgColor: "bg-green-500" }
    return { level: "excellent", text: "Excellent", color: "text-green-700", bgColor: "bg-green-600" }
  }

  const status = getOverallStatus()

  const stats = [
    { name: "Happiness", value: pokemon.happiness, icon: Heart, color: "bg-red-500" },
    { name: "Health", value: pokemon.health, icon: Shield, color: "bg-green-500" },
    { name: "Energy", value: pokemon.energy, icon: Zap, color: "bg-yellow-500" },
    { name: "Hunger", value: pokemon.hunger, icon: Apple, color: "bg-blue-500" },
  ]

  return (
    <div className={`${className}`}>
      {/* Classic Pokemon-style status header */}
      <div className={`${status.bgColor} text-white px-4 py-2 rounded-t-lg border-2 border-gray-800`}>
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wide">Status</span>
          <span className="font-bold uppercase">{status.text}</span>
        </div>
      </div>

      {/* Classic Pokemon-style status body */}
      <div className="bg-white border-2 border-gray-800 border-t-0 rounded-b-lg p-4">
        {/* Pokemon name */}
        <div className="text-center mb-4">
          <span className="font-bold text-xl text-gray-800 capitalize">{pokemon.pokemon_name}</span>
        </div>

        {/* Mini stat bars - classic Pokemon style */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const StatIcon = stat.icon
            const percentage = stat.value

            return (
              <div key={stat.name} className="bg-gray-100 rounded-lg p-2 border border-gray-300">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1">
                    <StatIcon className="w-3 h-3 text-gray-600" />
                    <span className="text-xs font-bold text-gray-700 uppercase">{stat.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800">{stat.value}</span>
                </div>

                {/* Mini progress bar */}
                <div className="bg-gray-300 rounded-full h-2 border border-gray-400 overflow-hidden">
                  <div
                    className={`h-full ${stat.color} transition-all duration-500 ${percentage < 25 ? "animate-pulse" : ""}`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
