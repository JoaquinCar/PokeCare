import React from 'react';
import PokemonList from '../components/PokemonList';
import RegionPagination from '../components/RegionPagination';

const Home = () => {
  return (
    <div>
      <h1>Tamagotchi Pokémon</h1>
      <RegionPagination />
      <PokemonList />
    </div>
  );
};

export default Home;