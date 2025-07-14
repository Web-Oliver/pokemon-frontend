/**
 * Auction-related TypeScript interfaces
 * Corresponds to Auction Mongoose schema
 */

// Updated to match actual backend enum values
export type ItemCategory = 'SealedProduct' | 'PsaGradedCard' | 'RawCard';

export interface IAuctionItem {
  itemId: string; // References the specific collection item (PSA card, raw card, or sealed product)
  itemCategory: ItemCategory;
  sold?: boolean; // Whether this specific item was sold
  soldPrice?: number; // Price this item sold for in the auction
  soldDate?: string; // ISO date string for when item was sold
  // Additional fields for UI display (populated from referenced items)
  itemName?: string; // Display name populated from referenced item
  itemImage?: string; // Primary image populated from referenced item
}

export interface IAuction {
  id: string;
  topText: string; // Text that appears at the top of the auction post
  bottomText: string; // Text that appears at the bottom of the auction post
  auctionDate: string; // ISO date string for when the auction is scheduled
  status: 'draft' | 'active' | 'sold' | 'expired'; // Current status of the auction
  generatedFacebookPost?: string; // Auto-generated Facebook post text
  isActive: boolean; // Whether the auction is currently active
  items: IAuctionItem[]; // Array of items included in this auction
  totalValue: number; // Total value of all items in the auction
  soldValue: number; // Total value of items actually sold
  // Metadata
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
}