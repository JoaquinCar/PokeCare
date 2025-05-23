import React from 'react';

const PokemonCard = ({ pokemon }) => (
  <div className="pokemon-card">
    <h3>{pokemon.name}</h3>
    {pokemon.sprite && <img src={pokemon.sprite} alt={pokemon.name} />}
  </div>
);

export default PokemonCard;