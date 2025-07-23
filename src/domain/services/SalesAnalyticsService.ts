/**
 * Sales Analytics Domain Service
 * Core business logic for sales analytics, calculations, and data processing
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 */

import { ISale, ISalesGraphData } from '../models/sale';

/**
 * Calculate total revenue from sales data
 * @param sales - Array of sales transactions
 * @returns Total revenue amount
 */
export const calculateTotalRevenue = (sales: ISale[]): number => {
  if (!sales || sales.length === 0) {
    return 0;
  }

  return sales.reduce((total, sale) => {
    const soldPrice = Number(sale.actualSoldPrice) || 0;
    return total + soldPrice;
  }, 0);
};

/**
 * Calculate total profit from sales data
 * @param sales - Array of sales transactions
 * @returns Total profit amount
 */
export const calculateTotalProfit = (sales: ISale[]): number => {
  if (!sales || sales.length === 0) {
    return 0;
  }

  return sales.reduce((total, sale) => {
    const actualPrice = Number(sale.actualSoldPrice) || 0;
    const myPrice = Number(sale.myPrice) || 0;
    const profit = actualPrice - myPrice;
    return total + profit;
  }, 0);
};

/**
 * Process raw graph data for charting components
 * @param rawData - Raw time-series data from backend
 * @returns Processed graph data ready for charts
 */
interface RawGraphDataPoint {
  date?: string;
  _id?: { date?: string };
  sales?: number; // Backend uses 'sales' not 'revenue'
  revenue?: number; // Support both formats for backwards compatibility
  profit?: number;
  itemCount?: number; // Backend uses 'itemCount' not 'itemsSold'
  count?: number; // Support both formats for backwards compatibility
}

export const processGraphData = (rawData: RawGraphDataPoint[]): ISalesGraphData[] => {
  if (!rawData || rawData.length === 0) {
    return [];
  }

  return rawData.map(dataPoint => {
    const revenue = Number(dataPoint.sales || dataPoint.revenue) || 0;
    const profit = Number(dataPoint.profit) || 0;
    const itemsSold = Number(dataPoint.itemCount || dataPoint.count) || 0;

    // Calculate average margin: (profit / revenue) * 100
    const averageMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      date: dataPoint.date || dataPoint._id?.date || '',
      revenue,
      profit,
      itemsSold,
      averageMargin: Number(averageMargin.toFixed(2)),
    };
  });
};

/**
 * Aggregate sales data by category
 * @param sales - Array of sales transactions
 * @returns Category breakdown with counts and revenue
 */
export const aggregateByCategory = (sales: ISale[]) => {
  if (!sales || sales.length === 0) {
    return {
      psaGradedCard: { count: 0, revenue: 0, profit: 0 },
      rawCard: { count: 0, revenue: 0, profit: 0 },
      sealedProduct: { count: 0, revenue: 0, profit: 0 },
    };
  }

  const categoryData = {
    psaGradedCard: { count: 0, revenue: 0, profit: 0 },
    rawCard: { count: 0, revenue: 0, profit: 0 },
    sealedProduct: { count: 0, revenue: 0, profit: 0 },
  };

  sales.forEach(sale => {
    // Convert backend values to camelCase for internal use
    let categoryKey: keyof typeof categoryData;
    switch (sale.itemCategory) {
      case 'PSA Graded Card':
        categoryKey = 'psaGradedCard';
        break;
      case 'Raw Card':
        categoryKey = 'rawCard';
        break;
      case 'Sealed Product':
        categoryKey = 'sealedProduct';
        break;
      default:
        return; // Skip unknown categories
    }

    categoryData[categoryKey].count += 1;
    const actualPrice = Number(sale.actualSoldPrice) || 0;
    const myPrice = Number(sale.myPrice) || 0;
    const profit = actualPrice - myPrice;

    categoryData[categoryKey].revenue += actualPrice;
    categoryData[categoryKey].profit += profit;
  });

  return categoryData;
};

/**
 * Calculate trend analysis for time-series data
 * @param graphData - Array of time-series graph data
 * @returns Trend analysis including growth rates and patterns
 */
export const calculateTrendAnalysis = (graphData: ISalesGraphData[]) => {
  if (!graphData || graphData.length < 2) {
    return {
      revenueGrowthRate: 0,
      profitGrowthRate: 0,
      trend: 'stable' as 'up' | 'down' | 'stable',
    };
  }

  const sortedData = [...graphData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstPeriod = sortedData[0];
  const lastPeriod = sortedData[sortedData.length - 1];

  const revenueGrowthRate =
    firstPeriod.revenue > 0
      ? ((lastPeriod.revenue - firstPeriod.revenue) / firstPeriod.revenue) * 100
      : 0;

  const profitGrowthRate =
    firstPeriod.profit > 0
      ? ((lastPeriod.profit - firstPeriod.profit) / firstPeriod.profit) * 100
      : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (revenueGrowthRate > 5) {
    trend = 'up';
  } else if (revenueGrowthRate < -5) {
    trend = 'down';
  }

  return {
    revenueGrowthRate: Number(revenueGrowthRate.toFixed(2)),
    profitGrowthRate: Number(profitGrowthRate.toFixed(2)),
    trend,
  };
};

/**
 * Filter sales data by date range
 * @param sales - Array of sales transactions
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Filtered sales data
 */
export const filterSalesByDateRange = (
  sales: ISale[],
  startDate?: string,
  endDate?: string
): ISale[] => {
  if (!sales || sales.length === 0) {
    return [];
  }

  return sales.filter(sale => {
    const saleDate = new Date(sale.dateSold);

    if (startDate && saleDate < new Date(startDate)) {
      return false;
    }

    if (endDate && saleDate > new Date(endDate)) {
      return false;
    }

    return true;
  });
};

/**
 * Calculate key performance indicators
 * @param sales - Array of sales transactions
 * @returns KPI metrics for dashboard display
 */
export const calculateKPIs = (sales: ISale[]) => {
  if (!sales || sales.length === 0) {
    return {
      totalRevenue: 0,
      totalProfit: 0,
      averageMargin: 0,
      totalItems: 0,
      averageSalePrice: 0,
      bestPerformingCategory: '',
      profitabilityRatio: 0,
    };
  }

  const totalRevenue = calculateTotalRevenue(sales);
  const totalProfit = calculateTotalProfit(sales);
  const totalItems = sales.length;
  const averageSalePrice = totalRevenue > 0 ? totalRevenue / totalItems : 0;

  // Calculate average margin: (profit / revenue) * 100
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const profitabilityRatio = averageMargin; // Same as average margin

  const categoryBreakdown = aggregateByCategory(sales);
  const bestPerformingCategory = Object.entries(categoryBreakdown).reduce(
    (best, [category, data]) =>
      data.revenue > best.revenue ? { category, revenue: data.revenue } : best,
    { category: '', revenue: 0 }
  ).category;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalProfit: Number(totalProfit.toFixed(2)),
    averageMargin: Number(averageMargin.toFixed(2)),
    totalItems,
    averageSalePrice: Number(averageSalePrice.toFixed(2)),
    bestPerformingCategory,
    profitabilityRatio: Number(profitabilityRatio.toFixed(2)),
  };
};
