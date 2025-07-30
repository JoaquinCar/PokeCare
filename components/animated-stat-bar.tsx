"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

interface AnimatedStatBarProps {
  label: string
  icon: React.ReactNode
  value: number
  previousValue?: number
  maxValue?: number
  color?: string
  showChange?: boolean
  className?: string
}

export function AnimatedStatBar({
  label,
  icon,
  value,
  previousValue = value,
  maxValue = 100,
  color = "bg-blue-500",
  showChange = false,
  className = "",
}: AnimatedStatBarProps) {
  const [displayValue, setDisplayValue] = useState(previousValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showChangeIndicator, setShowChangeIndicator] = useState(false)

  useEffect(() => {
    if (value !== previousValue) {
      setIsAnimating(true)
      setShowChangeIndicator(true)

      // Animate the value change
      const duration = 1000 // 1 second
      const steps = 30
      const stepValue = (value - previousValue) / steps
      let currentStep = 0

      const interval = setInterval(() => {
        currentStep++
        const newValue = previousValue + stepValue * currentStep

        if (currentStep >= steps) {
          setDisplayValue(value)
          clearInterval(interval)
          setIsAnimating(false)

          // Hide change indicator after animation
          setTimeout(() => setShowChangeIndicator(false), 2000)
        } else {
          setDisplayValue(Math.round(newValue))
        }
      }, duration / steps)

      return () => clearInterval(interval)
    }
  }, [value, previousValue])

  const change = value - previousValue
  const percentage = (displayValue / maxValue) * 100

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold transition-all duration-300 ${isAnimating ? "scale-110 text-green-600" : ""}`}
          >
            {displayValue}%
          </span>
          {showChange && showChangeIndicator && change !== 0 && (
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
        <Progress value={percentage} className={`h-3 transition-all duration-1000 ${isAnimating ? "shadow-lg" : ""}`} />
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse rounded-full"></div>
        )}
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span
          className={`${displayValue >= 70 ? "text-green-600" : displayValue >= 40 ? "text-yellow-600" : "text-red-600"}`}
        >
          {displayValue >= 80
            ? "Excellent"
            : displayValue >= 60
              ? "Good"
              : displayValue >= 40
                ? "Fair"
                : displayValue >= 20
                  ? "Poor"
                  : "Critical"}
        </span>
      </div>
    </div>
  )
}
