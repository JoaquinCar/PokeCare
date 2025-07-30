// Enhanced Game State Manager with real-time stat decay and better messaging
import { supabase } from "./supabase"
import { AuthManager } from "./auth"

type Observer = () => void

export class GameStateManager {
  private static instance: GameStateManager
  private adoptedPokemonTeam: any[] = []
  private observers: Observer[] = []
  private evolutionChains: { [pokemonId: string]: any } = {}
  private statDecayInterval: NodeJS.Timeout | null = null
  private lastDecayTime: { [pokemonId: string]: number } = {}

  private constructor() {
    this.loadTeamFromDatabase()
    this.startStatDecay()
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager()
    }
    return GameStateManager.instance
  }

  // Patrón Observer
  public subscribe(observer: Observer): () => void {
    this.observers.push(observer)
    return () => {
      this.observers = this.observers.filter((obs) => obs !== observer)
    }
  }

  private notify(): void {
    this.observers.forEach((observer) => observer())
  }

  // Real-time stat decay system
  private startStatDecay(): void {
    // Clear existing interval if any
    if (this.statDecayInterval) {
      clearInterval(this.statDecayInterval)
    }

    // Decay stats every 30 seconds
    this.statDecayInterval = setInterval(() => {
      this.decayPokemonStats()
    }, 30000) // 30 seconds
  }

  private async decayPokemonStats(): Promise<void> {
    const user = AuthManager.getInstance().getCurrentUser()
    if (!user || this.adoptedPokemonTeam.length === 0) return

    const now = Date.now()
    let hasChanges = false

    for (const pokemon of this.adoptedPokemonTeam) {
      const lastDecay = this.lastDecayTime[pokemon.id] || now
      const timeSinceLastDecay = now - lastDecay

      // Only decay if enough time has passed (at least 25 seconds to avoid rapid decay)
      if (timeSinceLastDecay >= 25000) {
        const oldStats = {
          happiness: pokemon.happiness,
          health: pokemon.health,
          energy: pokemon.energy,
          hunger: pokemon.hunger,
        }

        // Calculate decay amounts (slower decay for better gameplay)
        const decayAmount = Math.floor(timeSinceLastDecay / 30000) // 1 point per 30 seconds

        const newStats = {
          happiness: Math.max(0, Math.round(pokemon.happiness - Math.min(decayAmount, 2))), // Ensure integer
          health: Math.max(10, Math.round(pokemon.health - Math.min(decayAmount, 1))), // Ensure integer, minimum 10%
          energy: Math.max(0, Math.round(pokemon.energy - Math.min(decayAmount * 1.5, 3))), // Ensure integer
          hunger: Math.max(0, Math.round(pokemon.hunger - Math.min(decayAmount * 2, 4))), // Ensure integer
        }

        // Only update if there are actual changes
        if (
          newStats.happiness !== oldStats.happiness ||
          newStats.health !== oldStats.health ||
          newStats.energy !== oldStats.energy ||
          newStats.hunger !== oldStats.hunger
        ) {
          await this.updatePokemonStats(pokemon.id, newStats)
          this.lastDecayTime[pokemon.id] = now
          hasChanges = true
        }
      }
    }

    if (hasChanges) {
      // Reload team to get fresh data
      await this.loadTeamFromDatabase()
    }
  }

  private async loadTeamFromDatabase(): Promise<void> {
    const user = AuthManager.getInstance().getCurrentUser()
    if (!user) return

    try {
      // Check if table exists first
      const { error: tableCheckError } = await supabase.from("pokemon_team").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation "public.pokemon_team" does not exist')) {
          console.warn("Database tables not created yet. Team will be empty.")
          this.adoptedPokemonTeam = []
          this.notify()
          return
        }
        console.error("Error checking pokemon_team table:", tableCheckError)
        return
      }

      const { data, error } = await supabase
        .from("pokemon_team")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error loading team:", error)
        return
      }

      this.adoptedPokemonTeam = data || []
      this.notify()
    } catch (error) {
      console.error("Error loading team from database:", error)
    }
  }

  public async adoptPokemon(pokemon: any): Promise<boolean> {
    const user = AuthManager.getInstance().getCurrentUser()
    if (!user) {
      console.error("No user logged in")
      return false
    }

    if (this.adoptedPokemonTeam.length >= 6) {
      return false // Team is full
    }

    // Check if already adopted
    if (this.adoptedPokemonTeam.find((p) => p.pokemon_id === pokemon.id)) {
      return false
    }

    try {
      // Check if table exists first
      const { error: tableCheckError } = await supabase.from("pokemon_team").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation "public.pokemon_team" does not exist')) {
          console.error("Database tables not created yet. Cannot adopt Pokemon.")
          return false
        }
        console.error("Error checking pokemon_team table:", tableCheckError)
        return false
      }

      // Ensure user profile exists before adopting Pokemon
      const authManager = AuthManager.getInstance()
      const userProfile = await authManager.getUserProfile()

      if (!userProfile) {
        console.error("User profile not found. Cannot adopt Pokemon.")
        return false
      }

      console.log("Adopting Pokemon for user:", user.id, "Pokemon:", pokemon.name)

      const { data, error } = await supabase
        .from("pokemon_team")
        .insert({
          user_id: user.id,
          pokemon_id: pokemon.id,
          pokemon_name: pokemon.name,
          pokemon_data: pokemon,
          happiness: Math.round(50), // Ensure integer
          health: Math.round(100), // Ensure integer
          energy: Math.round(50), // Ensure integer
          hunger: Math.round(50), // Ensure integer
          activity_points: Math.round(0), // Ensure integer
          total_actions: Math.round(0), // Ensure integer
          is_mega_evolved: false,
        })
        .select()
        .single()

      if (error) {
        console.error("Error adopting Pokemon:", error)

        // Handle foreign key constraint error specifically
        if (error.code === "23503" && error.message.includes("pokemon_team_user_id_fkey")) {
          console.error("User profile missing. Attempting to create it...")

          // Try to create user profile and retry
          const { error: profileError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email || "",
            username: user.user_metadata?.username || user.email?.split("@")[0] || `user_${Date.now()}`,
          })

          if (profileError) {
            console.error("Failed to create user profile:", profileError)
            return false
          }

          // Retry adoption after creating profile
          const { data: retryData, error: retryError } = await supabase
            .from("pokemon_team")
            .insert({
              user_id: user.id,
              pokemon_id: pokemon.id,
              pokemon_name: pokemon.name,
              pokemon_data: pokemon,
              happiness: 50,
              health: 100,
              energy: 50,
              hunger: 50,
              activity_points: 0,
              total_actions: 0,
              is_mega_evolved: false,
            })
            .select()
            .single()

          if (retryError) {
            console.error("Error adopting Pokemon after profile creation:", retryError)
            return false
          }

          console.log("Pokemon adopted successfully after profile creation:", retryData)
        } else {
          return false
        }
      } else {
        console.log("Pokemon adopted successfully:", data)
      }

      // Load evolution chain
      const { PokemonAPI } = await import("./pokemon-api")
      this.evolutionChains[pokemon.id] = await PokemonAPI.getEvolutionChain(pokemon.id)

      // Initialize decay timer for new Pokemon
      this.lastDecayTime[data?.id || pokemon.id] = Date.now()

      await this.loadTeamFromDatabase()
      return true
    } catch (error) {
      console.error("Error adopting Pokemon:", error)
      return false
    }
  }

  public getAdoptedTeam(): any[] {
    return this.adoptedPokemonTeam
  }

  public getAdoptedPokemon(): any | null {
    return this.adoptedPokemonTeam.length > 0 ? this.adoptedPokemonTeam[0] : null
  }

  private sanitizeStats(stats: any): any {
    const sanitized: any = {}

    if (stats.happiness !== undefined) sanitized.happiness = Math.max(0, Math.min(100, Math.round(stats.happiness)))
    if (stats.health !== undefined) sanitized.health = Math.max(0, Math.min(100, Math.round(stats.health)))
    if (stats.energy !== undefined) sanitized.energy = Math.max(0, Math.min(100, Math.round(stats.energy)))
    if (stats.hunger !== undefined) sanitized.hunger = Math.max(0, Math.min(100, Math.round(stats.hunger)))
    if (stats.activity_points !== undefined) sanitized.activity_points = Math.max(0, Math.round(stats.activity_points))
    if (stats.total_actions !== undefined) sanitized.total_actions = Math.max(0, Math.round(stats.total_actions))

    return sanitized
  }

  public async updatePokemonStats(
    pokemonTeamId: string,
    stats: {
      happiness?: number
      health?: number
      energy?: number
      hunger?: number
      activity_points?: number
      total_actions?: number
    },
  ): Promise<void> {
    const user = AuthManager.getInstance().getCurrentUser()
    if (!user) return

    try {
      // Check if table exists first
      const { error: tableCheckError } = await supabase.from("pokemon_team").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation "public.pokemon_team" does not exist')) {
          console.error("Database tables not created yet. Cannot update Pokemon stats.")
          return
        }
        console.error("Error checking pokemon_team table:", tableCheckError)
        return
      }

      // Sanitize stats to ensure they are integers within valid ranges
      const sanitizedStats = this.sanitizeStats(stats)

      const { error } = await supabase
        .from("pokemon_team")
        .update({
          ...sanitizedStats,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pokemonTeamId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating Pokemon stats:", error)
        return
      }

      // Update local state immediately for instant UI feedback
      const pokemonIndex = this.adoptedPokemonTeam.findIndex((p) => p.id === pokemonTeamId)
      if (pokemonIndex !== -1) {
        this.adoptedPokemonTeam[pokemonIndex] = {
          ...this.adoptedPokemonTeam[pokemonIndex],
          ...sanitizedStats,
          updated_at: new Date().toISOString(),
        }
        this.notify()
      }

      // Also reload from database to ensure consistency
      await this.loadTeamFromDatabase()
    } catch (error) {
      console.error("Error updating Pokemon stats:", error)
    }
  }

  public getPokemonStats(pokemonTeamId: string): any | null {
    return this.adoptedPokemonTeam.find((p) => p.id === pokemonTeamId) || null
  }

  public async feedPokemon(
    pokemonTeamId: string,
    foodType: "berry" | "potion" | "candy",
  ): Promise<{
    success: boolean
    evolved: boolean
    megaEvolved: boolean
    newStats?: any
    oldStats?: any
    statChanges?: any
  }> {
    const pokemon = this.adoptedPokemonTeam.find((p) => p.id === pokemonTeamId)
    if (!pokemon) return { success: false, evolved: false, megaEvolved: false }

    // Store old stats for animation
    const oldStats = {
      happiness: pokemon.happiness,
      health: pokemon.health,
      energy: pokemon.energy,
      hunger: pokemon.hunger,
      activity_points: pokemon.activity_points,
    }

    const newStats: any = { ...pokemon }
    let activityPoints = 0

    switch (foodType) {
      case "berry":
        newStats.happiness = Math.min(100, Math.round(pokemon.happiness + 10))
        newStats.health = Math.min(100, Math.round(pokemon.health + 5))
        newStats.hunger = Math.min(100, Math.round(pokemon.hunger + 25))
        activityPoints = 15
        break
      case "potion":
        newStats.health = Math.min(100, Math.round(pokemon.health + 30))
        newStats.energy = Math.min(100, Math.round(pokemon.energy + 15))
        newStats.happiness = Math.min(100, Math.round(pokemon.happiness + 5))
        activityPoints = 20
        break
      case "candy":
        newStats.happiness = Math.min(100, Math.round(pokemon.happiness + 20))
        newStats.energy = Math.min(100, Math.round(pokemon.energy + 10))
        newStats.hunger = Math.min(100, Math.round(pokemon.hunger + 10))
        activityPoints = 25
        break
    }

    newStats.activity_points = Math.round(pokemon.activity_points + activityPoints)
    newStats.total_actions = Math.round(pokemon.total_actions + 1)

    // Update stats in database and local state
    await this.updatePokemonStats(pokemonTeamId, {
      happiness: newStats.happiness,
      health: newStats.health,
      energy: newStats.energy,
      hunger: newStats.hunger,
      activity_points: newStats.activity_points,
      total_actions: newStats.total_actions,
    })

    // Reset decay timer for this Pokemon since it was just fed
    this.lastDecayTime[pokemonTeamId] = Date.now()

    const result = {
      success: true,
      evolved: false,
      megaEvolved: false,
      newStats,
      oldStats,
      statChanges: {
        happiness: newStats.happiness - oldStats.happiness,
        health: newStats.health - oldStats.health,
        energy: newStats.energy - oldStats.energy,
        hunger: newStats.hunger - oldStats.hunger,
        activity_points: activityPoints,
      },
    }

    // Check for evolution with reduced requirements
    if (this.canEvolve(pokemon, newStats)) {
      await this.evolve(pokemonTeamId)
      result.evolved = true
    }

    // Check for mega evolution
    if (this.canMegaEvolve(pokemon, newStats)) {
      await this.megaEvolve(pokemonTeamId)
      result.megaEvolved = true
    }

    return result
  }

  public canFeedPokemon(pokemonTeamId: string, foodType: "berry" | "potion" | "candy"): boolean {
    const pokemon = this.adoptedPokemonTeam.find((p) => p.id === pokemonTeamId)
    if (!pokemon) return false

    switch (foodType) {
      case "berry":
        return pokemon.hunger < 85 // Allow feeding when hunger is below 85%
      case "potion":
        return pokemon.health < 85 || pokemon.energy < 85 // Allow when either stat is below 85%
      case "candy":
        return pokemon.happiness < 85 // Allow when happiness is below 85%
      default:
        return false
    }
  }

  public getFeedingMessage(pokemonTeamId: string, foodType: "berry" | "potion" | "candy"): string {
    const pokemon = this.adoptedPokemonTeam.find((p) => p.id === pokemonTeamId)
    if (!pokemon) return "Pokemon not found"

    const name = pokemon.pokemon_name

    switch (foodType) {
      case "berry":
        if (pokemon.hunger >= 85) {
          return `${name} is completely satisfied! Their hunger is at ${pokemon.hunger}% - they don't need berries right now. 🍓✨`
        }
        return `${name} would love a berry! Their hunger is at ${pokemon.hunger}%.`

      case "potion":
        if (pokemon.health >= 85 && pokemon.energy >= 85) {
          return `${name} is in perfect condition! Health: ${pokemon.health}%, Energy: ${pokemon.energy}% - no potion needed! 🧪✨`
        }
        if (pokemon.health < 85 && pokemon.energy >= 85) {
          return `${name} could use healing! Health: ${pokemon.health}%, but energy is good at ${pokemon.energy}%.`
        }
        if (pokemon.health >= 85 && pokemon.energy < 85) {
          return `${name} needs energy! Energy: ${pokemon.energy}%, but health is good at ${pokemon.health}%.`
        }
        return `${name} needs both healing and energy! Health: ${pokemon.health}%, Energy: ${pokemon.energy}%.`

      case "candy":
        if (pokemon.happiness >= 85) {
          return `${name} is overjoyed! Their happiness is at ${pokemon.happiness}% - they're too happy for more candy right now! 🍬✨`
        }
        return `${name} would be thrilled with candy! Their happiness is at ${pokemon.happiness}%.`

      default:
        return "Unknown food type"
    }
  }

  public getPokemonNeedsLevel(pokemonTeamId: string): "critical" | "low" | "medium" | "good" | "excellent" {
    const pokemon = this.adoptedPokemonTeam.find((p) => p.id === pokemonTeamId)
    if (!pokemon) return "good"

    const avgStat = (pokemon.happiness + pokemon.health + pokemon.energy + pokemon.hunger) / 4

    if (avgStat < 20) return "critical"
    if (avgStat < 40) return "low"
    if (avgStat < 60) return "medium"
    if (avgStat < 80) return "good"
    return "excellent"
  }

  private canEvolve(pokemon: any, newStats: any): boolean {
    const evolutionChain = this.evolutionChains[pokemon.pokemon_id]
    if (!evolutionChain) return false

    const nextEvolution = this.getNextEvolution(pokemon.pokemon_data, evolutionChain)
    if (!nextEvolution) return false

    // FURTHER REDUCED EVOLUTION REQUIREMENTS - Even faster evolution
    const requiredPoints = Math.max(30, pokemon.pokemon_id * 1.5) // Reduced from Math.max(50, pokemon.pokemon_id * 2)
    return newStats.activity_points >= requiredPoints
  }

  private canMegaEvolve(pokemon: any, newStats: any): boolean {
    if (pokemon.is_mega_evolved) return false

    // Check if Pokemon has mega evolution capability
    const megaCapablePokemon = [
      3, 6, 9, 65, 94, 115, 127, 130, 142, 150, 181, 208, 212, 214, 229, 248, 254, 257, 260, 282, 302, 303, 306, 308,
      310, 319, 323, 334, 354, 359, 362, 373, 376, 380, 381, 384, 428, 445, 448, 460, 531, 719,
    ]

    if (!megaCapablePokemon.includes(pokemon.pokemon_id)) return false

    // Reduced mega evolution requirements
    return newStats.happiness >= 80 && newStats.total_actions >= 25 // Reduced from 90 happiness and 50 actions
  }

  private async evolve(pokemonTeamId: string): Promise<void> {
    const pokemon = this.adoptedPokemonTeam.find((p) => p.id === pokemonTeamId)
    const evolutionChain = this.evolutionChains[pokemon.pokemon_id]

    if (!pokemon || !evolutionChain) return

    const nextEvolution = this.getNextEvolution(pokemon.pokemon_data, evolutionChain)
    if (!nextEvolution) return

    try {
      const { PokemonAPI } = await import("./pokemon-api")
      const evolvedPokemon = await PokemonAPI.getPokemon(nextEvolution.species.name)

      if (evolvedPokemon) {
        // Check if table exists first
        const { error: tableCheckError } = await supabase.from("pokemon_team").select("id").limit(1)

        if (tableCheckError) {
          if (tableCheckError.message.includes('relation "public.pokemon_team" does not exist')) {
            console.error("Database tables not created yet. Cannot evolve Pokemon.")
            return
          }
          console.error("Error checking pokemon_team table:", tableCheckError)
          return
        }

        const { error } = await supabase
          .from("pokemon_team")
          .update({
            pokemon_id: evolvedPokemon.id,
            pokemon_name: evolvedPokemon.name,
            pokemon_data: evolvedPokemon,
            activity_points: 0, // Reset for next evolution
            updated_at: new Date().toISOString(),
          })
          .eq("id", pokemonTeamId)

        if (!error) {
          await this.loadTeamFromDatabase()
        }
      }
    } catch (error) {
      console.error("Error during evolution:", error)
    }
  }

  private async megaEvolve(pokemonTeamId: string): Promise<void> {
    try {
      // Check if table exists first
      const { error: tableCheckError } = await supabase.from("pokemon_team").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation "public.pokemon_team" does not exist')) {
          console.error("Database tables not created yet. Cannot mega evolve Pokemon.")
          return
        }
        console.error("Error checking pokemon_team table:", tableCheckError)
        return
      }

      const { error } = await supabase
        .from("pokemon_team")
        .update({
          is_mega_evolved: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pokemonTeamId)

      if (!error) {
        await this.loadTeamFromDatabase()
      }
    } catch (error) {
      console.error("Error during mega evolution:", error)
    }
  }

  private getNextEvolution(pokemon: any, evolutionChain: any): any {
    if (!evolutionChain) return null

    const findInChain = (chain: any): any => {
      if (chain.species.name === pokemon.name) {
        return chain.evolves_to.length > 0 ? chain.evolves_to[0] : null
      }

      for (const evolution of chain.evolves_to) {
        const result = findInChain(evolution)
        if (result) return result
      }

      return null
    }

    return findInChain(evolutionChain.chain)
  }

  public getEvolutionProgress(pokemonTeamId: string): number {
    const pokemon = this.adoptedPokemonTeam.find((p) => p.id === pokemonTeamId)
    if (!pokemon) return 0

    // Updated with further reduced requirements
    const requiredPoints = Math.max(30, Math.round(pokemon.pokemon_id * 1.5))
    const progress = Math.min((pokemon.activity_points / requiredPoints) * 100, 100)
    return Math.round(progress * 10) / 10 // Round to 1 decimal place for display
  }

  public async releasePokemon(pokemonTeamId: string): Promise<{ success: boolean; error?: string }> {
    const user = AuthManager.getInstance().getCurrentUser()
    if (!user) {
      console.error("[Release Pokemon] No user logged in.")
      return { success: false, error: "No user logged in. Please sign in." }
    }

    try {
      // Check if table exists first
      const { error: tableCheckError } = await supabase.from("pokemon_team").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation "public.pokemon_team" does not exist')) {
          console.error("[Release Pokemon] Database tables not created yet. Cannot release Pokemon.")
          return { success: false, error: "Database tables not found. Please ensure setup is complete." }
        }
        console.error("[Release Pokemon] Error checking pokemon_team table:", tableCheckError)
        return { success: false, error: `Database error: ${tableCheckError.message}` }
      }

      console.log(`[Release Pokemon] Attempting to release Pokemon with ID: ${pokemonTeamId} for user: ${user.id}`)
      const { data, error, count } = await supabase
        .from("pokemon_team")
        .delete()
        .eq("id", pokemonTeamId)
        .eq("user_id", user.id) // Ensure RLS is respected

      if (!error) {
        console.log(`[Release Pokemon] Pokemon released successfully. Count: ${count}, Data:`, data)
        // Remove from decay tracking
        delete this.lastDecayTime[pokemonTeamId]
        await this.loadTeamFromDatabase() // This should refresh the state
        return { success: true } // Indicate success
      } else {
        console.error("[Release Pokemon] Error releasing Pokemon:", error)
        // Log the full error object for detailed debugging
        console.error("[Release Pokemon] Supabase error details:", JSON.stringify(error, null, 2))
        return { success: false, error: error.message || "Failed to release Pokémon due to a database error." } // Indicate failure with message
      }
    } catch (error: any) {
      console.error("[Release Pokemon] Unexpected error during Pokemon release:", error)
      return { success: false, error: error.message || "An unexpected error occurred during release." } // Indicate failure with message
    }
  }

  // Cleanup method
  public destroy(): void {
    if (this.statDecayInterval) {
      clearInterval(this.statDecayInterval)
      this.statDecayInterval = null
    }
  }
}
