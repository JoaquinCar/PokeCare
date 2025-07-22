"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthManager } from "@/lib/auth"
import { GameStateManager } from "@/lib/game-state-manager"
import { LogOut, Heart, Users } from "lucide-react"

const generations = [
  { id: 1, name: "Kanto", region: "Kanto", color: "from-red-400 to-red-600", range: "1-151", icon: "🔥" },
  { id: 2, name: "Johto", region: "Johto", color: "from-yellow-400 to-orange-500", range: "152-251", icon: "⚡" },
  { id: 3, name: "Hoenn", region: "Hoenn", color: "from-green-400 to-emerald-600", range: "252-386", icon: "🌿" },
  { id: 4, name: "Sinnoh", region: "Sinnoh", color: "from-blue-400 to-indigo-600", range: "387-493", icon: "💎" },
  { id: 5, name: "Unova", region: "Unova", color: "from-purple-400 to-violet-600", range: "494-649", icon: "⚫" },
]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [adoptedTeam, setAdoptedTeam] = useState<any[]>([])
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative">
      {/* Pokémon GO style background elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-48 h-48 bg-yellow-300 rounded-full animate-pulse"></div>
        <div className="absolute top-60 right-32 w-36 h-36 bg-pink-300 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-52 h-52 bg-green-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-purple-300 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 left-1/2 w-32 h-32 bg-red-300 rounded-full animate-ping"></div>
      </div>

      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎮</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">PokeCare</h1>
              <p className="text-gray-600">Welcome, {user.username || user.email}!</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border-2 border-gray-200">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-gray-700">Team: {adoptedTeam.length}/6</span>
            </div>
            {adoptedTeam.length > 0 && (
              <>
                <Button
                  onClick={handleTeamClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Team
                </Button>
                <Button
                  onClick={handleCareClick}
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Care
                </Button>
              </>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-full border-2 border-gray-300 hover:border-red-400 bg-white shadow-md"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Choose a Region</h2>
          <p className="text-gray-600 text-lg">Explore different generations of Pokémon</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {generations.map((gen) => (
            <Card
              key={gen.id}
              className="overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer bg-white shadow-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-2xl"
            >
              <div
                className={`h-40 bg-gradient-to-br ${gen.color} flex items-center justify-center relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-white/10"></div>
                <div className="text-center relative z-10">
                  <div className="text-4xl mb-2">{gen.icon}</div>
                  <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{gen.region}</h3>
                  <p className="text-white/90 text-sm font-semibold">Generation {gen.id}</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-center text-gray-800">{gen.name}</CardTitle>
                <CardDescription className="text-center text-gray-600">Pokémon #{gen.range}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleGenerationSelect(gen.id)}
                  className={`w-full bg-gradient-to-r ${gen.color} hover:opacity-90 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-200`}
                >
                  Explore {gen.region}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Display */}
        {adoptedTeam.length > 0 && (
          <div className="mt-12">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-center text-gray-800 flex items-center justify-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  Your Pokémon Team ({adoptedTeam.length}/6)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {adoptedTeam.map((pokemon) => (
                    <div
                      key={pokemon.id}
                      className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                    >
                      <img
                        src={
                          pokemon.pokemon_data?.animatedSprite ||
                          pokemon.pokemon_data?.sprites?.front_default ||
                          "/placeholder.svg?height=80&width=80" ||
                          "/placeholder.svg"
                        }
                        alt={pokemon.pokemon_name}
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <h4 className="text-sm font-bold capitalize text-gray-800">{pokemon.pokemon_name}</h4>
                      <p className="text-xs text-gray-600">#{pokemon.pokemon_id.toString().padStart(3, "0")}</p>
                      <div className="mt-2 space-y-1">
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
                  {/* Empty slots */}
                  {Array.from({ length: 6 - adoptedTeam.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="text-center p-4 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                        <span className="text-gray-400 text-2xl">+</span>
                      </div>
                      <p className="text-xs text-gray-500">Empty Slot</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center space-x-4">
                  <Button
                    onClick={handleTeamClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View Team
                  </Button>
                  <Button
                    onClick={handleCareClick}
                    className="bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-md"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Care for Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
