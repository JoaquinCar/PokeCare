// Patrón Singleton + Observer para gestión del estado del juego
import { supabase } from "./supabase"
import { AuthManager } from "./auth"

type Observer = () => void

export class GameStateManager {
  private static instance: GameStateManager
  private adoptedPokemonTeam: any[] = []
  private observers: Observer[] = []
  private evolutionChains: { [pokemonId: string]: any } = {}

  private constructor() {
    this.loadTeamFromDatabase()
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
    if (!user) return false

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

      const { data, error } = await supabase
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

      if (error) {
        console.error("Error adopting Pokemon:", error)
        return false
      }

      // Load evolution chain
      const { PokemonAPI } = await import("./pokemon-api")
      this.evolutionChains[pokemon.id] = await PokemonAPI.getEvolutionChain(pokemon.id)

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

      const { error } = await supabase
        .from("pokemon_team")
        .update({
          ...stats,
          updated_at: new Date().toISOString(),
        })
        .eq("id", pokemonTeamId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating Pokemon stats:", error)
        return
      }

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
  }> {
    const pokemon = this.adoptedPokemonTeam.find((p) => p.id === pokemonTeamId)
    if (!pokemon) return { success: false, evolved: false, megaEvolved: false }

    let statChanges: any = {}
    let activityPoints = 0

    switch (foodType) {
      case "berry":
        statChanges = {
          hunger: Math.min(100, pokemon.hunger + 25),
          happiness: Math.min(100, pokemon.happiness + 10),
          health: Math.min(100, pokemon.health + 5),
        }
        activityPoints = 15
        break
      case "potion":
        statChanges = {
          health: Math.min(100, pokemon.health + 30),
          energy: Math.min(100, pokemon.energy + 15),
          happiness: Math.min(100, pokemon.happiness + 5),
        }
        activityPoints = 20
        break
      case "candy":
        statChanges = {
          happiness: Math.min(100, pokemon.happiness + 20),
          energy: Math.min(100, pokemon.energy + 10),
          hunger: Math.min(100, pokemon.hunger + 10),
        }
        activityPoints = 25
        break
    }

    statChanges.activity_points = pokemon.activity_points + activityPoints
    statChanges.total_actions = pokemon.total_actions + 1

    await this.updatePokemonStats(pokemonTeamId, statChanges)

    const result = { success: true, evolved: false, megaEvolved: false, newStats: statChanges }

    // Check for evolution
    if (this.canEvolve(pokemon, statChanges)) {
      await this.evolve(pokemonTeamId)
      result.evolved = true
    }

    // Check for mega evolution
    if (this.canMegaEvolve(pokemon, statChanges)) {
      await this.megaEvolve(pokemonTeamId)
      result.megaEvolved = true
    }

    return result
  }

  private canEvolve(pokemon: any, newStats: any): boolean {
    const evolutionChain = this.evolutionChains[pokemon.pokemon_id]
    if (!evolutionChain) return false

    const nextEvolution = this.getNextEvolution(pokemon.pokemon_data, evolutionChain)
    if (!nextEvolution) return false

    const requiredPoints = 100 + pokemon.pokemon_id * 10
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

    return newStats.happiness >= 90 && newStats.total_actions >= 50
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

    const requiredPoints = 100 + pokemon.pokemon_id * 10
    return Math.min((pokemon.activity_points / requiredPoints) * 100, 100)
  }

  public async releasePokemon(pokemonTeamId: string): Promise<void> {
    const user = AuthManager.getInstance().getCurrentUser()
    if (!user) return

    try {
      // Check if table exists first
      const { error: tableCheckError } = await supabase.from("pokemon_team").select("id").limit(1)

      if (tableCheckError) {
        if (tableCheckError.message.includes('relation "public.pokemon_team" does not exist')) {
          console.error("Database tables not created yet. Cannot release Pokemon.")
          return
        }
        console.error("Error checking pokemon_team table:", tableCheckError)
        return
      }

      const { error } = await supabase.from("pokemon_team").delete().eq("id", pokemonTeamId).eq("user_id", user.id)

      if (!error) {
        await this.loadTeamFromDatabase()
      }
    } catch (error) {
      console.error("Error releasing Pokemon:", error)
    }
  }
}
