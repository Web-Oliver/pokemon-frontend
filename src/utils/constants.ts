// API Configuration
// Backend location: SAFESPACE/pokemon-collection-backend
// Backend runs on PORT 3000 (confirmed from server.js: const PORT = process.env.PORT || 3000)
export const API_BASE_URL = 'http://localhost:3000/api';

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
