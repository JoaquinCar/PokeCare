"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Heart, Zap, Apple, Trash2, Star, Users } from "lucide-react"
import { GameStateManager } from "@/lib/game-state-manager"
import { AuthManager } from "@/lib/auth"

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

    if (team.length === 0) {
      router.push("/dashboard")
      return
    }

    setAdoptedTeam(team)

    const unsubscribe = gameState.subscribe(() => {
      const newTeam = gameState.getAdoptedTeam()
      setAdoptedTeam(newTeam)
    })

    return unsubscribe
  }, [router])

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleCareClick = () => {
    router.push("/care")
  }

  const handleRelease = async (pokemonTeamId: string) => {
    if (confirm("Are you sure you want to release this Pokémon? This action cannot be undone.")) {
      const gameState = GameStateManager.getInstance()
      await gameState.releasePokemon(pokemonTeamId)
    }
  }

  const getStatColor = (value: number) => {
    if (value >= 70) return "bg-green-500"
    if (value >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (!user || adoptedTeam.length === 0) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative">
      {/* Pokémon GO style background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-48 h-48 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-60 right-32 w-36 h-36 bg-pink-300 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-52 h-52 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-green-300 rounded-full animate-bounce"></div>
      </div>

      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBack}
                variant="outline"
                className="rounded-full border-2 border-gray-300 hover:border-blue-400 bg-white shadow-md"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Your Pokémon Team</h1>
                <p className="text-gray-600">Manage and care for your Pokémon</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border-2 border-gray-200">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-gray-700">Team: {adoptedTeam.length}/6</span>
              </div>
              <Button
                onClick={handleCareClick}
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md"
              >
                <Heart className="w-4 h-4 mr-2" />
                Care
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adoptedTeam.map((pokemon) => (
              <Card
                key={pokemon.id}
                className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-2xl"
              >
                <CardHeader className="text-center relative">
                  <div className="absolute top-2 right-2">
                    <Button
                      onClick={() => handleRelease(pokemon.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-300 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <div
                      className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        pokemon.is_mega_evolved
                          ? "bg-gradient-to-br from-purple-200 to-pink-200 shadow-2xl border-4 border-purple-400"
                          : "bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg"
                      }`}
                    >
                      <img
                        src={
                          pokemon.pokemon_data?.animatedSprite ||
                          pokemon.pokemon_data?.sprites?.front_default ||
                          "/placeholder.svg?height=100&width=100" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={pokemon.pokemon_name}
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                    {pokemon.is_mega_evolved && (
                      <div className="absolute -top-2 -left-2 animate-pulse">
                        <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">MEGA</div>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl capitalize text-gray-800">{pokemon.pokemon_name}</CardTitle>
                  <p className="text-gray-600">#{pokemon.pokemon_id.toString().padStart(3, "0")}</p>
                  <div className="flex justify-center gap-2 mt-2">
                    {pokemon.pokemon_data?.types?.map((type: any) => (
                      <Badge
                        key={type.type.name}
                        className="text-white text-sm font-semibold"
                        style={{ backgroundColor: typeColors[type.type.name] || "#68A090" }}
                      >
                        {type.type.name}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-500" />
                          Happiness
                        </span>
                        <span className="text-sm font-bold">{pokemon.happiness}%</span>
                      </div>
                      <Progress value={pokemon.happiness} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <span className="text-green-500">💚</span>
                          Health
                        </span>
                        <span className="text-sm font-bold">{pokemon.health}%</span>
                      </div>
                      <Progress value={pokemon.health} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          Energy
                        </span>
                        <span className="text-sm font-bold">{pokemon.energy}%</span>
                      </div>
                      <Progress value={pokemon.energy} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Apple className="w-4 h-4 text-green-600" />
                          Hunger
                        </span>
                        <span className="text-sm font-bold">{pokemon.hunger}%</span>
                      </div>
                      <Progress value={pokemon.hunger} className="h-2" />
                    </div>
                  </div>

                  {/* Evolution Progress */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Star className="w-4 h-4 text-purple-500" />
                        Evolution Progress
                      </span>
                      <span className="text-sm font-bold">
                        {GameStateManager.getInstance().getEvolutionProgress(pokemon.id).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={GameStateManager.getInstance().getEvolutionProgress(pokemon.id)} className="h-2" />
                    <p className="text-xs text-gray-600 mt-1">Activity Points: {pokemon.activity_points}</p>
                  </div>

                  {/* Stats Summary */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Total Actions: {pokemon.total_actions}</div>
                    <div>Level: {Math.floor(pokemon.activity_points / 50) + 1}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Care Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleCareClick}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-lg text-lg px-8 py-3"
            >
              <Heart className="w-5 h-5 mr-2" />
              Care for Your Team
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
