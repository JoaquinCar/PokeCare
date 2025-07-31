"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Trash2, Users, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { GameStateManager } from "@/lib/game-state-manager"
import { AuthManager } from "@/lib/auth"
import { Loader2 } from "lucide-react"
import { ClassicButton, ClassicCard, ClassicHeader } from "@/components/classic-pokemon-ui"
import { pokemonTheme, pokemonTypeColors } from "@/lib/pokemon-theme"
import { ReleaseConfirmationDialog } from "@/components/release-confirmation-dialog"
import { useToast } from "@/components/ui/use-toast"

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

export default function ReleasePokemonPage() {
  const router = useRouter()
  const [adoptedTeam, setAdoptedTeam] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [releasingPokemon, setReleasingPokemon] = useState<string | null>(null)
  const [releaseError, setReleaseError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pokemonToReleaseId, setPokemonToReleaseId] = useState<string | null>(null)
  const [pokemonToReleaseName, setPokemonToReleaseName] = useState<string | null>(null)
  const { toast } = useToast()

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
      if (newTeam.length === 0) {
        console.log("[ReleasePage] Team is now empty, redirecting to dashboard.")
        router.push("/dashboard")
      }
    })

    return unsubscribe
  }, [router])

  const handleBack = () => {
    router.push("/team") // Go back to the team page
  }

  const openReleaseConfirmDialog = (pokemonId: string, pokemonName: string) => {
    console.log("[ReleasePage] openReleaseConfirmDialog called for ID:", pokemonId, "Name:", pokemonName)
    setPokemonToReleaseId(pokemonId)
    setPokemonToReleaseName(pokemonName)
    setShowConfirmDialog(true)
  }

  const closeReleaseConfirmDialog = () => {
    console.log("[ReleasePage] closeReleaseConfirmDialog called.")
    setShowConfirmDialog(false)
    setPokemonToReleaseId(null)
    setPokemonToReleaseName(null)
  }

  const confirmRelease = async () => {
    console.log("[ReleasePage] Starting confirmRelease for ID:", pokemonToReleaseId)
    if (!pokemonToReleaseId) {
      console.error("[ReleasePage] No Pokemon ID to release.")
      return
    }

    setReleaseError(null)
    console.log("[ReleasePage] Setting releasingPokemon to:", pokemonToReleaseId)
    setReleasingPokemon(pokemonToReleaseId)

    const gameState = GameStateManager.getInstance()
    try {
      console.log("[ReleasePage] Calling releasePokemon for ID:", pokemonToReleaseId)
      const result = await gameState.releasePokemon(pokemonToReleaseId)
      console.log("[ReleasePage] releasePokemon call completed. Result:", result)

      if (!result.success) {
        setReleaseError(result.error || "Failed to release Pokémon. Please try again.")
        console.error("[ReleasePage] Release failed:", result.error)
        toast({
          title: "Error al liberar Pokémon",
          description: result.error || "Ocurrió un error inesperado.",
          variant: "destructive",
        })
      } else {
        console.log("[ReleasePage] Pokémon successfully released.")
        toast({
          title: "Pokémon Liberado",
          description: `${pokemonToReleaseName} ha sido liberado exitosamente.`,
          className: "bg-green-100 text-green-800 border-green-400",
          action: <CheckCircle className="w-5 h-5 text-green-600" />,
        })
      }
    } catch (error: any) {
      console.error("[ReleasePage] Error in confirmRelease:", error)
      setReleaseError(error.message || "An unexpected error occurred while releasing Pokémon.")
      toast({
        title: "Error al liberar Pokémon",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      })
    } finally {
      console.log("[ReleasePage] Entering finally block.")
      console.log("[ReleasePage] Resetting releasingPokemon to null.")
      setReleasingPokemon(null)
      closeReleaseConfirmDialog()
      console.log("[ReleasePage] confirmRelease finished.")
    }
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
        title="Liberar Pokémon"
        subtitle="Elige un Pokémon para liberar de tu equipo"
        variant="danger"
        actions={
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg px-4 py-2 border-2 border-red-900 shadow-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                <span className={`${pokemonTheme.typography.button} text-red-800`}>Equipo: {adoptedTeam.length}/6</span>
              </div>
            </div>

            <ClassicButton onClick={handleBack} variant="accent" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Equipo
            </ClassicButton>
          </div>
        }
      />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Removed the redundant ClassicCard that caused the header overlap */}

          {releaseError && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{releaseError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adoptedTeam.map((pokemon) => {
              const isDisabled = releasingPokemon === pokemon.id
              console.log(
                `[ReleasePage] Pokemon ID: ${pokemon.id}, releasingPokemon: ${releasingPokemon}, isDisabled: ${isDisabled}`,
              )
              return (
                <ClassicCard
                  key={pokemon.id}
                  variant="secondary"
                  className="hover:shadow-2xl transition-all duration-300"
                >
                  <div className="text-center relative">
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

                    {/* Stats Summary (simplified for release page) */}
                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-600">
                      <div className="bg-gray-100 rounded p-2 border border-gray-300 flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="font-medium">Felicidad: {pokemon.happiness}%</span>
                      </div>
                      <div className="bg-gray-100 rounded p-2 border border-gray-300 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3 text-green-500" />
                        <span className="font-medium">Salud: {pokemon.health}%</span>
                      </div>
                    </div>

                    {/* Release Button */}
                    <ClassicButton
                      onClick={() => {
                        console.log("[ReleasePage] Release button clicked for Pokemon ID:", pokemon.id)
                        openReleaseConfirmDialog(pokemon.id, pokemon.pokemon_name)
                      }}
                      disabled={isDisabled}
                      variant="danger"
                      size="md"
                      className="w-full mt-6"
                    >
                      {isDisabled ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Liberando...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Liberar Pokémon
                        </>
                      )}
                    </ClassicButton>
                  </div>
                </ClassicCard>
              )
            })}
          </div>
        </div>
      </main>

      {/* Custom Release Confirmation Dialog */}
      {showConfirmDialog && pokemonToReleaseId && pokemonToReleaseName && (
        <ReleaseConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={closeReleaseConfirmDialog}
          onConfirm={confirmRelease}
          pokemonName={pokemonToReleaseName}
          isReleasing={releasingPokemon === pokemonToReleaseId}
        />
      )}
    </div>
  )
}
