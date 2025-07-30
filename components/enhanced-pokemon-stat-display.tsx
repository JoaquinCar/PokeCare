"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface EnhancedPokemonStatDisplayProps {
  label: string
  icon: React.ReactNode
  currentValue: number
  previousValue?: number
  maxValue?: number
  className?: string
}

export function EnhancedPokemonStatDisplay({
  label,
  icon,
  currentValue,
  previousValue = currentValue,
  maxValue = 100,
  className = "",
}: EnhancedPokemonStatDisplayProps) {
  const [displayValue, setDisplayValue] = useState(previousValue)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showChangeIndicator, setShowChangeIndicator] = useState(false)
  const [isDecreasing, setIsDecreasing] = useState(false)

  useEffect(() => {
    if (currentValue !== previousValue && previousValue !== undefined) {
      setIsAnimating(true)
      setShowChangeIndicator(true)
      setIsDecreasing(currentValue < previousValue)

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

  const getStatusInfo = (value: number) => {
    if (value >= 80) return { text: "Excellent", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle }
    if (value >= 60) return { text: "Good", color: "text-green-500", bgColor: "bg-green-50", icon: CheckCircle }
    if (value >= 40) return { text: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: Clock }
    if (value >= 20) return { text: "Poor", color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertTriangle }
    return { text: "Critical", color: "text-red-600", bgColor: "bg-red-50", icon: AlertTriangle }
  }

  const getProgressColor = (value: number) => {
    if (value >= 70) return "bg-green-500"
    if (value >= 40) return "bg-yellow-500"
    if (value >= 20) return "bg-orange-500"
    return "bg-red-500"
  }

  const statusInfo = getStatusInfo(displayValue)
  const StatusIcon = statusInfo.icon

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold transition-all duration-300 ${
              isAnimating ? "scale-110" : ""
            } ${isDecreasing ? "text-red-600" : "text-blue-600"}`}
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
          className={`h-3 transition-all duration-1200 ${
            isAnimating ? "shadow-lg ring-2 ring-blue-200" : ""
          } ${displayValue < 30 ? "animate-pulse" : ""}`}
        />
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse rounded-full"></div>
        )}
        {displayValue < 20 && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-20 animate-pulse rounded-full"></div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs mt-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}>
          <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
          <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
        </div>
        <span className="text-gray-500">
          {Math.round(displayValue)}/{maxValue}
        </span>
      </div>

      {/* Visual indicator for low stats */}
      {displayValue < 30 && (
        <div className="mt-1 text-center">
          <span className="text-xs text-red-600 font-medium animate-pulse">⚠️ Needs attention!</span>
        </div>
      )}
    </div>
  )
}
