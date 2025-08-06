/**
 * Auction-related TypeScript interfaces
 * Updated to match ACTUAL backend Auction schema
 */

// Updated to match actual backend enum values
export type ItemCategory = 'SealedProduct' | 'PsaGradedCard' | 'RawCard';

// Updated IAuctionItem interface to match backend schema (polymorphic)
export interface IAuctionItem {
  itemId: string; // ObjectId - Reference to any collection item
  itemCategory: ItemCategory; // Type: "PsaGradedCard", "RawCard", "SealedProduct"
  sold: boolean; // Individual item sale status
  salePrice?: number; // Decimal128 -> convert to number
  // Additional fields for UI display (populated from referenced items)
  itemName?: string; // Display name populated from referenced item
  itemImage?: string; // Primary image populated from referenced item
  setName?: string; // Set name for the card
  grade?: string; // PSA grade for PSA cards
  condition?: string; // Condition for raw cards
  price?: number; // Original price of the item
}

// Updated IAuction interface to match backend Auctions schema
export interface IAuction {
  id: string;
  _id?: string; // MongoDB ObjectId (for backend compatibility)
  topText: string; // Auction description header (required)
  bottomText: string; // Auction description footer (required)
  auctionDate: string; // ISO date string - Scheduled auction date
  status: 'draft' | 'active' | 'sold' | 'expired'; // String enum - draft, active, sold, expired
  generatedFacebookPost?: string; // Auto-generated marketing content
  isActive: boolean; // Legacy field
  items: IAuctionItem[]; // Polymorphic item references
  totalValue: number; // Calculated total value
  soldValue: number; // Total sold value
  // Metadata
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
