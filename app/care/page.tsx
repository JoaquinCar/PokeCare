"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Zap, Apple, Star, Sparkles, Users, Cherry, Pill, Candy } from "lucide-react"
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

export default function CarePage() {
  const router = useRouter()
  const [adoptedTeam, setAdoptedTeam] = useState<any[]>([])
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [showEvolutionNotification, setShowEvolutionNotification] = useState(false)
  const [showMegaEvolutionNotification, setShowMegaEvolutionNotification] = useState(false)

  useEffect(() => {
    const authManager = AuthManager.getInstance()
    if (!authManager.getCurrentUser()) {
      router.push("/")
      return
    }

    const gameState = GameStateManager.getInstance()
    const team = gameState.getAdoptedTeam()

    if (team.length === 0) {
      router.push("/dashboard")
      return
    }

    setAdoptedTeam(team)
    setSelectedPokemon(team[0]) // Default to first Pokemon

    const unsubscribe = gameState.subscribe(() => {
      const newTeam = gameState.getAdoptedTeam()
      setAdoptedTeam(newTeam)

      if (selectedPokemon) {
        const updatedPokemon = newTeam.find((p) => p.id === selectedPokemon.id)
        if (updatedPokemon) {
          setSelectedPokemon(updatedPokemon)
        }
      }
    })

    return unsubscribe
  }, [router])

  const handleFeed = async (foodType: "berry" | "potion" | "candy") => {
    if (isAnimating || !selectedPokemon) return

    setIsAnimating(true)
    const gameState = GameStateManager.getInstance()

    let feedMessage = ""
    switch (foodType) {
      case "berry":
        feedMessage = `${selectedPokemon.pokemon_name} enjoyed the delicious berry! 🍓`
        break
      case "potion":
        feedMessage = `${selectedPokemon.pokemon_name} feels refreshed after the potion! 🧪`
        break
      case "candy":
        feedMessage = `${selectedPokemon.pokemon_name} is thrilled with the rare candy! 🍬`
        break
    }

    const result = await gameState.feedPokemon(selectedPokemon.id, foodType)

    if (result.success) {
      setMessage(feedMessage)

      // Show evolution notification
      if (result.evolved) {
        setShowEvolutionNotification(true)
        setTimeout(() => setShowEvolutionNotification(false), 5000)
      }

      // Show mega evolution notification
      if (result.megaEvolved) {
        setShowMegaEvolutionNotification(true)
        setTimeout(() => setShowMegaEvolutionNotification(false), 5000)
      }
    } else {
      setMessage("Something went wrong while feeding your Pokémon.")
    }

    setTimeout(() => {
      setIsAnimating(false)
      setMessage("")
    }, 3000)
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleTeamClick = () => {
    router.push("/team")
  }

  if (!selectedPokemon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your Pokémon</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative">
      {/* Pokémon GO style background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-60 right-20 w-32 h-32 bg-pink-300 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-green-300 rounded-full animate-bounce"></div>
      </div>

      {/* Evolution Notification */}
      {showEvolutionNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl border-2 border-yellow-600">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2" />
              <h3 className="text-xl font-bold">¡{selectedPokemon.pokemon_name} has evolved!</h3>
              <p>Your Pokémon has become stronger!</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mega Evolution Notification */}
      {showMegaEvolutionNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl border-2 border-purple-600">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 animate-spin" />
              <h3 className="text-xl font-bold">¡MEGA EVOLUTION!</h3>
              <p>{selectedPokemon.pokemon_name} has Mega Evolved!</p>
            </CardContent>
          </Card>
        </div>
      )}

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
              <Button
                onClick={handleTeamClick}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md"
              >
                <Users className="w-4 h-4 mr-2" />
                Team
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border-2 border-gray-200">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-gray-700">Team: {adoptedTeam.length}/6</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Team Selection */}
          <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Select Pokémon to Care For</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {adoptedTeam.map((pokemon) => (
                  <div
                    key={pokemon.id}
                    onClick={() => setSelectedPokemon(pokemon)}
                    className={`flex-shrink-0 cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedPokemon?.id === pokemon.id
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <img
                      src={
                        pokemon.pokemon_data?.animatedSprite ||
                        pokemon.pokemon_data?.sprites?.front_default ||
                        "/placeholder.svg?height=60&width=60" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={pokemon.pokemon_name}
                      className="w-16 h-16 mx-auto mb-2"
                    />
                    <p className="text-sm font-bold text-center capitalize">{pokemon.pokemon_name}</p>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>❤️</span>
                        <span>{pokemon.happiness}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>💚</span>
                        <span>{pokemon.health}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Pokémon Display */}
          <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-2 border-gray-200">
            <CardContent className="text-center py-8">
              <div className={`transition-all duration-500 ${isAnimating ? "scale-110 rotate-12" : "scale-100"}`}>
                <div className="relative inline-block">
                  <div
                    className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      selectedPokemon.is_mega_evolved
                        ? "bg-gradient-to-br from-purple-200 to-pink-200 shadow-2xl border-4 border-purple-400"
                        : "bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg"
                    }`}
                  >
                    <img
                      src={
                        selectedPokemon.pokemon_data?.animatedSprite ||
                        selectedPokemon.pokemon_data?.sprites?.front_default ||
                        "/placeholder.svg?height=150&width=150" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={selectedPokemon.pokemon_name}
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  {GameStateManager.getInstance().getEvolutionProgress(selectedPokemon.id) > 80 && (
                    <div className="absolute -top-2 -right-2 animate-bounce">
                      <Star className="w-8 h-8 text-yellow-500 fill-current" />
                    </div>
                  )}
                  {selectedPokemon.is_mega_evolved && (
                    <div className="absolute -top-4 -left-4 animate-pulse">
                      <div className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">MEGA</div>
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-4xl font-bold capitalize mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {selectedPokemon.pokemon_name}
              </h2>
              <div className="flex justify-center gap-2 mb-4">
                {selectedPokemon.pokemon_data?.types?.map((type: any) => (
                  <Badge
                    key={type.type.name}
                    className="text-white text-sm px-3 py-1 font-semibold"
                    style={{ backgroundColor: typeColors[type.type.name] || "#68A090" }}
                  >
                    {type.type.name.toUpperCase()}
                  </Badge>
                ))}
              </div>
              {message && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 text-yellow-800 px-6 py-3 rounded-xl animate-pulse shadow-lg">
                  <p className="font-semibold">{message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evolution Progress */}
          <Card className="mb-8 bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6" />
                Evolution Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={GameStateManager.getInstance().getEvolutionProgress(selectedPokemon.id)}
                className="mb-4 h-4"
              />
              <div className="flex justify-between text-sm">
                <span>Activity Points: {selectedPokemon.activity_points}</span>
                <span className="font-semibold">
                  {GameStateManager.getInstance().getEvolutionProgress(selectedPokemon.id) >= 100
                    ? "Ready to evolve!"
                    : `${GameStateManager.getInstance().getEvolutionProgress(selectedPokemon.id).toFixed(1)}%`}
                </span>
              </div>
              {GameStateManager.getInstance().getEvolutionProgress(selectedPokemon.id) > 80 && (
                <p className="text-center mt-2 animate-pulse font-bold">Your Pokémon is very close to evolving! ⭐</p>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-red-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                  <Heart className="w-5 h-5" />
                  Happiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={selectedPokemon.happiness} className="mb-2 h-3" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{selectedPokemon.happiness}%</span>
                  <span
                    className={`font-bold ${selectedPokemon.happiness >= 70 ? "text-green-600" : selectedPokemon.happiness >= 40 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {selectedPokemon.happiness >= 80
                      ? "Excellent"
                      : selectedPokemon.happiness >= 60
                        ? "Good"
                        : selectedPokemon.happiness >= 40
                          ? "Fair"
                          : selectedPokemon.happiness >= 20
                            ? "Poor"
                            : "Critical"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                  <span className="text-green-500">💚</span>
                  Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={selectedPokemon.health} className="mb-2 h-3" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{selectedPokemon.health}%</span>
                  <span
                    className={`font-bold ${selectedPokemon.health >= 70 ? "text-green-600" : selectedPokemon.health >= 40 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {selectedPokemon.health >= 80
                      ? "Excellent"
                      : selectedPokemon.health >= 60
                        ? "Good"
                        : selectedPokemon.health >= 40
                          ? "Fair"
                          : selectedPokemon.health >= 20
                            ? "Poor"
                            : "Critical"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-yellow-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-yellow-600">
                  <Zap className="w-5 h-5" />
                  Energy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={selectedPokemon.energy} className="mb-2 h-3" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{selectedPokemon.energy}%</span>
                  <span
                    className={`font-bold ${selectedPokemon.energy >= 70 ? "text-green-600" : selectedPokemon.energy >= 40 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {selectedPokemon.energy >= 80
                      ? "Excellent"
                      : selectedPokemon.energy >= 60
                        ? "Good"
                        : selectedPokemon.energy >= 40
                          ? "Fair"
                          : selectedPokemon.energy >= 20
                            ? "Poor"
                            : "Critical"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-blue-600">
                  <Apple className="w-5 h-5" />
                  Hunger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={selectedPokemon.hunger} className="mb-2 h-3" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{selectedPokemon.hunger}%</span>
                  <span
                    className={`font-bold ${selectedPokemon.hunger >= 70 ? "text-green-600" : selectedPokemon.hunger >= 40 ? "text-yellow-600" : "text-red-600"}`}
                  >
                    {selectedPokemon.hunger >= 80
                      ? "Excellent"
                      : selectedPokemon.hunger >= 60
                        ? "Good"
                        : selectedPokemon.hunger >= 40
                          ? "Fair"
                          : selectedPokemon.hunger >= 20
                            ? "Poor"
                            : "Critical"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feeding Actions */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-center text-gray-800">Feed Your Pokémon</CardTitle>
              <p className="text-center text-gray-600">Choose different foods to boost your Pokémon's stats</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleFeed("berry")}
                  disabled={isAnimating || selectedPokemon.hunger >= 95}
                  className="h-32 text-lg bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200 rounded-2xl flex flex-col"
                >
                  <Cherry className="w-12 h-12 mb-2" />
                  <div className="text-center">
                    <div className="font-bold">Berry</div>
                    <div className="text-xs opacity-80">+25 Hunger, +10 Happiness, +5 Health</div>
                    <div className="text-xs opacity-80">+15 Activity Points</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleFeed("potion")}
                  disabled={isAnimating || selectedPokemon.health >= 95}
                  className="h-32 text-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200 rounded-2xl flex flex-col"
                >
                  <Pill className="w-12 h-12 mb-2" />
                  <div className="text-center">
                    <div className="font-bold">Potion</div>
                    <div className="text-xs opacity-80">+30 Health, +15 Energy, +5 Happiness</div>
                    <div className="text-xs opacity-80">+20 Activity Points</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleFeed("candy")}
                  disabled={isAnimating || selectedPokemon.happiness >= 95}
                  className="h-32 text-lg bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-xl transform hover:scale-105 transition-all duration-200 rounded-2xl flex flex-col"
                >
                  <Candy className="w-12 h-12 mb-2" />
                  <div className="text-center">
                    <div className="font-bold">Rare Candy</div>
                    <div className="text-xs opacity-80">+20 Happiness, +10 Energy, +10 Hunger</div>
                    <div className="text-xs opacity-80">+25 Activity Points</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
