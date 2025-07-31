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

// Updated to match API documentation saleDetails schema structure
export interface ISaleDetails {
  payment?: string; // Payment method (e.g., "PayPal", "Cash", "BankTransfer")
  price?: number; // Sale price (Decimal128 in backend, converted to number)
  delivery?: string; // Delivery method (e.g., "DHL", "Local Meetup")
  source?: string; // Sale source (e.g., "eBay", "Facebook", "DBA")
  buyerFirstName?: string;
  buyerLastName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  saleDate?: string; // ISO date string (backend uses Date)
  
  // Legacy fields maintained for backwards compatibility
  paymentMethod?: 'CASH' | 'Mobilepay' | 'BankTransfer';
  actualSoldPrice?: number;
  deliveryMethod?: 'Sent' | 'Local Meetup';
  dateSold?: string;
  buyerFullName?: string;
  buyerAddress?: IBuyerAddress;
  buyerPhoneNumber?: string;
  buyerEmail?: string;
}
