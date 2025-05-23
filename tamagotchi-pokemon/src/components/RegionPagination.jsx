import React from 'react';

const RegionPagination = ({ regions, currentRegion, onRegionChange }) => {
  if (!Array.isArray(regions) || regions.length === 0) {
    return null; // O puedes mostrar un mensaje alternativo
  }

  return (
    <div className="pagination">
      {regions.map((region) => (
        <button
          key={region}
          className={currentRegion === region ? 'active' : ''}
          onClick={() => onRegionChange(region)}
        >
          {region}
        </button>
      ))}
    </div>
  );
};

export default RegionPagination;