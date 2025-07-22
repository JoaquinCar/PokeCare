"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Star } from "lucide-react"

interface EvolutionNotificationProps {
  pokemonName: string
  isVisible: boolean
  onClose: () => void
}

export function EvolutionNotification({ pokemonName, isVisible, onClose }: EvolutionNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl animate-bounce max-w-md mx-4">
        <CardContent className="p-8 text-center">
          <div className="relative mb-6">
            <Star className="w-16 h-16 mx-auto text-white animate-spin" />
            <Sparkles className="w-8 h-8 absolute -top-2 -right-2 animate-pulse" />
            <Sparkles className="w-6 h-6 absolute -bottom-1 -left-1 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-4">¡EVOLUCIÓN!</h2>
          <p className="text-xl mb-2">¡{pokemonName} ha evolucionado!</p>
          <p className="text-lg opacity-90">¡Tu Pokémon se ha vuelto más fuerte!</p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
