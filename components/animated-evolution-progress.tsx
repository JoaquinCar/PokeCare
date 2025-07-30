"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Star, Sparkles } from "lucide-react"

interface AnimatedEvolutionProgressProps {
  progress: number
  previousProgress?: number
  activityPoints: number
  previousActivityPoints?: number
  pokemonName: string
  className?: string
}

export function AnimatedEvolutionProgress({
  progress,
  previousProgress = progress,
  activityPoints,
  previousActivityPoints = activityPoints,
  pokemonName,
  className = "",
}: AnimatedEvolutionProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(previousProgress)
  const [displayPoints, setDisplayPoints] = useState(previousActivityPoints)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showPointsGain, setShowPointsGain] = useState(false)

  useEffect(() => {
    if (progress !== previousProgress || activityPoints !== previousActivityPoints) {
      setIsAnimating(true)
      setShowPointsGain(true)

      // Animate progress change
      const duration = 1500 // 1.5 seconds
      const steps = 40
      const progressStep = (progress - previousProgress) / steps
      const pointsStep = (activityPoints - previousActivityPoints) / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const newProgress = previousProgress + progressStep * currentStep
        const newPoints = previousActivityPoints + pointsStep * currentStep

        if (currentStep >= steps) {
          setDisplayProgress(progress)
          setDisplayPoints(activityPoints)
          clearInterval(interval)
          setIsAnimating(false)

          // Hide points gain indicator
          setTimeout(() => setShowPointsGain(false), 3000)
        } else {
          setDisplayProgress(Math.max(0, newProgress))
          setDisplayPoints(Math.round(Math.max(0, newPoints)))
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }
  }, [progress, previousProgress, activityPoints, previousActivityPoints])

  const pointsGained = activityPoints - previousActivityPoints
  const isNearEvolution = displayProgress > 80
  const canEvolve = displayProgress >= 100

  return (
    <div className={`relative ${className}`}>
      <div
        className={`bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white shadow-xl rounded-lg p-4 transition-all duration-500 ${
          isAnimating ? "scale-105 shadow-2xl" : ""
        } ${canEvolve ? "animate-pulse ring-4 ring-yellow-400" : ""}`}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className={`w-5 h-5 transition-all duration-300 ${isAnimating ? "animate-spin" : ""}`} />
          <h3 className="text-lg font-bold">Evolution Progress</h3>
          {isNearEvolution && <Star className="w-5 h-5 text-yellow-300 animate-bounce" />}
        </div>

        {/* Progress Bar */}
        <div className="relative mb-3">
          <Progress
            value={displayProgress}
            className={`h-4 transition-all duration-1000 ${isAnimating ? "shadow-lg" : ""}`}
          />
          {isAnimating && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse rounded-full"></div>
          )}
          {canEvolve && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-20 animate-pulse rounded-full"></div>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span>Points:</span>
            <span className={`font-bold transition-all duration-300 ${isAnimating ? "scale-110" : ""}`}>
              {displayPoints}
            </span>
            {showPointsGain && pointsGained > 0 && (
              <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                +{pointsGained}
              </span>
            )}
          </div>
          <span
            className={`font-bold transition-all duration-300 ${
              canEvolve ? "text-yellow-300 animate-pulse text-lg" : isNearEvolution ? "text-yellow-200" : ""
            }`}
          >
            {canEvolve ? "🌟 READY TO EVOLVE! 🌟" : `${displayProgress.toFixed(1)}%`}
          </span>
        </div>

        {/* Evolution Status */}
        {canEvolve && (
          <div className="mt-2 text-center">
            <p className="text-yellow-300 font-bold animate-pulse">
              {pokemonName} is ready to evolve on the next action!
            </p>
          </div>
        )}
        {isNearEvolution && !canEvolve && (
          <div className="mt-2 text-center">
            <p className="text-yellow-200 text-sm animate-pulse">{pokemonName} is very close to evolving! ⭐</p>
          </div>
        )}
      </div>
    </div>
  )
}
