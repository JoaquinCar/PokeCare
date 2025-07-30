"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Zap, Apple, Star, Sparkles, Users, Cherry, Pill, Candy, Shield } from "lucide-react"
import { GameStateManager } from "@/lib/game-state-manager"
import { AuthManager } from "@/lib/auth"
import { ClassicPokemonStatDisplay } from "@/components/classic-pokemon-stat-display"
import { ClassicEvolutionProgress } from "@/components/classic-evolution-progress"
import { ClassicPokemonCareStatus } from "@/components/classic-pokemon-care-status"

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
  const [previousStats, setPreviousStats] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [showEvolutionNotification, setShowEvolutionNotification] = useState(false)
  const [showMegaEvolutionNotification, setShowMegaEvolutionNotification] = useState(false)
  const [feedingAction, setFeedingAction] = useState<string | null>(null)
  const gameStateRef = useRef<GameStateManager>()

  useEffect(() => {
    const authManager = AuthManager.getInstance()
    if (!authManager.getCurrentUser()) {
      router.push("/")
      return
    }

    gameStateRef.current = GameStateManager.getInstance()
    const team = gameStateRef.current.getAdoptedTeam()

    if (team.length === 0) {
      router.push("/dashboard")
      return
    }

    setAdoptedTeam(team)
    if (!selectedPokemon && team.length > 0) {
      const firstPokemon = team[0]
      setSelectedPokemon(firstPokemon)
      setPreviousStats({
        happiness: firstPokemon.happiness,
        health: firstPokemon.health,
        energy: firstPokemon.energy,
        hunger: firstPokemon.hunger,
        activity_points: firstPokemon.activity_points,
      })
    }

    const unsubscribe = gameStateRef.current.subscribe(() => {
      const newTeam = gameStateRef.current!.getAdoptedTeam()
      setAdoptedTeam(newTeam)

      if (selectedPokemon) {
        const updatedPokemon = newTeam.find((p) => p.id === selectedPokemon.id)
        if (updatedPokemon) {
          setPreviousStats({
            happiness: selectedPokemon.happiness,
            health: selectedPokemon.health,
            energy: selectedPokemon.energy,
            hunger: selectedPokemon.hunger,
            activity_points: selectedPokemon.activity_points,
          })
          setSelectedPokemon(updatedPokemon)
        }
      }
    })

    return unsubscribe
  }, [router, selectedPokemon])

  const handleFeed = async (foodType: "berry" | "potion" | "candy") => {
    if (isAnimating || !selectedPokemon || !gameStateRef.current) return

    if (!gameStateRef.current.canFeedPokemon(selectedPokemon.id, foodType)) {
      const feedingMessage = gameStateRef.current.getFeedingMessage(selectedPokemon.id, foodType)
      setMessage(feedingMessage)
      setTimeout(() => setMessage(""), 4000)
      return
    }

    const prevStats = {
      happiness: Math.round(selectedPokemon.happiness || 0),
      health: Math.round(selectedPokemon.health || 0),
      energy: Math.round(selectedPokemon.energy || 0),
      hunger: Math.round(selectedPokemon.hunger || 0),
      activity_points: Math.round(selectedPokemon.activity_points || 0),
    }
    setPreviousStats(prevStats)

    setIsAnimating(true)
    setFeedingAction(foodType)

    let feedMessage = ""
    let emoji = ""
    switch (foodType) {
      case "berry":
        feedMessage = `${selectedPokemon.pokemon_name} enjoyed the berry!`
        emoji = "🍓"
        break
      case "potion":
        feedMessage = `${selectedPokemon.pokemon_name} feels refreshed!`
        emoji = "🧪"
        break
      case "candy":
        feedMessage = `${selectedPokemon.pokemon_name} loves the candy!`
        emoji = "🍬"
        break
    }

    try {
      const result = await gameStateRef.current.feedPokemon(selectedPokemon.id, foodType)

      if (result.success) {
        setMessage(`${feedMessage} ${emoji}`)

        if (result.evolved) {
          setShowEvolutionNotification(true)
          setTimeout(() => setShowEvolutionNotification(false), 5000)
        }

        if (result.megaEvolved) {
          setShowMegaEvolutionNotification(true)
          setTimeout(() => setShowMegaEvolutionNotification(false), 5000)
        }
      } else {
        setMessage("Something went wrong! Please try again.")
      }
    } catch (error) {
      console.error("Error feeding Pokemon:", error)
      setMessage("An error occurred! Please refresh the page and try again.")
    }

    setTimeout(() => {
      setIsAnimating(false)
      setFeedingAction(null)
      setMessage("")
    }, 3000)
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleTeamClick = () => {
    router.push("/team")
  }

  const handlePokemonSelect = (pokemon: any) => {
    setPreviousStats({
      happiness: selectedPokemon?.happiness || pokemon.happiness,
      health: selectedPokemon?.health || pokemon.health,
      energy: selectedPokemon?.energy || pokemon.energy,
      hunger: selectedPokemon?.hunger || pokemon.hunger,
      activity_points: selectedPokemon?.activity_points || pokemon.activity_points,
    })
    setSelectedPokemon(pokemon)
  }

  if (!selectedPokemon || !gameStateRef.current) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 border-4 border-blue-800 shadow-2xl">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Loading...</h2>
          <p className="text-blue-600">Please wait while we load your Pokémon</p>
        </div>
      </div>
    )
  }

  const requiredPoints = Math.max(30, selectedPokemon.pokemon_id * 1.5)
  const evolutionProgress = gameStateRef.current.getEvolutionProgress(selectedPokemon.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 relative">
      {/* Classic Pokemon-style background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full border-4 border-yellow-600"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-red-400 rounded-full border-4 border-red-600"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-green-400 rounded-full border-4 border-green-600"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-purple-400 rounded-full border-4 border-purple-600"></div>
      </div>

      {/* Classic Pokemon Evolution Notification */}
      {showEvolutionNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-4 border-yellow-600 rounded-lg p-6 shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8 animate-spin mr-2" />
                <span className="text-2xl font-bold uppercase tracking-wide">Evolution!</span>
                <Sparkles className="w-8 h-8 animate-spin ml-2" />
              </div>
              <p className="text-lg font-bold">{selectedPokemon.pokemon_name} evolved!</p>
            </div>
          </div>
        </div>
      )}

      {/* Classic Pokemon Mega Evolution Notification */}
      {showMegaEvolutionNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-4 border-purple-700 rounded-lg p-6 shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3">
                <Star className="w-8 h-8 animate-spin mr-2" />
                <span className="text-2xl font-bold uppercase tracking-wide">Mega Evolution!</span>
                <Star className="w-8 h-8 animate-spin ml-2" />
              </div>
              <p className="text-lg font-bold">{selectedPokemon.pokemon_name} Mega Evolved!</p>
            </div>
          </div>
        </div>
      )}

      {/* Classic Pokemon-style header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 border-b-4 border-blue-900 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBack}
                className="bg-white text-blue-800 border-2 border-blue-900 rounded-lg font-bold hover:bg-blue-50 active:scale-95 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleTeamClick}
                className="bg-yellow-400 text-blue-800 border-2 border-yellow-600 rounded-lg font-bold hover:bg-yellow-300 active:scale-95 transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                Team
              </Button>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 border-2 border-blue-900">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-800">Team: {adoptedTeam.length}/6</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Classic Pokemon Team Selection */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-t-lg border-2 border-blue-800">
              <h2 className="font-bold uppercase tracking-wide text-center">Select Pokémon</h2>
            </div>
            <div className="bg-white border-2 border-blue-800 border-t-0 rounded-b-lg p-4">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {adoptedTeam.map((pokemon) => {
                  const needsLevel = gameStateRef.current!.getPokemonNeedsLevel(pokemon.id)
                  const borderColor =
                    needsLevel === "critical"
                      ? "border-red-500 bg-red-50"
                      : needsLevel === "low"
                        ? "border-orange-500 bg-orange-50"
                        : needsLevel === "medium"
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-400 bg-gray-50"

                  return (
                    <div
                      key={pokemon.id}
                      onClick={() => handlePokemonSelect(pokemon)}
                      className={`flex-shrink-0 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 active:scale-95 hover:scale-105 ${
                        selectedPokemon?.id === pokemon.id
                          ? "border-blue-600 bg-blue-100 shadow-lg ring-2 ring-blue-300"
                          : `${borderColor} hover:shadow-md`
                      }`}
                    >
                      <img
                        src={
                          pokemon.pokemon_data?.animatedSprite ||
                          pokemon.pokemon_data?.sprites?.front_default ||
                          "/placeholder.svg?height=60&width=60" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={pokemon.pokemon_name}
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <p className="text-sm font-bold text-center capitalize text-gray-800">{pokemon.pokemon_name}</p>
                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>❤️</span>
                          <span className={pokemon.happiness < 30 ? "text-red-600 font-bold" : "text-gray-700"}>
                            {pokemon.happiness}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>💚</span>
                          <span className={pokemon.health < 30 ? "text-red-600 font-bold" : "text-gray-700"}>
                            {pokemon.health}
                          </span>
                        </div>
                      </div>
                      {needsLevel === "critical" && (
                        <div className="text-center mt-1">
                          <span className="text-xs text-red-600 font-bold animate-pulse">⚠️</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Classic Pokemon Status Display */}
          <div className="mb-8">
            <ClassicPokemonCareStatus pokemon={selectedPokemon} />
          </div>

          {/* Classic Pokemon Main Display */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-t-lg border-2 border-green-800">
              <h2 className="font-bold uppercase tracking-wide text-center">Pokémon Care</h2>
            </div>
            <div className="bg-white border-2 border-green-800 border-t-0 rounded-b-lg p-6">
              <div className="text-center">
                <div className={`transition-all duration-500 ${isAnimating ? "scale-110" : "scale-100"}`}>
                  <div className="relative inline-block mb-4">
                    <div
                      className={`w-48 h-48 mx-auto rounded-full flex items-center justify-center border-4 ${
                        selectedPokemon.is_mega_evolved
                          ? "bg-gradient-to-br from-purple-200 to-pink-200 border-purple-600 shadow-2xl"
                          : "bg-gradient-to-br from-blue-100 to-green-100 border-green-600 shadow-lg"
                      }`}
                    >
                      <img
                        src={
                          selectedPokemon.pokemon_data?.animatedSprite ||
                          selectedPokemon.pokemon_data?.sprites?.front_default ||
                          "/placeholder.svg?height=150&width=150" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={selectedPokemon.pokemon_name}
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                    {evolutionProgress > 80 && (
                      <div className="absolute -top-2 -right-2 animate-bounce">
                        <Star className="w-8 h-8 text-yellow-500 fill-current" />
                      </div>
                    )}
                    {selectedPokemon.is_mega_evolved && (
                      <div className="absolute -top-4 -left-4">
                        <div className="bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold border-2 border-purple-800">
                          MEGA
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <h2 className="text-4xl font-bold capitalize mb-2 text-gray-800">{selectedPokemon.pokemon_name}</h2>

                <div className="flex justify-center gap-2 mb-4">
                  {selectedPokemon.pokemon_data?.types?.map((type: any) => (
                    <Badge
                      key={type.type.name}
                      className="text-white text-sm px-3 py-1 font-bold border-2 border-gray-800"
                      style={{ backgroundColor: typeColors[type.type.name] || "#68A090" }}
                    >
                      {type.type.name.toUpperCase()}
                    </Badge>
                  ))}
                </div>

                {message && (
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-500 text-yellow-800 px-6 py-3 rounded-lg shadow-lg max-w-md mx-auto">
                    <p className="font-bold text-sm">{message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Classic Evolution Progress */}
          <div className="mb-8">
            <ClassicEvolutionProgress
              pokemonId={selectedPokemon.id}
              pokemonName={selectedPokemon.pokemon_name}
              currentProgress={evolutionProgress}
              previousProgress={
                previousStats
                  ? Math.min((previousStats.activity_points / requiredPoints) * 100, 100)
                  : evolutionProgress
              }
              activityPoints={selectedPokemon.activity_points}
              previousActivityPoints={previousStats?.activity_points || selectedPokemon.activity_points}
              requiredPoints={requiredPoints}
              className="max-w-md mx-auto"
            />
          </div>

          {/* Classic Pokemon Stats Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ClassicPokemonStatDisplay
              label="Happiness"
              icon={<Heart className="w-4 h-4" />}
              currentValue={selectedPokemon.happiness}
              previousValue={previousStats?.happiness}
              color="bg-red-500"
            />

            <ClassicPokemonStatDisplay
              label="Health"
              icon={<Shield className="w-4 h-4" />}
              currentValue={selectedPokemon.health}
              previousValue={previousStats?.health}
              color="bg-green-500"
            />

            <ClassicPokemonStatDisplay
              label="Energy"
              icon={<Zap className="w-4 h-4" />}
              currentValue={selectedPokemon.energy}
              previousValue={previousStats?.energy}
              color="bg-yellow-500"
            />

            <ClassicPokemonStatDisplay
              label="Hunger"
              icon={<Apple className="w-4 h-4" />}
              currentValue={selectedPokemon.hunger}
              previousValue={previousStats?.hunger}
              color="bg-blue-500"
            />
          </div>

          {/* Classic Pokemon Feeding Actions */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-t-lg border-2 border-red-800">
              <h2 className="font-bold uppercase tracking-wide text-center">Items</h2>
            </div>
            <div className="bg-white border-2 border-red-800 border-t-0 rounded-b-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button
                  onClick={() => handleFeed("berry")}
                  disabled={isAnimating || selectedPokemon.hunger >= 85}
                  className={`h-32 text-lg bg-gradient-to-b from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white border-4 border-red-800 shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 rounded-lg flex flex-col disabled:opacity-50 disabled:cursor-not-allowed ${
                    feedingAction === "berry" ? "ring-4 ring-red-300 scale-105 shadow-2xl animate-pulse" : ""
                  }`}
                >
                  {feedingAction === "berry" ? (
                    <div className="animate-bounce mb-2">
                      <Cherry className="w-12 h-12" />
                    </div>
                  ) : (
                    <Cherry className="w-12 h-12 mb-2" />
                  )}
                  <div className="text-center">
                    <div className="font-bold uppercase tracking-wide">Berry</div>
                    <div className="text-xs opacity-90">Restores hunger</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleFeed("potion")}
                  disabled={isAnimating || (selectedPokemon.health >= 85 && selectedPokemon.energy >= 85)}
                  className={`h-32 text-lg bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white border-4 border-blue-800 shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 rounded-lg flex flex-col disabled:opacity-50 disabled:cursor-not-allowed ${
                    feedingAction === "potion" ? "ring-4 ring-blue-300 scale-105 shadow-2xl animate-pulse" : ""
                  }`}
                >
                  {feedingAction === "potion" ? (
                    <div className="animate-bounce mb-2">
                      <Pill className="w-12 h-12" />
                    </div>
                  ) : (
                    <Pill className="w-12 h-12 mb-2" />
                  )}
                  <div className="text-center">
                    <div className="font-bold uppercase tracking-wide">Potion</div>
                    <div className="text-xs opacity-90">Restores health</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleFeed("candy")}
                  disabled={isAnimating || selectedPokemon.happiness >= 85}
                  className={`h-32 text-lg bg-gradient-to-b from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white border-4 border-purple-800 shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 rounded-lg flex flex-col disabled:opacity-50 disabled:cursor-not-allowed ${
                    feedingAction === "candy" ? "ring-4 ring-purple-300 scale-105 shadow-2xl animate-pulse" : ""
                  }`}
                >
                  {feedingAction === "candy" ? (
                    <div className="animate-bounce mb-2">
                      <Candy className="w-12 h-12" />
                    </div>
                  ) : (
                    <Candy className="w-12 h-12 mb-2" />
                  )}
                  <div className="text-center">
                    <div className="font-bold uppercase tracking-wide">Rare Candy</div>
                    <div className="text-xs opacity-90">Boosts happiness</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
