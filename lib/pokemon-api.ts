// Enhanced Pokemon API with caching and optimization
import { PokemonAssetOptimizer } from "./pokemon-asset-optimizer"

export class PokemonAPI {
  private static readonly BASE_URL = "https://pokeapi.co/api/v2"
  private static cache = new Map<string, any>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private static getCacheKey(endpoint: string): string {
    return `pokemon_${endpoint}`
  }

  private static isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private static async fetchWithCache(url: string): Promise<any> {
    const cacheKey = this.getCacheKey(url)
    const cached = this.cache.get(cacheKey)

    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      })

      return data
    } catch (error) {
      console.error(`Error fetching ${url}:`, error)
      return null
    }
  }

  public static async getPokemonByGeneration(start: number, end: number): Promise<any[]> {
    const batchSize = 20 // Process in smaller batches for better performance
    const results: any[] = []

    for (let i = start; i <= end; i += batchSize) {
      const batchEnd = Math.min(i + batchSize - 1, end)
      const batchPromises = []

      for (let j = i; j <= batchEnd; j++) {
        batchPromises.push(this.getPokemon(j))
      }

      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults.filter((pokemon) => pokemon !== null))
      } catch (error) {
        console.error(`Error fetching Pokemon batch ${i}-${batchEnd}:`, error)
      }
    }

    return results
  }

  public static async getPokemon(id: number | string): Promise<any | null> {
    const url = `${this.BASE_URL}/pokemon/${id}`
    const pokemon = await this.fetchWithCache(url)

    if (!pokemon) return null

    // Use optimized sprite URLs
    const assetOptimizer = PokemonAssetOptimizer.getInstance()

    // Prioritize animated sprites for better visual experience
    if (pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default) {
      pokemon.animatedSprite = pokemon.sprites.versions["generation-v"]["black-white"].animated.front_default
    } else if (pokemon.sprites?.front_default) {
      pokemon.animatedSprite = pokemon.sprites.front_default
    }

    // Preload the sprite for better performance
    if (pokemon.animatedSprite) {
      assetOptimizer.preloadImage(pokemon.animatedSprite).catch(() => {
        // Fallback to static sprite if animated fails
        if (pokemon.sprites?.front_default) {
          pokemon.animatedSprite = pokemon.sprites.front_default
        }
      })
    }

    return pokemon
  }

  public static async getPokemonSpecies(id: number): Promise<any | null> {
    const url = `${this.BASE_URL}/pokemon-species/${id}`
    return await this.fetchWithCache(url)
  }

  public static async getEvolutionChain(pokemonId: number): Promise<any | null> {
    try {
      const speciesData = await this.getPokemonSpecies(pokemonId)
      if (!speciesData?.evolution_chain?.url) return null

      return await this.fetchWithCache(speciesData.evolution_chain.url)
    } catch (error) {
      console.error(`Error fetching evolution chain for Pokemon ${pokemonId}:`, error)
      return null
    }
  }

  public static async getBasePokemonOnlyOptimized(start: number, end: number): Promise<any[]> {
    try {
      // Get Pokemon data in parallel batches
      const pokemonData = await this.getPokemonByGeneration(start, end)

      // Get species data in parallel
      const speciesPromises = pokemonData.map((pokemon) =>
        this.getPokemonSpecies(pokemon.id)
          .then((species) => ({ pokemon, species }))
          .catch(() => ({ pokemon, species: null })),
      )

      const pokemonWithSpecies = await Promise.all(speciesPromises)

      // Filter base Pokemon
      return pokemonWithSpecies
        .filter(({ species }) => species && !species.evolves_from_species)
        .map(({ pokemon }) => pokemon)
    } catch (error) {
      console.error("Error in optimized base Pokemon fetch:", error)
      return []
    }
  }

  // Clear cache method for memory management
  public static clearCache(): void {
    this.cache.clear()
  }

  // Get cache size for debugging
  public static getCacheSize(): number {
    return this.cache.size
  }

  public static async preloadGenerationAssets(start: number, end: number): Promise<void> {
    const assetOptimizer = PokemonAssetOptimizer.getInstance()
    const preloadPromises = []

    for (let i = start; i <= Math.min(start + 50, end); i++) {
      const animatedUrl = assetOptimizer.getOptimizedSpriteUrl(i, true)
      const staticUrl = assetOptimizer.getOptimizedSpriteUrl(i, false)

      preloadPromises.push(assetOptimizer.preloadImage(animatedUrl).catch(() => assetOptimizer.preloadImage(staticUrl)))
    }

    await Promise.allSettled(preloadPromises)
  }
}
