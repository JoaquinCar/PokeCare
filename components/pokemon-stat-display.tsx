"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface PokemonStatDisplayProps {
  label: string
  icon: React.ReactNode
  currentValue: number
  previousValue?: number
  maxValue?: number
  color?: string
  className?: string
}

export function PokemonStatDisplay({
  label,
  icon,
  currentValue,
  previousValue = currentValue,
  maxValue = 100,
  color = "bg-blue-500",
  className = "",
}: PokemonStatDisplayProps) {
  const [displayValue, setDisplayValue] = useState(previousValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showChangeIndicator, setShowChangeIndicator] = useState(false)

  useEffect(() => {
    if (currentValue !== previousValue && previousValue !== undefined) {
      setIsAnimating(true)
      setShowChangeIndicator(true)

      // Animate the value change
      const duration = 1200 // 1.2 seconds
      const steps = 40
      const stepValue = (currentValue - previousValue) / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const newValue = previousValue + stepValue * currentStep

        if (currentStep >= steps) {
          setDisplayValue(currentValue)
          clearInterval(interval)
          setIsAnimating(false)

          // Hide change indicator after animation
          setTimeout(() => setShowChangeIndicator(false), 2500)
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

  const getStatusText = (value: number) => {
    if (value >= 80) return "Excellent"
    if (value >= 60) return "Good"
    if (value >= 40) return "Fair"
    if (value >= 20) return "Poor"
    return "Critical"
  }

  const getStatusColor = (value: number) => {
    if (value >= 70) return "text-green-600"
    if (value >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold transition-all duration-300 ${isAnimating ? "scale-110 text-blue-600" : ""}`}
          >
            {Math.round(displayValue)}%
          </span>
          {showChangeIndicator && change !== 0 && (
            <span
              className={`text-xs font-bold px-2 py-1 rounded-full animate-bounce ${
                change > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <Progress
          value={percentage}
          className={`h-3 transition-all duration-1200 ${isAnimating ? "shadow-lg ring-2 ring-blue-200" : ""}`}
        />
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse rounded-full"></div>
        )}
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className={`font-medium ${getStatusColor(displayValue)}`}>{getStatusText(displayValue)}</span>
        <span className="text-gray-500">
          {Math.round(displayValue)}/{maxValue}
        </span>
      </div>
    </div>
  )
}
