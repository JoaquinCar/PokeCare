"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Users, AlertTriangle } from "lucide-react"
import { PokemonAPI } from "@/lib/pokemon-api"
import { GameStateManager } from "@/lib/game-state-manager"
import { AuthManager } from "@/lib/auth"
import { PokemonCard } from "@/components/pokemon-card"
import { SearchBar } from "@/components/search-bar"
import { PokemonSkeleton } from "@/components/pokemon-skeleton"
import { ClassicButton, ClassicCard, ClassicHeader, ClassicLoading } from "@/components/classic-pokemon-ui"
import { pokemonTheme } from "@/lib/pokemon-theme"
import { PokemonAssetOptimizer } from "@/lib/pokemon-asset-optimizer"

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
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isAdoptingRef = useRef(false)
  // Add loading state management
  const [loadingProgress, setLoadingProgress] = useState(0)

  // At the top of the component, add proper type checking
  const generationId = params?.id ? Number.parseInt(params.id as string) : 1

  useEffect(() => {
    const gameState = GameStateManager.getInstance()
    const unsubscribe = gameState.subscribe(() => {
      setAdoptedTeam(gameState.getAdoptedTeam())
    })

    setAdoptedTeam(gameState.getAdoptedTeam())
    loadPokemon()

    return () => {
      unsubscribe()
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current)
      }
    }
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

  // Update the loadPokemon function
  const loadPokemon = async () => {
    setLoading(true)
    setLoadingProgress(0)
    const range = generationRanges[generationId as keyof typeof generationRanges]
    if (!range) {
      router.push("/dashboard")
      return
    }

    try {
      setLoadingProgress(25)

      // Preload assets for better performance
      const assetOptimizer = PokemonAssetOptimizer.getInstance()
      await PokemonAPI.preloadGenerationAssets(range.start, range.end)

      setLoadingProgress(50)
      const pokemonList = await PokemonAPI.getBasePokemonOnlyOptimized(range.start, range.end)
      setLoadingProgress(75)
      setPokemon(pokemonList)
      setFilteredPokemon(pokemonList)
      setLoadingProgress(100)
    } catch (error) {
      console.error("Error loading Pokemon:", error)
    } finally {
      setTimeout(() => setLoading(false), 200)
    }
  }

  const handleAdopt = async (selectedPokemon: any) => {
    // Prevent multiple adoption attempts
    if (isAdoptingRef.current) return false

    isAdoptingRef.current = true

    try {
      const gameState = GameStateManager.getInstance()
      const success = await gameState.adoptPokemon(selectedPokemon)

      if (!success && adoptedTeam.length >= 6) {
        // Clear any existing timer
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current)
        }

        // Show warning
        setShowTeamFullWarning(true)

        // Set new timer
        warningTimerRef.current = setTimeout(() => {
          setShowTeamFullWarning(false)
          warningTimerRef.current = null
        }, 3000)
      }

      return success
    } finally {
      // Reset adoption flag after a short delay to prevent button flicker
      setTimeout(() => {
        isAdoptingRef.current = false
      }, 500)
    }
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleTeamClick = () => {
    router.push("/team")
  }

  const generation = generationRanges[generationId as keyof typeof generationRanges]

  if (!generation) {
    return <div>Generation not found</div>
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${pokemonTheme.colors.backgrounds.primary} relative`}>
      {/* Classic Pokemon background pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400 rounded-full border-4 border-yellow-600"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-red-400 rounded-full border-4 border-red-600"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-green-400 rounded-full border-4 border-green-600"></div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 bg-purple-400 rounded-full border-4 border-purple-600"></div>
      </div>

      {/* Team Full Warning */}
      {showTeamFullWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-500 text-white border-4 border-red-700 rounded-lg p-4 shadow-2xl animate-bounce">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              <p className={`${pokemonTheme.typography.button}`}>Team Full! (6/6 Pokémon)</p>
            </div>
          </div>
        </div>
      )}

      <ClassicHeader
        title={`${generation.name} Region`}
        subtitle={`Pokémon #${generation.start}-${generation.end}`}
        variant="primary"
        actions={
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg px-4 py-2 border-2 border-blue-900 shadow-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className={`${pokemonTheme.typography.button} text-blue-800`}>Team: {adoptedTeam.length}/6</span>
              </div>
            </div>

            <ClassicButton onClick={handleBack} variant="accent" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </ClassicButton>

            {adoptedTeam.length > 0 && (
              <ClassicButton onClick={handleTeamClick} variant="secondary" size="md">
                <Users className="w-4 h-4 mr-2" />
                Team
              </ClassicButton>
            )}
          </div>
        }
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Search Bar */}
        <div className="mb-8">
          <ClassicCard variant="accent" className="max-w-md mx-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search ${generation.name} Pokémon...`}
              className="w-full"
            />
          </ClassicCard>
        </div>

        {loading ? (
          <div className="space-y-8">
            <ClassicLoading text="Loading Pokémon..." size="lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 20 }).map((_, index) => (
                <PokemonSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-6">
              <ClassicCard variant="primary" className="max-w-2xl mx-auto">
                <div className="text-center">
                  <p className={`${pokemonTheme.typography.subheading} text-gray-700`}>
                    {searchQuery ? (
                      <>
                        Found {filteredPokemon.length} results for "{searchQuery}"
                      </>
                    ) : (
                      <>Showing all {filteredPokemon.length} base Pokémon</>
                    )}
                  </p>
                </div>
              </ClassicCard>
            </div>

            {/* Pokemon Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredPokemon.map((poke) => (
                <PokemonCard
                  key={poke.id}
                  pokemon={poke}
                  onAdopt={handleAdopt}
                  isAdopted={adoptedTeam.some((p) => p.pokemon_id === poke.id)}
                />
              ))}
            </div>

            {filteredPokemon.length === 0 && searchQuery && (
              <ClassicCard variant="secondary" className="max-w-md mx-auto">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className={`${pokemonTheme.typography.heading} text-xl text-gray-600 mb-2`}>No Pokémon Found</h3>
                  <p className="text-gray-500">Try searching with a different name</p>
                </div>
              </ClassicCard>
            )}
          </>
        )}
      </main>
    </div>
  )
}
