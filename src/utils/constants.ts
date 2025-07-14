// API Configuration
// Backend location: SAFESPACE/pokemon-collection-backend
export const API_BASE_URL = 'http://localhost:3001/api';

// Enum definitions for consistent data handling
export enum PaymentMethod {
  CASH = 'Cash',
  PAYPAL = 'PayPal',
  BANK_TRANSFER = 'Bank Transfer',
  CARD = 'Card',
  OTHER = 'Other'
}

export enum DeliveryMethod {
  PICKUP = 'Pickup',
  SENT = 'Sent'
}

export enum Source {
  FACEBOOK = 'Facebook',
  EBAY = 'eBay',
  TCGPLAYER = 'TCGPlayer',
  LOCAL_STORE = 'Local Store',
  FRIEND = 'Friend',
  OTHER = 'Other'
}