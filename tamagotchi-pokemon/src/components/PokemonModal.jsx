import React from 'react';

const PokemonModal = ({ pokemon, onClose }) => {
  if (!pokemon) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{pokemon.name}</h2>
        <img src={pokemon.gif} alt={pokemon.name} />
        <h3>Statistics</h3>
        <ul>
          {pokemon.stats.map(stat => (
            <li key={stat.name}>
              {stat.name}: {stat.value}
            </li>
          ))}
        </ul>
        <h3>Evolution</h3>
        <ul>
          {pokemon.evolution.map(evo => (
            <li key={evo.name}>{evo.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PokemonModal;