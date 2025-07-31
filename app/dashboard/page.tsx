"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { GameStateManager } from "@/lib/game-state-manager"
import { LogOut, Heart, Users } from "lucide-react"
import { ClassicButton, ClassicCard, ClassicHeader } from "@/components/classic-pokemon-ui"
import { pokemonTheme } from "@/lib/pokemon-theme"
import { PokemonAssetOptimizer } from "@/lib/pokemon-asset-optimizer"

const generations = [
  {
    id: 1,
    name: "Kanto",
    region: "Kanto",
    color: "from-red-400 to-red-600",
    range: "1-151",
    icon: "🔥",
    bgColor: "bg-red-500",
  },
  {
    id: 2,
    name: "Johto",
    region: "Johto",
    color: "from-yellow-400 to-orange-500",
    range: "152-251",
    icon: "⚡",
    bgColor: "bg-yellow-500",
  },
  {
    id: 3,
    name: "Hoenn",
    region: "Hoenn",
    color: "from-green-400 to-emerald-600",
    range: "252-386",
    icon: "🌿",
    bgColor: "bg-green-500",
  },
  {
    id: 4,
    name: "Sinnoh",
    region: "Sinnoh",
    color: "from-blue-400 to-indigo-600",
    range: "387-493",
    icon: "💎",
    bgColor: "bg-blue-500",
  },
  {
    id: 5,
    name: "Unova",
    region: "Unova",
    color: "from-purple-400 to-violet-600",
    range: "494-649",
    icon: "⚫",
    bgColor: "bg-purple-500",
  },
]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [adoptedTeam, setAdoptedTeam] = useState<any[]>([])
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const authManager = AuthManager.getInstance()

    const unsubscribe = authManager.onAuthStateChange(async (user) => {
      if (!user) {
        router.push("/")
        return
      }

      setUser(user)
      const profile = await authManager.getUserProfile()
      if (profile) {
        setUser({ ...user, username: profile.username })
      }
    })

    // Initialize current user
    const currentUser = authManager.getCurrentUser()
    if (currentUser) {
      authManager.getUserProfile().then((profile) => {
        if (profile) {
          setUser({ ...currentUser, username: profile.username })
        } else {
          setUser(currentUser)
        }
      })
    }

    // Subscribe to game state changes
    const gameState = GameStateManager.getInstance()
    const gameUnsubscribe = gameState.subscribe(() => {
      setAdoptedTeam(gameState.getAdoptedTeam())
    })

    setAdoptedTeam(gameState.getAdoptedTeam())

    // Preload Pokemon assets for better performance (moved from app/page.tsx)
    const assetOptimizer = PokemonAssetOptimizer.getInstance()
    assetOptimizer.preloadCriticalAssets([1, 4, 7, 25, 150, 152, 155, 158]).then(() => {
      setAssetsLoaded(true)
    })

    return () => {
      unsubscribe.data.subscription.unsubscribe()
      gameUnsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    await AuthManager.getInstance().signOut()
    router.push("/")
  }

  const handleGenerationSelect = (genId: number) => {
    router.push(`/generation/${genId}`)
  }

  const handleCareClick = () => {
    router.push("/care")
  }

  const handleTeamClick = () => {
    router.push("/team")
  }

  if (!user) return null

  return (
    <div className={`min-h-screen bg-gradient-to-br ${pokemonTheme.colors.backgrounds.primary} relative`}>
      {/* Classic Pokemon Background Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-40 h-40 bg-yellow-400 rounded-full border-4 border-yellow-600 animate-pulse"></div>
        <div className="absolute top-60 right-32 w-32 h-32 bg-red-400 rounded-full border-4 border-red-600 animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-48 h-48 bg-green-400 rounded-full border-4 border-green-600 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-purple-400 rounded-full border-4 border-purple-600 animate-bounce"></div>
        <div className="absolute top-1/3 left-1/2 w-28 h-28 bg-pink-400 rounded-full border-4 border-pink-600 animate-ping"></div>
      </div>

      <ClassicHeader
        title="PokeCare Dashboard"
        subtitle={`Welcome back, ${user.username || user.email}!`}
        variant="primary"
        actions={
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg px-4 py-2 border-2 border-blue-900 shadow-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className={`${pokemonTheme.typography.button} text-blue-800`}>Team: {adoptedTeam.length}/6</span>
              </div>
            </div>
            {adoptedTeam.length > 0 && (
              <>
                <ClassicButton onClick={handleTeamClick} variant="accent" size="md">
                  <Users className="w-4 h-4 mr-2" />
                  Team
                </ClassicButton>
                <ClassicButton onClick={handleCareClick} variant="secondary" size="md">
                  <Heart className="w-4 h-4 mr-2" />
                  Care
                </ClassicButton>
              </>
            )}
            <ClassicButton onClick={handleLogout} variant="danger" size="md">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </ClassicButton>
          </div>
        }
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <ClassicCard variant="accent" className="max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className={`${pokemonTheme.typography.heading} text-3xl text-gray-800 mb-4`}>Choose Your Region</h2>
              <p className="text-gray-700 text-lg">
                Explore different generations of Pokémon and start your adventure!
              </p>
            </div>
          </ClassicCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {generations.map((gen) => (
            <div
              key={gen.id}
              className="group cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={() => handleGenerationSelect(gen.id)}
            >
              {/* Generation Header */}
              <div
                className={`${gen.bgColor} text-white px-4 py-3 rounded-t-lg border-2 border-gray-800 relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="text-3xl mb-2">{gen.icon}</div>
                  <h3 className={`${pokemonTheme.typography.heading} text-2xl mb-1`}>{gen.region}</h3>
                  <p className="text-sm opacity-90">Generation {gen.id}</p>
                </div>
              </div>

              {/* Generation Body */}
              <div className="bg-white border-2 border-gray-800 border-t-0 rounded-b-lg p-4 shadow-lg">
                <div className="text-center mb-4">
                  <h4 className={`${pokemonTheme.typography.subheading} text-gray-800 mb-2`}>{gen.name}</h4>
                  <p className="text-gray-600">Pokémon #{gen.range}</p>
                </div>

                <ClassicButton
                  onClick={() => handleGenerationSelect(gen.id)}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Explore {gen.region}
                </ClassicButton>
              </div>
            </div>
          ))}
        </div>

        {/* Team Display */}
        {adoptedTeam.length > 0 && (
          <ClassicCard
            title={`Your Pokémon Team (${adoptedTeam.length}/6)`}
            variant="success"
            className="max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {adoptedTeam.map((pokemon) => (
                <div
                  key={pokemon.id}
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-gray-400 hover:border-blue-500 transition-all duration-200 hover:shadow-lg group"
                >
                  <div className="relative">
                    <img
                      src={
                        pokemon.pokemon_data?.animatedSprite ||
                        pokemon.pokemon_data?.sprites?.front_default ||
                        "/placeholder.svg?height=80&width=80" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={pokemon.pokemon_name}
                      className="w-16 h-16 mx-auto mb-2 group-hover:scale-110 transition-transform duration-200"
                    />
                    {pokemon.is_mega_evolved && (
                      <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs px-1 rounded-full">
                        M
                      </div>
                    )}
                  </div>
                  <h4 className={`${pokemonTheme.typography.subheading} text-sm text-gray-800 capitalize`}>
                    {pokemon.pokemon_name}
                  </h4>
                  <p className="text-xs text-gray-600">#{pokemon.pokemon_id.toString().padStart(3, "0")}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>❤️</span>
                      <span className={pokemon.happiness < 30 ? "text-red-600 font-bold" : "text-gray-700"}>
                        {pokemon.happiness}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>💚</span>
                      <span className={pokemon.health < 30 ? "text-red-600 font-bold" : "text-gray-700"}>
                        {pokemon.health}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 6 - adoptedTeam.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="text-center p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-400 flex flex-col items-center justify-center"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2 border-2 border-gray-300">
                    <span className="text-gray-400 text-2xl">+</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Empty Slot</p>
                </div>
              ))}
            </div>

            <div className="text-center space-x-4">
              <ClassicButton onClick={handleTeamClick} variant="primary" size="lg">
                <Users className="w-4 h-4 mr-2" />
                View Team
              </ClassicButton>
              <ClassicButton onClick={handleCareClick} variant="secondary" size="lg">
                <Heart className="w-4 h-4 mr-2" />
                Care for Team
              </ClassicButton>
            </div>
          </ClassicCard>
        )}
      </main>
    </div>
  )
}
