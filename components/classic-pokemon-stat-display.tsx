"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface ClassicPokemonStatDisplayProps {
  label: string
  icon: React.ReactNode
  currentValue: number
  previousValue?: number
  maxValue?: number
  color: string
  className?: string
}

export function ClassicPokemonStatDisplay({
  label,
  icon,
  currentValue,
  previousValue = currentValue,
  maxValue = 100,
  color,
  className = "",
}: ClassicPokemonStatDisplayProps) {
  const [displayValue, setDisplayValue] = useState(previousValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showChangeIndicator, setShowChangeIndicator] = useState(false)

  useEffect(() => {
    if (currentValue !== previousValue && previousValue !== undefined) {
      setIsAnimating(true)
      setShowChangeIndicator(true)

      const duration = 800
      const steps = 30
      const stepValue = (currentValue - previousValue) / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const newValue = previousValue + stepValue * currentStep

        if (currentStep >= steps) {
          setDisplayValue(currentValue)
          clearInterval(interval)
          setIsAnimating(false)
          setTimeout(() => setShowChangeIndicator(false), 2000)
        } else {
          setDisplayValue(Math.round(Math.max(0, Math.min(maxValue, newValue))))
        }
      }, duration / steps)

      return () => clearInterval(interval)
    } else {
      setDisplayValue(currentValue)
    }
  }, [currentValue, previousValue, maxValue])

  const change = currentValue - (previousValue || currentValue)
  const percentage = Math.max(0, Math.min(100, (displayValue / maxValue) * 100))

  return (
    <div className={`${className}`}>
      {/* Classic Pokemon-style header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-t-lg border-2 border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-bold text-sm uppercase tracking-wide">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg ${isAnimating ? "animate-pulse" : ""}`}>
              {Math.round(displayValue)}
            </span>
            {showChangeIndicator && change !== 0 && (
              <span
                className={`text-xs font-bold px-1 py-0.5 rounded ${
                  change > 0 ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"
                } animate-bounce`}
              >
                {change > 0 ? "+" : ""}
                {change}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Classic Pokemon-style stat bar */}
      <div className="bg-white border-2 border-blue-800 border-t-0 rounded-b-lg p-3">
        <div className="relative">
          <div className="bg-gray-300 rounded-full h-4 border-2 border-gray-400 overflow-hidden">
            <div
              className={`h-full transition-all duration-800 ${color} ${
                isAnimating ? "animate-pulse" : ""
              } ${percentage < 25 ? "animate-pulse" : ""}`}
              style={{ width: `${percentage}%` }}
            >
              {/* Classic Pokemon stat bar shine effect */}
              <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>

          {/* HP-style fraction display */}
          <div className="flex justify-between items-center mt-1 text-xs font-bold text-gray-700">
            <span>HP</span>
            <span>
              {Math.round(displayValue)} / {maxValue}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-2 text-center">
          {percentage >= 80 && (
            <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded-full">● EXCELLENT</span>
          )}
          {percentage >= 50 && percentage < 80 && (
            <span className="text-yellow-600 font-bold text-xs bg-yellow-100 px-2 py-1 rounded-full">● GOOD</span>
          )}
          {percentage >= 25 && percentage < 50 && (
            <span className="text-orange-600 font-bold text-xs bg-orange-100 px-2 py-1 rounded-full">● FAIR</span>
          )}
          {percentage < 25 && (
            <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded-full animate-pulse">
              ● CRITICAL
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
