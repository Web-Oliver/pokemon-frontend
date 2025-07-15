/**
 * Common TypeScript interfaces shared across different data models
 * Corresponds to nested schemas used in the backend Mongoose models
 */

export interface IPriceHistoryEntry {
  price: number;
  dateUpdated: string; // ISO date string (backend uses Date, converted to string)
}

export interface IBuyerAddress {
  streetName?: string;
  postnr?: string; // Postal code
  city?: string;
}

// Updated to match actual backend saleDetails schema structure
export interface ISaleDetails {
  paymentMethod?: 'CASH' | 'Mobilepay' | 'BankTransfer';
  actualSoldPrice?: number; // Decimal128 in backend, converted to number
  deliveryMethod?: 'Sent' | 'Local Meetup';
  source?: 'Facebook' | 'DBA';
  dateSold?: string; // ISO date string (backend uses Date)
  buyerFullName?: string;
  buyerAddress?: IBuyerAddress;
  buyerPhoneNumber?: string;
  buyerEmail?: string;
  trackingNumber?: string;
}
