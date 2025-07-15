/**
 * Sales Analytics Domain Service
 * Core business logic for sales analytics, calculations, and data processing
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 */

import { ISale, ISalesGraphData } from '../models/sale';

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
    const profit = sale.actualSoldPrice - sale.myPrice;
    return total + profit;
  }, 0);
};

/**
 * Calculate average profit margin from sales data
 * @param sales - Array of sales transactions
 * @returns Average profit margin as percentage
 */
export const calculateAverageMargin = (sales: ISale[]): number => {
  if (!sales || sales.length === 0) {
    return 0;
  }

  const totalMargin = sales.reduce((total, sale) => {
    const profit = sale.actualSoldPrice - sale.myPrice;
    const margin = sale.myPrice > 0 ? (profit / sale.myPrice) * 100 : 0;
    return total + margin;
  }, 0);

  return totalMargin / sales.length;
};

/**
 * Process raw graph data for charting components
 * @param rawData - Raw time-series data from backend
 * @returns Processed graph data ready for charts
 */
interface RawGraphDataPoint {
  date?: string;
  _id?: { date?: string };
  revenue?: number;
  profit?: number;
}

export const processGraphData = (rawData: RawGraphDataPoint[]): ISalesGraphData[] => {
  if (!rawData || rawData.length === 0) {
    return [];
  }

  return rawData.map((dataPoint) => ({
    date: dataPoint.date || dataPoint._id?.date || '',
    revenue: Number(dataPoint.revenue) || 0,
    profit: Number(dataPoint.profit) || 0,
  }));
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

  sales.forEach((sale) => {
    const category = sale.itemCategory as keyof typeof categoryData;
    if (categoryData[category]) {
      categoryData[category].count += 1;
      categoryData[category].revenue += sale.actualSoldPrice;
      const profit = sale.actualSoldPrice - sale.myPrice;
      categoryData[category].profit += profit;
    }
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

  const sortedData = [...graphData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstPeriod = sortedData[0];
  const lastPeriod = sortedData[sortedData.length - 1];

  const revenueGrowthRate = firstPeriod.revenue > 0 
    ? ((lastPeriod.revenue - firstPeriod.revenue) / firstPeriod.revenue) * 100
    : 0;

  const profitGrowthRate = firstPeriod.profit > 0
    ? ((lastPeriod.profit - firstPeriod.profit) / firstPeriod.profit) * 100
    : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (revenueGrowthRate > 5) trend = 'up';
  else if (revenueGrowthRate < -5) trend = 'down';

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

  return sales.filter((sale) => {
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

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.actualSoldPrice, 0);
  const totalProfit = calculateTotalProfit(sales);
  const averageMargin = calculateAverageMargin(sales);
  const totalItems = sales.length;
  const averageSalePrice = totalRevenue / totalItems;
  
  const categoryBreakdown = aggregateByCategory(sales);
  const bestPerformingCategory = Object.entries(categoryBreakdown)
    .reduce((best, [category, data]) => 
      data.revenue > best.revenue ? { category, revenue: data.revenue } : best
    , { category: '', revenue: 0 }).category;

  const profitabilityRatio = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

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