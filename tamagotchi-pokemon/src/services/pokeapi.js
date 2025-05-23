import axios from 'axios';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

export async function fetchPokemonsByRegion(region) {
  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/region/${region}`);
    const pokedexes = response.data.pokedexes;
    if (!Array.isArray(pokedexes) || pokedexes.length === 0) {
      throw new Error('No pokedexes found for this region');
    }
    // Buscar el primer pokédex con entradas
    let pokedexUrl = null;
    for (const pokedex of pokedexes) {
      const res = await axios.get(pokedex.url);
      if (res.data.pokemon_entries && res.data.pokemon_entries.length > 0) {
        pokedexUrl = pokedex.url;
        break;
      }
    }
    if (!pokedexUrl) throw new Error('No pokedex with entries found for this region');
    const pokedexResponse = await axios.get(pokedexUrl);
    return pokedexResponse.data.pokemon_entries.map(entry => ({
      id: entry.entry_number,
      name: entry.pokemon_species.name,
      url: entry.pokemon_species.url,
    }));
  } catch (error) {
    console.error('Error fetching Pokémon by region:', error);
    return [];
  }
};

export const fetchPokemonDetails = async (pokemonName) => {
  try {
const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${pokemonName}`);    return {
      stats: response.data.stats,
      evolutions: await fetchEvolutions(response.data.species.url),
    };
  } catch (error) {
    console.error('Error fetching Pokémon details:', error);
    throw error;
  }
};

const fetchEvolutions = async (speciesUrl) => {
  try {
    const response = await axios.get(speciesUrl);
    const evolutionChainUrl = response.data.evolution_chain.url;
    const evolutionResponse = await axios.get(evolutionChainUrl);
    return evolutionResponse.data.chain;
  } catch (error) {
    console.error('Error fetching evolutions:', error);
    throw error;
  }
};