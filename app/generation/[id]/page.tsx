"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Users, AlertTriangle } from "lucide-react"
import { PokemonAPI } from "@/lib/pokemon-api"
import { GameStateManager } from "@/lib/game-state-manager"
import { AuthManager } from "@/lib/auth"
import { PokemonCard } from "@/components/pokemon-card"
import { SearchBar } from "@/components/search-bar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PokemonSkeleton } from "@/components/pokemon-skeleton"

const generationRanges = {
  1: { start: 1, end: 151, name: "Kanto", color: "from-red-400 to-red-600" },
  2: { start: 152, end: 251, name: "Johto", color: "from-yellow-400 to-orange-500" },
  3: { start: 252, end: 386, name: "Hoenn", color: "from-green-400 to-emerald-600" },
  4: { start: 387, end: 493, name: "Sinnoh", color: "from-blue-400 to-indigo-600" },
  5: { start: 494, end: 649, name: "Unova", color: "from-purple-400 to-violet-600" },
}

export default function GenerationPage() {
  const params = useParams()
  const router = useRouter()
  const [pokemon, setPokemon] = useState<any[]>([])
  const [filteredPokemon, setFilteredPokemon] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adoptedTeam, setAdoptedTeam] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showTeamFullWarning, setShowTeamFullWarning] = useState(false)

  // At the top of the component, add proper type checking
  const generationId = params?.id ? Number.parseInt(params.id as string) : 1

  useEffect(() => {
    const gameState = GameStateManager.getInstance()
    const unsubscribe = gameState.subscribe(() => {
      setAdoptedTeam(gameState.getAdoptedTeam())
    })

    setAdoptedTeam(gameState.getAdoptedTeam())
    loadPokemon()

    return unsubscribe
  }, [router])

  useEffect(() => {
    // Filter Pokemon based on search query
    if (searchQuery.trim() === "") {
      setFilteredPokemon(pokemon)
    } else {
      const filtered = pokemon.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredPokemon(filtered)
    }
  }, [pokemon, searchQuery])

  useEffect(() => {
    if (!AuthManager.getInstance().getCurrentUser()) {
      router.push("/")
      return
    }

    if (!generationId || generationId < 1 || generationId > 5) {
      router.push("/dashboard")
      return
    }
  }, [generationId, router])

  const loadPokemon = async () => {
    setLoading(true)
    const range = generationRanges[generationId as keyof typeof generationRanges]
    if (!range) {
      router.push("/dashboard")
      return
    }

    try {
      // Optimized parallel loading
      const pokemonList = await PokemonAPI.getBasePokemonOnlyOptimized(range.start, range.end)
      setPokemon(pokemonList)
      setFilteredPokemon(pokemonList)
    } catch (error) {
      console.error("Error loading Pokemon:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdopt = async (selectedPokemon: any) => {
    const gameState = GameStateManager.getInstance()
    const success = await gameState.adoptPokemon(selectedPokemon)

    if (!success) {
      setShowTeamFullWarning(true)
      setTimeout(() => setShowTeamFullWarning(false), 3000)
    }
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const generation = generationRanges[generationId as keyof typeof generationRanges]

  if (!generation) {
    return <div>Generation not found</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 relative">
      {/* Pokémon GO style background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-300 rounded-full"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-yellow-300 rounded-full"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-green-300 rounded-full"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-red-300 rounded-full"></div>
      </div>

      {/* Team Full Warning */}
      {showTeamFullWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <Card className="bg-red-500 text-white shadow-2xl border-2 border-red-600">
            <CardContent className="p-4 text-center flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              <p className="font-bold">You already have a full team! (6/6)</p>
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
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{generation.name} Region</h1>
                <p className="text-gray-600">
                  Pokémon #{generation.start}-{generation.end}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border-2 border-gray-200">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-gray-700">Team: {adoptedTeam.length}/6</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${generation.name} Pokémon...`}
            className="max-w-md mx-auto"
          />
        </div>

        {loading ? (
          <div className="space-y-8">
            <LoadingSpinner size="lg" text="Loading Pokémon..." className="py-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 20 }).map((_, index) => (
                <PokemonSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                {searchQuery ? (
                  <>
                    Showing {filteredPokemon.length} results for "{searchQuery}"
                  </>
                ) : (
                  <>Showing all {filteredPokemon.length} Pokémon</>
                )}
              </p>
            </div>

            {/* Pokemon Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredPokemon.map((poke) => (
                <PokemonCard
                  key={poke.id}
                  pokemon={poke}
                  onAdopt={handleAdopt}
                  isAdopted={adoptedTeam.some((p) => p.id === poke.id)}
                />
              ))}
            </div>

            {filteredPokemon.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Pokémon found</h3>
                <p className="text-gray-500">Try searching with a different name</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
