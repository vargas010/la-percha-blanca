// @utils/currency/formatCurrency.js

/**
 * Formatea un monto según la moneda seleccionada
 * @param {number} amount - Monto a formatear
 * @param {string} currency - 'BOB' o 'USD'
 * @param {number} exchangeRate - Tasa de cambio (BOB a USD)
 * @returns {string} Monto formateado
 */
export function formatCurrency(amount, currency = 'BOB', exchangeRate = 0.144) {
  if (!amount && amount !== 0) return currency === 'BOB' ? 'Bs. 0.00' : '$ 0.00';
  
  const convertedValue = currency === 'BOB' ? amount : amount * exchangeRate;
  const symbol = currency === 'BOB' ? 'Bs.' : '$';
  const locale = currency === 'BOB' ? 'es-BO' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency === 'BOB' ? 'BOB' : 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(convertedValue).replace(currency === 'BOB' ? 'BOB' : 'USD', symbol);
}

/**
 * Convierte un monto entre BOB y USD
 * @param {number} amount - Monto a convertir
 * @param {string} from - 'BOB' o 'USD'
 * @param {string} to - 'BOB' o 'USD'
 * @param {number} rate - Tasa de cambio
 * @returns {number} Monto convertido
 */
export function convertCurrency(amount, from, to, rate = 0.144) {
  if (from === to) return amount;
  if (from === 'BOB' && to === 'USD') return amount * rate;
  if (from === 'USD' && to === 'BOB') return amount / rate;
  return amount;
}