// API Configuration
// Backend location: SAFESPACE/pokemon-collection-backend
// Backend runs on PORT 3000 (confirmed from server.js: const PORT = process.env.PORT || 3000)

/**
 * Environment-aware API base URL configuration
 * Supports development, staging, and production environments
 */
const getApiBaseUrl = (): string => {
  // Check if running in browser environment
  if (typeof window !== 'undefined') {
    // Production: Use same host as frontend
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:3000/api`;
    }
  }

  // Environment variable override (for Docker, staging, etc.)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Default development configuration
  return 'http://localhost:3000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// HTTP Configuration
export const HTTP_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  REQUEST_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'X-Requested-With': 'XMLHttpRequest',
  },
} as const;

// Enum definitions matching actual backend schema values
export enum PaymentMethod {
  CASH = 'CASH',
  MOBILEPAY = 'Mobilepay',
  BANK_TRANSFER = 'BankTransfer',
}

export enum DeliveryMethod {
  SENT = 'Sent',
  LOCAL_MEETUP = 'Local Meetup',
}

export enum Source {
  FACEBOOK = 'Facebook',
  DBA = 'DBA',
}

// Search Configuration
export const SEARCH_CONFIG = {
  DEFAULT_MIN_QUERY_LENGTH: 2,
  SEALED_PRODUCT_MIN_QUERY_LENGTH: 1, // Allow shorter queries for sealed products
  CARD_MIN_QUERY_LENGTH: 2,
  SET_MIN_QUERY_LENGTH: 1, // Allow shorter queries for sets
  DEBOUNCE_MS: 200,
  MAX_SUGGESTIONS: 15,
  CACHE_TTL_SETS: 300000, // 5 minutes
  CACHE_TTL_OTHERS: 180000, // 3 minutes
} as const;

// Auction Status Utilities moved to auctionStatusUtils.ts
// Import from: import { getStatusColor, getStatusPriority } from './auctionStatusUtils';
