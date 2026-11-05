import React from 'react';
import { Icons } from './Icons';

function ClienteSearchBar({ searchTerm, onSearchChange, onClear }) {
  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <span className="search-icon"><Icons.Search /></span>
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={onClear}>
            <Icons.Close />
          </button>
        )}
      </div>
    </div>
  );
}

export default ClienteSearchBar;