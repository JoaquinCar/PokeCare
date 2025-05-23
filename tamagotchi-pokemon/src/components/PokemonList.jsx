import React, { useEffect, useState } from 'react';
import PokemonCard from './PokemonCard';
import RegionPagination from './RegionPagination';
import { fetchPokemonsByRegion } from '../services/pokeapi';
import axios from 'axios';

const regions = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];
const PAGE_SIZE = 12;

const PokemonList = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState('kanto');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1); // Reset page when region changes
  }, [region]);

  useEffect(() => {
    const loadPokemons = async () => {
      setLoading(true);
      // 1. Traer todos los Pokémon de la región
      const data = await fetchPokemonsByRegion(region);

      // 2. Obtener detalles de especie para todos los Pokémon de la región (solo una vez)
      const speciesResponses = await Promise.all(
        data.map(pokemon => axios.get(pokemon.url))
      );

      // 3. Filtrar solo formas base
      const basePokemonsData = data.filter((pokemon, idx) =>
        !speciesResponses[idx].data.evolves_from_species
      );

      // 4. Calcular total de páginas solo con formas base
      setTotalPages(Math.ceil(basePokemonsData.length / PAGE_SIZE));

      // 5. Obtener solo los de la página actual
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageBasePokemons = basePokemonsData.slice(start, end);

      // 6. Peticiones en paralelo para obtener sprites solo de la página actual
      const pokeResponses = await Promise.all(
        pageBasePokemons.map(pokemon =>
          axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
        )
      );

      const basePokemons = pageBasePokemons.map((pokemon, idx) => ({
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokeResponses[idx].data.sprites.versions['generation-v']['black-white'].animated.front_default,
      }));

      setPokemons(basePokemons);
      setLoading(false);
    };

    loadPokemons();
  }, [region, page]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <RegionPagination regions={regions} currentRegion={region} onRegionChange={setRegion} />
      <div className="pokemon-list">
        {pokemons.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
      <div style={{ margin: '2em 0', textAlign: 'center' }}>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Anterior</button>
        <span style={{ margin: '0 1em' }}>Página {page} de {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Siguiente</button>
      </div>
    </div>
  );
};

export default PokemonList;