"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Zap, Apple, Trash2, Star, Users, Shield } from "lucide-react"
import { GameStateManager } from "@/lib/game-state-manager"
import { AuthManager } from "@/lib/auth"
import { ClassicButton, ClassicCard, ClassicHeader } from "@/components/classic-pokemon-ui"
import { pokemonTheme, pokemonTypeColors } from "@/lib/pokemon-theme"
// import { ReleaseConfirmationDialog } from "@/components/release-confirmation-dialog" // No longer needed here
// import { useToast } from "@/components/ui/use-toast" // No longer needed here

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

export default function TeamPage() {
  const router = useRouter()
  const [adoptedTeam, setAdoptedTeam] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  // Removed states related to release dialog and loading
  // const [releasingPokemon, setReleasingPokemon] = useState<string | null>(null)
  // const [releaseError, setReleaseError] = useState<string | null>(null)
  // const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  // const [pokemonToReleaseId, setPokemonToReleaseId] = useState<string | null>(null)
  // const [pokemonToReleaseName, setPokemonToReleaseName] = useState<string | null>(null)
  // const { toast } = useToast() // Removed toast as it's now in release page

  useEffect(() => {
    const authManager = AuthManager.getInstance()
    const currentUser = authManager.getCurrentUser()

    if (!currentUser) {
      router.push("/")
      return
    }

    setUser(currentUser)

    const gameState = GameStateManager.getInstance()
    const team = gameState.getAdoptedTeam()

    // If team is empty on initial load, redirect to dashboard
    if (team.length === 0) {
      router.push("/dashboard")
      return
    }

    setAdoptedTeam(team)

    const unsubscribe = gameState.subscribe(() => {
      const newTeam = gameState.getAdoptedTeam()
      setAdoptedTeam(newTeam)
      // If the team becomes empty after a release, redirect to dashboard
      if (newTeam.length === 0) {
        console.log("[TeamPage] Team is now empty, redirecting to dashboard.")
        router.push("/dashboard")
      }
    })

    return unsubscribe
  }, [router])

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleCareClick = () => {
    router.push("/care")
  }

  const handleReleaseClick = () => {
    router.push("/release") // Navigate to the new release page
  }

  if (!user || adoptedTeam.length === 0) return null

  return (
    <div className={`min-h-screen bg-gradient-to-br ${pokemonTheme.colors.backgrounds.primary} relative`}>
      {/* Classic Pokemon background */}
      <div className="fixed inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-400 rounded-full border-4 border-yellow-600 animate-pulse"></div>
        <div className="absolute top-60 right-32 w-32 h-32 bg-red-400 rounded-full border-4 border-red-600 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-green-400 rounded-full border-4 border-green-600 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-purple-400 rounded-full border-4 border-purple-600 animate-bounce"></div>
      </div>

      <ClassicHeader
        title="Your Pokémon Team"
        subtitle="Manage and care for your Pokémon companions"
        variant="primary"
        actions={
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg px-4 py-2 border-2 border-blue-900 shadow-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className={`${pokemonTheme.typography.button} text-blue-800`}>
                  Equipo: {adoptedTeam.length}/6
                </span>
              </div>
            </div>

            <ClassicButton onClick={handleBack} variant="accent" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </ClassicButton>

            <ClassicButton onClick={handleCareClick} variant="secondary" size="md">
              <Heart className="w-4 h-4 mr-2" />
              Cuidar
            </ClassicButton>
            <ClassicButton onClick={handleReleaseClick} variant="danger" size="md">
              <Trash2 className="w-4 h-4 mr-2" />
              Liberar Pokémon
            </ClassicButton>
          </div>
        }
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Removed releaseError display from here */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adoptedTeam.map((pokemon) => (
              <ClassicCard key={pokemon.id} variant="primary" className="hover:shadow-2xl transition-all duration-300">
                <div className="text-center relative">
                  {/* Removed individual delete button */}

                  <div className="relative mb-4">
                    <div
                      className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center border-4 ${
                        pokemon.is_mega_evolved
                          ? "bg-gradient-to-br from-purple-200 to-pink-200 border-purple-600 shadow-2xl"
                          : "bg-gradient-to-br from-blue-100 to-purple-100 border-blue-600 shadow-lg"
                      }`}
                    >
                      <img
                        src={
                          pokemon.pokemon_data?.animatedSprite ||
                          pokemon.pokemon_data?.sprites?.front_default ||
                          "/placeholder.svg?height=100&width=100" ||
                          "/placeholder.svg"
                        }
                        alt={pokemon.pokemon_name}
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                    {pokemon.is_mega_evolved && (
                      <div className="absolute -top-2 -left-2">
                        <div className="bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold border-2 border-purple-800">
                          MEGA
                        </div>
                      </div>
                    )}
                  </div>

                  <h3 className={`${pokemonTheme.typography.heading} text-xl capitalize text-gray-800 mb-2`}>
                    {pokemon.pokemon_name}
                  </h3>
                  <p className="text-gray-600 mb-3">#{pokemon.pokemon_id.toString().padStart(3, "0")}</p>

                  <div className="flex justify-center gap-2 mb-4">
                    {pokemon.pokemon_data?.types?.map((type: any) => (
                      <div
                        key={type.type.name}
                        className="text-white text-sm font-bold px-2 py-1 rounded-lg border-2 border-gray-800"
                        style={{ backgroundColor: pokemonTypeColors[type.type.name] || "#68A090" }}
                      >
                        {type.type.name.toUpperCase()}
                      </div>
                    ))}
                  </div>

                  {/* Stats Display */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          Felicidad
                        </span>
                        <span className="text-sm font-bold">{pokemon.happiness}%</span>
                      </div>
                      <div className="bg-gray-300 rounded-full h-2 border border-gray-400 overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all duration-500"
                          style={{ width: `${pokemon.happiness}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Shield className="w-4 h-4 text-green-500" />
                          Salud
                        </span>
                        <span className="text-sm font-bold">{pokemon.health}%</span>
                      </div>
                      <div className="bg-gray-300 rounded-full h-2 border border-gray-400 overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all duration-500"
                          style={{ width: `${pokemon.health}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          Energía
                        </span>
                        <span className="text-sm font-bold">{pokemon.energy}%</span>
                      </div>
                      <div className="bg-gray-300 rounded-full h-2 border border-gray-400 overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 transition-all duration-500"
                          style={{ width: `${pokemon.energy}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Apple className="w-4 h-4 text-blue-500" />
                          Hambre
                        </span>
                        <span className="text-sm font-bold">{pokemon.hunger}%</span>
                      </div>
                      <div className="bg-gray-300 rounded-full h-2 border border-gray-400 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${pokemon.hunger}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Evolution Progress */}
                  <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-purple-600" />
                        Evolución
                      </span>
                      <span className="text-sm font-bold">
                        {GameStateManager.getInstance().getEvolutionProgress(pokemon.id).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-gray-300 rounded-full h-2 border border-gray-400 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${GameStateManager.getInstance().getEvolutionProgress(pokemon.id)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-purple-700 mt-1 font-medium">Puntos: {pokemon.activity_points}</p>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-600">
                    <div className="bg-gray-100 rounded p-2 border border-gray-300">
                      <span className="font-medium">Acciones: {pokemon.total_actions}</span>
                    </div>
                    <div className="bg-gray-100 rounded p-2 border border-gray-300">
                      <span className="font-medium">Nivel: {Math.floor(pokemon.activity_points / 50) + 1}</span>
                    </div>
                  </div>
                </div>
              </ClassicCard>
            ))}
          </div>

          {/* Care Button */}
          <div className="mt-8 text-center">
            <ClassicButton onClick={handleCareClick} variant="secondary" size="lg" className="px-8 py-4">
              <Heart className="w-5 h-5 mr-2" />
              Cuidar a tu Equipo
            </ClassicButton>
          </div>
        </div>
      </main>

      {/* Removed Release Confirmation Dialog from here */}
    </div>
  )
}
