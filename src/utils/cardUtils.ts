/**
 * Card Utility Functions
 * 
 * Provides utility functions for card name formatting and manipulation
 * Following CLAUDE.md principles for clean, reusable utilities
 */

/**
 * Formats a card name for display by removing technical formatting
 * while preserving the original for backend validation
 * 
 * @param cardName - Original card name like "Rayquaza-Holo-1st Edition (#015)"
 * @returns Formatted name like "Rayquaza Holo 1st Edition 015"
 */
export function formatCardNameForDisplay(cardName: string): string {
  if (!cardName) return cardName;
  
  return cardName
    .replace(/-/g, ' ')                    // Replace hyphens with spaces: "Rayquaza-Holo" → "Rayquaza Holo"
    .replace(/\(#(\d+)\)$/g, '$1')        // Remove parentheses and # from number: "(#015)" → "015"
    .replace(/\s+/g, ' ')                 // Replace multiple spaces with single space
    .trim();                               // Remove leading/trailing whitespace
}

/**
 * Formats a display name that includes pokemon number
 * 
 * @param cardName - Card name
 * @param pokemonNumber - Pokemon number (optional)
 * @returns Formatted display name
 */
export function formatDisplayNameWithNumber(cardName: string, pokemonNumber?: string): string {
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
  if (!displayName) return displayName;
  
  // This is a best-effort reconstruction and may not be perfect
  // It's better to store the original technical name separately
  return displayName
    .replace(/\s+/g, '-')                  // Replace spaces with hyphens
    .replace(/(\d+)$/, '(#$1)');          // Add parentheses and # to trailing number
}

/**
 * Type definition for card name information
 */
export interface CardNameInfo {
  originalName: string;      // Technical name for backend: "Rayquaza-Holo-1st Edition (#015)"
  displayName: string;       // User-friendly name: "Rayquaza Holo 1st Edition 015"
}

/**
 * Creates both original and display versions of a card name
 * 
 * @param cardName - Original card name
 * @param pokemonNumber - Optional pokemon number
 * @returns Object with both original and display names
 */
export function createCardNameInfo(cardName: string, pokemonNumber?: string): CardNameInfo {
  const originalName = pokemonNumber && !cardName.includes(pokemonNumber) 
    ? `${cardName} (#${pokemonNumber})`
    : cardName;
    
  const displayName = formatDisplayNameWithNumber(cardName, pokemonNumber);
  
  return {
    originalName,
    displayName
  };
}