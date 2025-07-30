"use client"

import { useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { pokemonTheme, pokemonTypeColors } from "@/lib/pokemon-theme"

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
  const [isAdopting, setIsAdopting] = useState(false)

  const handleAdopt = async () => {
    if (isAdopting || isAdopted || !onAdopt) return

    setIsAdopting(true)
    await onAdopt(pokemon)
    setIsAdopting(false)
  }

  return (
    <div
      className={`relative overflow-hidden transform hover:scale-105 active:scale-95 transition-all duration-300 bg-white shadow-xl border-2 border-gray-800 hover:border-blue-500 hover:shadow-2xl rounded-lg ${className}`}
    >
      {/* Pokemon Number Badge */}
      <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg font-bold z-10 border border-gray-600">
        #{pokemon.id.toString().padStart(3, "0")}
      </div>

      <div className="p-4">
        {/* Pokemon Image */}
        <div className="relative mb-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center shadow-inner border-2 border-gray-300">
            <img
              src={pokemon.animatedSprite || pokemon.sprites?.front_default || "/placeholder.svg?height=80&width=80"}
              alt={pokemon.name}
              className="w-20 h-20 object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Pokemon Name */}
        <h3 className={`${pokemonTheme.typography.heading} text-lg text-center capitalize mb-3 text-gray-800`}>
          {pokemon.name}
        </h3>

        {/* Pokemon Types */}
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {pokemon.types?.map((type: any) => (
            <div
              key={type.type.name}
              className="text-white text-xs font-bold px-2 py-1 rounded-lg border-2 border-gray-800"
              style={{ backgroundColor: pokemonTypeColors[type.type.name] || "#68A090" }}
            >
              {type.type.name.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Adopt Button */}
        {showAdoptButton && (
          <button
            onClick={handleAdopt}
            disabled={isAdopted || isAdopting}
            className={`w-full rounded-lg font-bold transition-all duration-300 active:scale-90 hover:scale-105 border-2 py-2 px-4 ${
              isAdopted
                ? "bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-green-800 text-white"
                : "bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 border-blue-800 text-white shadow-lg hover:shadow-xl"
            } ${pokemonTheme.typography.button} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAdopting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                Adding...
              </>
            ) : isAdopted ? (
              <>
                <Heart className="w-4 h-4 mr-2 inline" />
                In Team
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2 inline" />
                Adopt
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
