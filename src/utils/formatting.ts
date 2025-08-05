/**
 * Formatting Utilities - Consolidated Display & Formatting Functions
 *
 * Consolidates cardUtils.ts, priceUtils.ts, and timeUtils.ts into a single file
 * Following CLAUDE.md DRY principles to eliminate utility duplication
 *
 * Contains:
 * - Card name formatting and manipulation
 * - Price display and Decimal128 conversion
 * - Time formatting and relative time calculations
 * - Number and string formatting utilities
 */

// ========================================
// CARD FORMATTING UTILITIES
// ========================================

/**
 * Formats a card name for display by removing technical formatting
 * while preserving the original for backend validation
 *
 * @param cardName - Original card name like "Rayquaza-Holo-1st Edition (#015)"
 * @returns Formatted name like "Rayquaza Holo 1st Edition 015"
 */
export function formatCardNameForDisplay(cardName: string): string {
  if (!cardName) {
    return cardName;
  }

  return cardName
    .replace(/-/g, ' ') // Replace hyphens with spaces: "Rayquaza-Holo" → "Rayquaza Holo"
    .replace(/\(#(\d+)\)$/g, '$1') // Remove parentheses and # from number: "(#015)" → "015"
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Formats a display name that includes pokemon number
 *
 * @param cardName - Card name
 * @param pokemonNumber - Pokemon number (optional)
 * @returns Formatted display name
 */
export function formatDisplayNameWithNumber(
  cardName: string,
  pokemonNumber?: string
): string {
  const formattedName = formatCardNameForDisplay(cardName);

  if (pokemonNumber) {
    // If the name already ends with the number, don't duplicate it
    const trimmedNumber = pokemonNumber.replace(/^#/, ''); // Remove # prefix if present
    if (formattedName.endsWith(trimmedNumber)) {
      return formattedName;
    }
    return `${formattedName} ${trimmedNumber}`;
  }

  return formattedName;
}

/**
 * Extracts the original technical card name from a formatted display name
 * This is for cases where you need to reverse the formatting
 *
 * @param displayName - Formatted display name
 * @returns Original technical name (best effort reconstruction)
 */
export function reconstructTechnicalCardName(displayName: string): string {
  if (!displayName) {
    return displayName;
  }

  // This is a best-effort reconstruction and may not be perfect
  // It's better to store the original technical name separately
  return displayName
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/(\d+)$/, '(#$1)'); // Add parentheses and # to trailing number
}

/**
 * Type definition for card name information
 */
export interface CardNameInfo {
  originalName: string; // Technical name for backend: "Rayquaza-Holo-1st Edition (#015)"
  displayName: string; // User-friendly name: "Rayquaza Holo 1st Edition 015"
}

/**
 * Creates both original and display versions of a card name
 *
 * @param cardName - Original card name
 * @param pokemonNumber - Optional pokemon number
 * @returns Object with both original and display names
 */
export function createCardNameInfo(
  cardName: string,
  pokemonNumber?: string
): CardNameInfo {
  const originalName =
    pokemonNumber && !cardName.includes(pokemonNumber)
      ? `${cardName} (#${pokemonNumber})`
      : cardName;

  const displayName = formatDisplayNameWithNumber(cardName, pokemonNumber);

  return {
    originalName,
    displayName,
  };
}

// ========================================
// PRICE FORMATTING UTILITIES
// ========================================

/**
 * Context7 Price Formatter - Handles Decimal128 objects and numbers
 * Helper function for handling price display and Decimal128 conversion from MongoDB backend responses
 */
export const formatPrice = (price: any): string | null => {
  if (!price && price !== 0) {
    return null;
  }

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

/**
 * Format number in compact notation (1K, 1M, etc.)
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
  }
  return num.toString();
};

/**
 * Format bytes in human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Format percentage with consistent decimal places
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with separators (1,000,000)
 */
export const formatNumberWithSeparators = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Context7 Price Display - Format for UI display with currency
 */
export const displayPrice = (
  price: any,
  currency: string = 'kr.',
  compact: boolean = false
): string | null => {
  const formattedPrice = formatPrice(price);
  if (!formattedPrice) {
    return null;
  }

  const numericPrice = parseFloat(formattedPrice);
  const displayValue = compact
    ? formatCompactNumber(numericPrice)
    : numericPrice.toLocaleString();

  return `${displayValue} ${currency}`;
};

/**
 * Context7 Price Change - Format price change with percentage
 */
export const formatPriceChange = (
  oldPrice: any,
  newPrice: any
): { change: number; percentage: number; isIncrease: boolean } | null => {
  const oldNum = formatPrice(oldPrice);
  const newNum = formatPrice(newPrice);

  if (!oldNum || !newNum) {
    return null;
  }

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

// ========================================
// TIME FORMATTING UTILITIES
// ========================================

/**
 * Calculate relative time from a timestamp
 * Returns human-readable relative time like "2 minutes ago", "1 hour ago", etc.
 */
export const getRelativeTime = (timestamp: string | Date): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now.getTime() - past.getTime();

  // Convert to different time units
  const minutes = Math.floor(diffInMs / 60000);
  const hours = Math.floor(diffInMs / 3600000);
  const days = Math.floor(diffInMs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // Return appropriate format based on time elapsed
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (weeks < 4) {
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (months < 12) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Format timestamp for display
 * Returns relative time if recent, otherwise formatted date
 */
export const formatTimestamp = (timestamp: string | Date): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInDays = Math.floor((now.getTime() - past.getTime()) / 86400000);

  // Use relative time for recent activities (within 7 days)
  if (diffInDays < 7) {
    return getRelativeTime(timestamp);
  }

  // Use formatted date for older activities
  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Get formatted date string
 */
export const formatDate = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get formatted time string
 */
export const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get formatted date and time string
 */
export const formatDateTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date with time for auction display
 * Matches the format used in Auctions component
 */
export const formatDateWithTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

// ========================================
// IMAGE URL PROCESSING UTILITIES
// ========================================

/**
 * Process image URLs for consistent display
 * Handles localhost prefix cleanup and proper URL construction
 * Moved from CreateAuction.tsx following DRY principles
 */
export const processImageUrl = (
  imagePath: string | undefined
): string | undefined => {
  if (!imagePath) {
    return undefined;
  }

  // Use regex for more efficient multiple localhost prefix cleanup
  const cleanPath = imagePath.replace(
    /(http:\/\/localhost:3000)+/g,
    'http://localhost:3000'
  );

  // If it's already a full URL after cleaning, return as-is
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // If it starts with /, it's already a proper absolute path
  if (cleanPath.startsWith('/')) {
    return `http://localhost:3000${cleanPath}`;
  }

  // Otherwise, assume it needs to be prefixed with the uploads path
  return `http://localhost:3000/uploads/${cleanPath}`;
};