/**
 * Price Formatting Utilities - Layer 2 Domain
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only price formatting and display
 * DRY: Single source for price utilities
 * Depends only on Layer 1 utilities
 */

import { formatCompact } from '../math/numbers';

/**
 * Format price from various backend formats (Decimal128, number, string)
 */
export const formatPrice = (price: any): string | null => {
  if (!price && price !== 0) return null;

  let numericPrice: number;

  if (typeof price === 'number') {
    numericPrice = price;
  } else if (price.$numberDecimal) {
    numericPrice = parseFloat(price.$numberDecimal);
  } else if (price.toString && typeof price.toString === 'function') {
    numericPrice = parseFloat(price.toString());
  } else if (typeof price === 'string') {
    numericPrice = parseFloat(price);
  } else {
    console.warn('[PRICE UTILS] Unknown price format:', price);
    return null;
  }

  return isNaN(numericPrice) ? null : numericPrice.toString();
};

/**
 * Display price with currency formatting - SOLID compliant currency enforcement
 * Single Responsibility: Handles only currency display formatting
 * Open/Closed: Extensible through parameters while enforcing kr currency
 */
export const displayPrice = (
  price: any,
  currency: string = 'kr',
  compact: boolean = false
): string | null => {
  const formattedPrice = formatPrice(price);
  if (!formattedPrice) return null;

  const numericPrice = parseFloat(formattedPrice);
  const displayValue = compact
    ? formatCompact(numericPrice)
    : numericPrice.toLocaleString();

  // SOLID: Dependency Inversion - enforce kr currency as business rule
  const enforceKrCurrency = currency === 'kr' || currency === 'kr.' || !currency;
  const finalCurrency = enforceKrCurrency ? 'kr' : currency;

  return `${displayValue} ${finalCurrency}`;
};

/**
 * Specialized currency formatter ensuring consistent kr display
 * Following Single Responsibility Principle for currency business logic
 */
export const displayKrPrice = (
  price: any,
  compact: boolean = false
): string | null => {
  return displayPrice(price, 'kr', compact);
};

/**
 * Format price with zero fallback - maintains consistency for empty states
 */
export const displayPriceWithFallback = (
  price: any,
  fallbackText: string = '0 kr',
  compact: boolean = false
): string => {
  const formatted = displayPrice(price, 'kr', compact);
  return formatted || fallbackText;
};

/**
 * Calculate and format price change
 */
export const formatPriceChange = (
  oldPrice: any,
  newPrice: any
): { change: number; percentage: number; isIncrease: boolean } | null => {
  const oldNum = formatPrice(oldPrice);
  const newNum = formatPrice(newPrice);

  if (!oldNum || !newNum) return null;

  const oldValue = parseFloat(oldNum);
  const newValue = parseFloat(newNum);
  const change = newValue - oldValue;
  const percentage = oldValue > 0 ? (change / oldValue) * 100 : 0;

  return {
    change,
    percentage,
    isIncrease: change > 0,
  };
};