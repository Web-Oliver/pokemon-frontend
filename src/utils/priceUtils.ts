/**
 * Price Utilities - Context7 Price Formatting
 * 
 * Helper functions for handling price display and Decimal128 conversion
 * from MongoDB backend responses.
 */

// Context7 Price Formatter - Handles Decimal128 objects and numbers
export const formatPrice = (price: any): string | null => {
  if (!price && price !== 0) return null;
  
  // Handle different price formats from backend
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
  
  // Return formatted price with proper currency
  return isNaN(numericPrice) ? null : numericPrice.toString();
};

// Context7 Compact Number Formatter - Format large numbers with K notation
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
  }
  return num.toString();
};

// Context7 Price Display - Format for UI display with currency
export const displayPrice = (price: any, currency: string = 'kr.', compact: boolean = false): string | null => {
  const formattedPrice = formatPrice(price);
  if (!formattedPrice) return null;
  
  const numericPrice = parseFloat(formattedPrice);
  const displayValue = compact ? formatCompactNumber(numericPrice) : numericPrice.toLocaleString();
  
  return `${displayValue} ${currency}`;
};

// Context7 Price Change - Format price change with percentage
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
    isIncrease: change > 0
  };
};