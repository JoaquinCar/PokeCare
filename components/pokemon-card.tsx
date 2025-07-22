"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"

const typeColors: { [key: string]: string } = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
}

interface PokemonCardProps {
  pokemon: any
  onAdopt?: (pokemon: any) => void
  isAdopted?: boolean
  showAdoptButton?: boolean
  className?: string
}

export function PokemonCard({
  pokemon,
  onAdopt,
  isAdopted = false,
  showAdoptButton = true,
  className = "",
}: PokemonCardProps) {
  return (
    <Card
      className={`relative overflow-hidden hover:scale-105 transition-all duration-300 bg-white shadow-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl ${className}`}
    >
      {/* Pokemon Number Badge */}
      <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
        #{pokemon.id.toString().padStart(3, "0")}
      </div>

      {/* Rarity Stars */}
      {pokemon.id <= 151 && (
        <div className="absolute top-2 left-2 flex z-10">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
        </div>
      )}

      <CardContent className="p-4">
        {/* Pokemon Image */}
        <div className="relative mb-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center shadow-inner">
            <img
              src={pokemon.animatedSprite || pokemon.sprites?.front_default || "/placeholder.svg?height=80&width=80"}
              alt={pokemon.name}
              className="w-20 h-20 object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Pokemon Name */}
        <h3 className="text-lg font-bold text-center capitalize mb-3 text-gray-800">{pokemon.name}</h3>

        {/* Pokemon Types */}
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {pokemon.types?.map((type: any) => (
            <Badge
              key={type.type.name}
              className="text-white text-xs font-semibold px-2 py-1 rounded-full"
              style={{ backgroundColor: typeColors[type.type.name] || "#68A090" }}
            >
              {type.type.name.toUpperCase()}
            </Badge>
          ))}
        </div>

        {/* Adopt Button */}
        {showAdoptButton && (
          <Button
            onClick={() => onAdopt?.(pokemon)}
            disabled={isAdopted}
            className={`w-full rounded-full font-bold transition-all duration-200 ${
              isAdopted
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <Heart className="w-4 h-4 mr-2" />
            {isAdopted ? "In Team" : "Adopt"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
