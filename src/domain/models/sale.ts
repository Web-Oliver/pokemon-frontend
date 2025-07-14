/**
 * Sales Analytics TypeScript interfaces
 * Used for sales reporting, analytics, and financial tracking
 */

export interface ISalesSummary {
  totalRevenue: number; // Total revenue from all sales
  calculatedTotalProfit: number; // Total profit (revenue - costs)
  averageMargin: number; // Average profit margin percentage
  totalItemsSold: number; // Total number of items sold
  // Additional summary metrics
  averageSalePrice?: number;
  highestSale?: number;
  lowestSale?: number;
  revenueThisMonth?: number;
  revenueThisYear?: number;
}

export interface ISalesGraphData {
  date: string; // Date in YYYY-MM-DD format
  revenue: number; // Revenue for this date
  profit: number; // Profit for this date
  itemsSold?: number; // Number of items sold on this date
  averageMargin?: number; // Average margin for this date
}

export interface ISale {
  id: string;
  itemCategory: 'PsaGradedCard' | 'RawCard' | 'SealedProduct'; // Type of item sold (matches backend enum)
  itemName: string; // Name/description of the item sold
  itemId?: string; // Reference to the original collection item
  myPrice: number; // Original purchase/valuation price
  actualSoldPrice: number; // Actual price the item sold for
  calculatedProfit: number; // Profit = actualSoldPrice - myPrice - fees
  profitMargin: number; // Profit margin percentage
  dateSold: string; // ISO date string when the item was sold
  source: string; // Where/how the item was sold (eBay, local, etc.)
  fees?: number; // Platform fees, shipping costs, etc.
  paymentMethod?: string; // How payment was received
  buyerInfo?: string; // Basic buyer information (if relevant)
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}