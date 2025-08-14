/**
 * COLOR UTILITIES - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Color manipulation utilities
 */

/**
 * Convert OKLCH to HSL for shadcn/ui compatibility
 */
export function oklchToHsl(oklch: string): string {
  // Basic conversion placeholder
  // In a full implementation, this would use proper color conversion
  const match = oklch.match(/oklch\(([^)]+)\)/);
  if (match) {
    const [l, c, h] = match[1].split(' ').map(Number);
    // Simplified conversion
    return `${Math.round(h || 0)} ${Math.round((c || 0) * 100)}% ${Math.round((l || 0) * 100)}%`;
  }
  return oklch;
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Add alpha to color
 */
export function addAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  if (color.startsWith('oklch')) {
    // Add alpha to OKLCH (simplified)
    return color.replace('oklch(', `oklch(${alpha} `);
  }
  
  return color;
}

/**
 * Get Pokemon brand color by name
 */
export function getPokemonColor(name: 'red' | 'blue' | 'yellow' | 'green' | 'gold'): string {
  const colors = {
    red: '#FF0000',
    blue: '#0075BE',
    yellow: '#FFDE00',
    green: '#00A350',
    gold: '#B3A125'
  };
  return colors[name];
}

/**
 * Create gradient string
 */
export function createGradient(from: string, to: string, direction = '135deg'): string {
  return `linear-gradient(${direction}, ${from}, ${to})`;
}