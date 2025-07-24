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

// Auction Status Utilities
// Moved from Auctions.tsx following DRY principles

/**
 * Get status color - Premium design system
 * Returns Tailwind CSS classes for auction status styling
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return 'bg-slate-100 text-slate-800 border border-slate-200';
    case 'active':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'sold':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case 'expired':
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-slate-100 text-slate-800 border border-slate-200';
  }
};

/**
 * Get status priority for sorting
 * Returns numeric priority for auction status ordering
 */
export const getStatusPriority = (status: string): number => {
  switch (status) {
    case 'active':
      return 1;
    case 'draft':
      return 2;
    case 'sold':
      return 3;
    case 'expired':
      return 4;
    default:
      return 5;
  }
};
