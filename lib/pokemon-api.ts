// Controlador para interactuar con la PokéAPI
export class PokemonAPI {
  private static readonly BASE_URL = "https://pokeapi.co/api/v2"

  public static async getPokemonByGeneration(start: number, end: number): Promise<any[]> {
    const promises = []

    for (let i = start; i <= end; i++) {
      promises.push(this.getPokemon(i))
    }

    try {
      const results = await Promise.all(promises)
      return results.filter((pokemon) => pokemon !== null)
    } catch (error) {
      console.error("Error fetching Pokemon:", error)
      return []
    }
  }

  public static async getPokemon(id: number | string): Promise<any | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/pokemon/${id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const pokemon = await response.json()

      // Priorizar GIFs animados
      if (pokemon.sprites?.versions?.["generation-v"]?.["black-white"]?.animated?.front_default) {
        pokemon.animatedSprite = pokemon.sprites.versions["generation-v"]["black-white"].animated.front_default
      } else if (pokemon.sprites?.front_default) {
        pokemon.animatedSprite = pokemon.sprites.front_default
      }

      return pokemon
    } catch (error) {
      console.error(`Error fetching Pokemon ${id}:`, error)
      return null
    }
  }

  public static async getPokemonSpecies(id: number): Promise<any | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/pokemon-species/${id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching Pokemon species ${id}:`, error)
      return null
    }
  }

  public static async getEvolutionChain(pokemonId: number): Promise<any | null> {
    try {
      // Primero obtenemos la especie para conseguir la URL de evolución
      const speciesResponse = await fetch(`${this.BASE_URL}/pokemon-species/${pokemonId}`)
      if (!speciesResponse.ok) return null

      const speciesData = await speciesResponse.json()

      // Luego obtenemos la cadena evolutiva
      const evolutionResponse = await fetch(speciesData.evolution_chain.url)
      if (!evolutionResponse.ok) return null

      return await evolutionResponse.json()
    } catch (error) {
      console.error(`Error fetching evolution chain for Pokemon ${pokemonId}:`, error)
      return null
    }
  }

  public static async getBasePokemonOnly(start: number, end: number): Promise<any[]> {
    const allPokemon = await this.getPokemonByGeneration(start, end)
    const basePokemon = []

    for (const pokemon of allPokemon) {
      try {
        const speciesResponse = await fetch(`${this.BASE_URL}/pokemon-species/${pokemon.id}`)
        if (speciesResponse.ok) {
          const speciesData = await speciesResponse.json()
          // Solo incluir si no evoluciona de otro Pokémon
          if (!speciesData.evolves_from_species) {
            basePokemon.push(pokemon)
          }
        }
      } catch (error) {
        console.error(`Error checking if Pokemon ${pokemon.id} is base form:`, error)
      }
    }

    return basePokemon
  }

  // Optimized version with parallel requests
  public static async getBasePokemonOnlyOptimized(start: number, end: number): Promise<any[]> {
    try {
      // First, get all Pokemon data in parallel
      const pokemonPromises = []
      for (let i = start; i <= end; i++) {
        pokemonPromises.push(this.getPokemon(i))
      }

      const allPokemon = await Promise.all(pokemonPromises)
      const validPokemon = allPokemon.filter((p) => p !== null)

      // Then, get all species data in parallel
      const speciesPromises = validPokemon.map((pokemon) =>
        fetch(`${this.BASE_URL}/pokemon-species/${pokemon.id}`)
          .then((response) => (response.ok ? response.json() : null))
          .catch(() => null),
      )

      const speciesData = await Promise.all(speciesPromises)

      // Filter base Pokemon
      const basePokemon = []
      for (let i = 0; i < validPokemon.length; i++) {
        const pokemon = validPokemon[i]
        const species = speciesData[i]

        if (species && !species.evolves_from_species) {
          basePokemon.push(pokemon)
        }
      }

      return basePokemon
    } catch (error) {
      console.error("Error in optimized base Pokemon fetch:", error)
      return []
    }
  }
}
