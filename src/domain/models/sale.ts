/**
 * Sales Analytics TypeScript interfaces
 * Updated to match ACTUAL backend /api/sales endpoints
 */

// Updated ISalesSummary interface based on backend /api/sales/summary response
export interface ISalesSummary {
  totalRevenue: number; // Total revenue from all sales
  totalProfit: number; // Total profit (revenue - costs) 
  averageMargin: number; // Average profit margin percentage
  totalItems: number; // Total number of items sold
  categoryBreakdown: {
    psaGradedCard: {
      count: number;
      revenue: number;
    };
    rawCard: {
      count: number;
      revenue: number;
    };
    sealedProduct: {
      count: number;
      revenue: number;
    };
  };
}

// Updated ISalesGraphData interface based on backend /api/sales/graph-data
export interface ISalesGraphData {
  date: string; // ISO date string
  revenue: number; // Revenue for this date (mapped from backend 'sales')
  profit: number; // Profit for this date
  itemsSold?: number; // Number of items sold (mapped from backend 'itemCount')
  averageMargin?: number; // Average margin percentage (calculated client-side)
}

// Updated ISale interface for individual sale records (aggregated from sold items)
export interface ISale {
  id: string;
  itemCategory: string; // Type of item sold
  itemName: string; // Name/description of the item sold
  myPrice: number; // Original purchase/valuation price
  actualSoldPrice: number; // Actual price the item sold for
  dateSold: string; // ISO date string when the item was sold
  source: string; // Where/how the item was sold
}