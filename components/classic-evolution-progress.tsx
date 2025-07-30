"use client"

import { useEffect, useState } from "react"
import { Star, Sparkles } from "lucide-react"

interface ClassicEvolutionProgressProps {
  pokemonId: string
  pokemonName: string
  currentProgress: number
  previousProgress?: number
  activityPoints: number
  previousActivityPoints?: number
  requiredPoints: number
  className?: string
}

export function ClassicEvolutionProgress({
  pokemonId,
  pokemonName,
  currentProgress,
  previousProgress = currentProgress,
  activityPoints,
  previousActivityPoints = activityPoints,
  requiredPoints,
  className = "",
}: ClassicEvolutionProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(previousProgress)
  const [displayPoints, setDisplayPoints] = useState(previousActivityPoints)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (currentProgress !== previousProgress || activityPoints !== previousActivityPoints) {
      setIsAnimating(true)

      const duration = 1200
      const steps = 40
      const progressStep = (currentProgress - previousProgress) / steps
      const pointsStep = (activityPoints - previousActivityPoints) / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const newProgress = previousProgress + progressStep * currentStep
        const newPoints = previousActivityPoints + pointsStep * currentStep

        if (currentStep >= steps) {
          setDisplayProgress(currentProgress)
          setDisplayPoints(activityPoints)
          clearInterval(interval)
          setIsAnimating(false)
        } else {
          setDisplayProgress(Math.max(0, Math.min(100, newProgress)))
          setDisplayPoints(Math.round(Math.max(0, newPoints)))
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }
  }, [currentProgress, previousProgress, activityPoints, previousActivityPoints])

  const canEvolve = displayProgress >= 100
  const isNearEvolution = displayProgress > 75

  return (
    <div className={`${className}`} key={pokemonId}>
      {/* Classic Pokemon-style evolution header */}
      <div
        className={`bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-t-lg border-2 border-purple-800 ${canEvolve ? "animate-pulse" : ""}`}
      >
        <div className="flex items-center justify-center gap-2">
          <Sparkles className={`w-5 h-5 ${isAnimating ? "animate-spin" : ""}`} />
          <span className="font-bold uppercase tracking-wide">Evolution</span>
          {isNearEvolution && <Star className="w-5 h-5 text-yellow-300 animate-bounce" />}
        </div>
      </div>

      {/* Classic Pokemon-style evolution body */}
      <div className="bg-white border-2 border-purple-800 border-t-0 rounded-b-lg p-4">
        {/* Pokemon name */}
        <div className="text-center mb-3">
          <span className="font-bold text-gray-800 capitalize text-lg">{pokemonName}</span>
        </div>

        {/* Evolution progress bar - classic Pokemon style */}
        <div className="relative mb-3">
          <div className="bg-gray-300 rounded-full h-6 border-2 border-gray-500 overflow-hidden">
            <div
              className={`h-full transition-all duration-1200 ${
                canEvolve
                  ? "bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse"
                  : "bg-gradient-to-r from-purple-500 to-pink-500"
              } ${isAnimating ? "animate-pulse" : ""}`}
              style={{ width: `${displayProgress}%` }}
            >
              {/* Classic shine effect */}
              <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
            </div>
          </div>

          {/* Progress text overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-sm text-white drop-shadow-lg">
              {canEvolve ? "READY!" : `${displayProgress.toFixed(0)}%`}
            </span>
          </div>
        </div>

        {/* Points display - classic Pokemon style */}
        <div className="flex justify-between items-center mb-3 bg-gray-100 rounded-lg p-2 border border-gray-300">
          <span className="text-sm font-bold text-gray-700">EXP POINTS</span>
          <span className="font-bold text-gray-800">
            {displayPoints} / {requiredPoints}
          </span>
        </div>

        {/* Evolution status */}
        {canEvolve && (
          <div className="text-center bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-5 h-5 text-yellow-600 animate-bounce" />
              <span className="font-bold text-yellow-800 uppercase tracking-wide">Evolution Ready!</span>
              <Star className="w-5 h-5 text-yellow-600 animate-bounce" />
            </div>
            <p className="text-sm text-yellow-700 font-medium">{pokemonName} will evolve after the next care action!</p>
          </div>
        )}

        {isNearEvolution && !canEvolve && (
          <div className="text-center bg-purple-100 border border-purple-300 rounded-lg p-2">
            <p className="text-sm text-purple-700 font-medium">⭐ {pokemonName} is close to evolving!</p>
          </div>
        )}
      </div>
    </div>
  )
}
