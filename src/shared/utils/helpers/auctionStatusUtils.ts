/**
 * Auction Status Utilities
 * Extracted from constants.ts to separate functional logic from constants
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles auction status logic
 * - Open/Closed: Extensible for new auction statuses
 * - DRY: Centralized auction status logic
 * - Layer 1: Core utility functions with no UI dependencies
 */

/**
 * Available auction statuses
 */
export const AUCTION_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired',
} as const;

export type AuctionStatus = typeof AUCTION_STATUSES[keyof typeof AUCTION_STATUSES];

/**
 * Get status color classes for auction status styling
 * Returns Tailwind CSS classes for premium design system
 * @param status - The auction status
 * @returns CSS classes for styling the status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case AUCTION_STATUSES.DRAFT:
      return 'bg-slate-100 text-slate-800 border border-slate-200';
    case AUCTION_STATUSES.ACTIVE:
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case AUCTION_STATUSES.SOLD:
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    case AUCTION_STATUSES.EXPIRED:
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-slate-100 text-slate-800 border border-slate-200';
  }
};

/**
 * Get status priority for sorting auction items
 * Returns numeric priority for auction status ordering (lower = higher priority)
 * @param status - The auction status
 * @returns Numeric priority for sorting
 */
export const getStatusPriority = (status: string): number => {
  switch (status) {
    case AUCTION_STATUSES.ACTIVE:
      return 1;
    case AUCTION_STATUSES.DRAFT:
      return 2;
    case AUCTION_STATUSES.SOLD:
      return 3;
    case AUCTION_STATUSES.EXPIRED:
      return 4;
    default:
      return 5;
  }
};

/**
 * Check if an auction status is active
 * @param status - The auction status to check
 * @returns true if the status indicates an active auction
 */
export const isActiveStatus = (status: string): boolean => {
  return status === AUCTION_STATUSES.ACTIVE;
};

/**
 * Check if an auction status is completed (sold or expired)
 * @param status - The auction status to check
 * @returns true if the status indicates a completed auction
 */
export const isCompletedStatus = (status: string): boolean => {
  return status === AUCTION_STATUSES.SOLD || status === AUCTION_STATUSES.EXPIRED;
};

/**
 * Get human-readable status label
 * @param status - The auction status
 * @returns User-friendly status label
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case AUCTION_STATUSES.DRAFT:
      return 'Draft';
    case AUCTION_STATUSES.ACTIVE:
      return 'Active';
    case AUCTION_STATUSES.SOLD:
      return 'Sold';
    case AUCTION_STATUSES.EXPIRED:
      return 'Expired';
    default:
      return 'Unknown';
  }
};

/**
 * Get all available auction statuses
 * @returns Array of all auction status values
 */
export const getAllStatuses = (): string[] => {
  return Object.values(AUCTION_STATUSES);
};

export default {
  AUCTION_STATUSES,
  getStatusColor,
  getStatusPriority,
  isActiveStatus,
  isCompletedStatus,
  getStatusLabel,
  getAllStatuses,
};