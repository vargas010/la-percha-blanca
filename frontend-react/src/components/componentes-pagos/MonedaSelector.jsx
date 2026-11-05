import React from 'react';

function MonedaSelector({ currency, onCurrencyChange }) {
  return (
    <div className="currency-selector">
      <button 
        className={`currency-btn ${currency === 'BOB' ? 'active' : ''}`}
        onClick={() => onCurrencyChange('BOB')}
      >
        Bs. BOB
      </button>
      <button 
        className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
        onClick={() => onCurrencyChange('USD')}
      >
        $ USD
      </button>
    </div>
  );
}

export default MonedaSelector;