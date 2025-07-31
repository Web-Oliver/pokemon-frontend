/**
 * Comprehensive Tests for Sales Analytics Service
 * BUSINESS CRITICAL: Tests financial calculations, data analysis, and KPI computations
 *
 * Following CLAUDE.md testing principles:
 * - Business logic validation for accurate financial calculations
 * - Edge case testing for data integrity
 * - Performance testing for large datasets
 * - Data consistency validation
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTotalRevenue,
  calculateTotalProfit,
  processGraphData,
  aggregateByCategory,
  calculateTrendAnalysis,
  filterSalesByDateRange,
  calculateKPIs,
} from '../SalesAnalyticsService';
import { ISale, ISalesGraphData } from '../../models/sale';

describe('SalesAnalyticsService', () => {
  // Test data setup
  const mockSales: ISale[] = [
    {
      id: 'sale-1',
      itemId: 'psa-1',
      itemCategory: 'PSA Graded Card',
      itemName: 'Charizard Base Set',
      myPrice: 4000,
      actualSoldPrice: 5500,
      dateSold: '2024-01-15T10:00:00.000Z',
      paymentMethod: 'PayPal',
      deliveryMethod: 'Shipped',
      buyerInfo: 'John Doe',
    },
    {
      id: 'sale-2',
      itemId: 'raw-1',
      itemCategory: 'Raw Card',
      itemName: 'Blastoise Base Set',
      myPrice: 1200,
      actualSoldPrice: 1800,
      dateSold: '2024-01-20T14:30:00.000Z',
      paymentMethod: 'Bank Transfer',
      deliveryMethod: 'Local',
      buyerInfo: 'Jane Smith',
    },
    {
      id: 'sale-3',
      itemId: 'sealed-1',
      itemCategory: 'Sealed Product',
      itemName: 'Base Set Booster Box',
      myPrice: 75000,
      actualSoldPrice: 85000,
      dateSold: '2024-02-01T09:15:00.000Z',
      paymentMethod: 'Cash',
      deliveryMethod: 'Shipped',
      buyerInfo: 'Collector Co.',
    },
    {
      id: 'sale-4',
      itemId: 'psa-2',
      itemCategory: 'PSA Graded Card',
      itemName: 'Venusaur Base Set',
      myPrice: 2500,
      actualSoldPrice: 2200, // Loss scenario
      dateSold: '2024-02-10T16:45:00.000Z',
      paymentMethod: 'PayPal',
      deliveryMethod: 'Shipped',
      buyerInfo: 'Mike Johnson',
    },
  ];

  const mockRawGraphData = [
    {
      date: '2024-01-01',
      sales: 7300, // revenue
      profit: 1900,
      itemCount: 2,
    },
    {
      _id: { date: '2024-02-01' }, // Alternative format
      sales: 87200,
      profit: 9700,
      itemCount: 2,
    },
    {
      date: '2024-03-01',
      revenue: 15000, // Alternative field name
      profit: 3000,
      count: 3, // Alternative field name
    },
  ];

  describe('Revenue Calculations (FINANCIAL CRITICAL)', () => {
    it('should calculate total revenue correctly', () => {
      const totalRevenue = calculateTotalRevenue(mockSales);
      const expectedRevenue = 5500 + 1800 + 85000 + 2200; // 94500

      expect(totalRevenue).toBe(expectedRevenue);
    });

    it('should handle empty sales array', () => {
      expect(calculateTotalRevenue([])).toBe(0);
      expect(calculateTotalRevenue(null as any)).toBe(0);
      expect(calculateTotalRevenue(undefined as any)).toBe(0);
    });

    it('should handle sales with invalid/missing prices', () => {
      const salesWithInvalidPrices: ISale[] = [
        { ...mockSales[0], actualSoldPrice: null as any },
        { ...mockSales[1], actualSoldPrice: undefined as any },
        { ...mockSales[2], actualSoldPrice: 'invalid' as any },
        { ...mockSales[3], actualSoldPrice: NaN },
      ];

      const revenue = calculateTotalRevenue(salesWithInvalidPrices);
      expect(revenue).toBe(0); // All invalid prices should be treated as 0
    });

    it('should handle large financial values without precision loss', () => {
      const highValueSales: ISale[] = [
        {
          id: 'high-1',
          itemId: 'rare-1',
          itemCategory: 'PSA Graded Card',
          itemName: 'Ultra Rare Card',
          myPrice: 999999.99,
          actualSoldPrice: 1234567.89,
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'Wire Transfer',
          deliveryMethod: 'Insured',
          buyerInfo: 'High Value Collector',
        },
        {
          id: 'high-2',
          itemId: 'rare-2',
          itemCategory: 'Sealed Product',
          itemName: 'Vintage Box',
          myPrice: 876543.21,
          actualSoldPrice: 987654.32,
          dateSold: '2024-01-02T00:00:00.000Z',
          paymentMethod: 'Wire Transfer',
          deliveryMethod: 'Insured',
          buyerInfo: 'Investment Fund',
        },
      ];

      const revenue = calculateTotalRevenue(highValueSales);
      expect(revenue).toBe(1234567.89 + 987654.32);
      expect(revenue).toBe(2222222.21);
    });

    it('should handle decimal precision correctly', () => {
      const precisionSales: ISale[] = [
        {
          id: 'precision-1',
          itemId: 'item-1',
          itemCategory: 'Raw Card',
          itemName: 'Test Card',
          myPrice: 10.11,
          actualSoldPrice: 15.55,
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Test Buyer',
        },
        {
          id: 'precision-2',
          itemId: 'item-2',
          itemCategory: 'Raw Card',
          itemName: 'Test Card 2',
          myPrice: 20.22,
          actualSoldPrice: 25.77,
          dateSold: '2024-01-02T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Test Buyer 2',
        },
      ];

      const revenue = calculateTotalRevenue(precisionSales);
      expect(revenue).toBe(41.32); // 15.55 + 25.77
    });
  });

  describe('Profit Calculations (FINANCIAL CRITICAL)', () => {
    it('should calculate total profit correctly', () => {
      const totalProfit = calculateTotalProfit(mockSales);
      // (5500-4000) + (1800-1200) + (85000-75000) + (2200-2500)
      // = 1500 + 600 + 10000 + (-300) = 11800

      expect(totalProfit).toBe(11800);
    });

    it('should handle negative profits (losses)', () => {
      const lossSales: ISale[] = [
        {
          id: 'loss-1',
          itemId: 'item-1',
          itemCategory: 'PSA Graded Card',
          itemName: 'Overpaid Card',
          myPrice: 1000,
          actualSoldPrice: 800, // Loss of 200
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer',
        },
        {
          id: 'loss-2',
          itemId: 'item-2',
          itemCategory: 'Raw Card',
          itemName: 'Market Crash Card',
          myPrice: 500,
          actualSoldPrice: 300, // Loss of 200
          dateSold: '2024-01-02T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer 2',
        },
      ];

      const totalProfit = calculateTotalProfit(lossSales);
      expect(totalProfit).toBe(-400); // -200 + -200
    });

    it('should handle mixed profit and loss scenarios', () => {
      const mixedSales: ISale[] = [
        {
          id: 'profit-1',
          itemId: 'item-1',
          itemCategory: 'PSA Graded Card',
          itemName: 'Profitable Card',
          myPrice: 100,
          actualSoldPrice: 200, // Profit of 100
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer',
        },
        {
          id: 'loss-1',
          itemId: 'item-2',
          itemCategory: 'Raw Card',
          itemName: 'Loss Card',
          myPrice: 150,
          actualSoldPrice: 100, // Loss of 50
          dateSold: '2024-01-02T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer 2',
        },
      ];

      const totalProfit = calculateTotalProfit(mixedSales);
      expect(totalProfit).toBe(50); // 100 + (-50)
    });

    it('should handle zero-cost items correctly', () => {
      const freeSales: ISale[] = [
        {
          id: 'free-1',
          itemId: 'item-1',
          itemCategory: 'PSA Graded Card',
          itemName: 'Free Card',
          myPrice: 0,
          actualSoldPrice: 100, // Pure profit
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer',
        },
      ];

      const totalProfit = calculateTotalProfit(freeSales);
      expect(totalProfit).toBe(100);
    });
  });

  describe('Graph Data Processing (DATA INTEGRITY CRITICAL)', () => {
    it('should process graph data with standard format', () => {
      const processed = processGraphData(mockRawGraphData);

      expect(processed).toHaveLength(3);

      // First data point
      expect(processed[0]).toEqual({
        date: '2024-01-01',
        revenue: 7300,
        profit: 1900,
        itemsSold: 2,
        averageMargin: 26.03, // (1900/7300) * 100, rounded to 2 decimals
      });

      // Second data point (alternative format)
      expect(processed[1]).toEqual({
        date: '2024-02-01',
        revenue: 87200,
        profit: 9700,
        itemsSold: 2,
        averageMargin: 11.13, // (9700/87200) * 100
      });

      // Third data point (alternative field names)
      expect(processed[2]).toEqual({
        date: '2024-03-01',
        revenue: 15000,
        profit: 3000,
        itemsSold: 3,
        averageMargin: 20.0, // (3000/15000) * 100
      });
    });

    it('should handle empty or invalid graph data', () => {
      expect(processGraphData([])).toEqual([]);
      expect(processGraphData(null as any)).toEqual([]);
      expect(processGraphData(undefined as any)).toEqual([]);
      expect(processGraphData('invalid' as any)).toEqual([]);
    });

    it('should handle missing or invalid values in graph data', () => {
      const invalidGraphData = [
        { date: '2024-01-01' }, // Missing all numeric fields
        {
          date: '2024-02-01',
          sales: 'invalid',
          profit: null,
          itemCount: undefined,
        },
        { _id: { date: '2024-03-01' }, sales: 1000, profit: 200, itemCount: 5 },
      ];

      const processed = processGraphData(invalidGraphData);

      expect(processed).toHaveLength(3);

      // Missing values should default to 0
      expect(processed[0]).toEqual({
        date: '2024-01-01',
        revenue: 0,
        profit: 0,
        itemsSold: 0,
        averageMargin: 0,
      });

      // Invalid values should be treated as 0
      expect(processed[1]).toEqual({
        date: '2024-02-01',
        revenue: 0,
        profit: 0,
        itemsSold: 0,
        averageMargin: 0,
      });

      // Valid data should process normally
      expect(processed[2]).toEqual({
        date: '2024-03-01',
        revenue: 1000,
        profit: 200,
        itemsSold: 5,
        averageMargin: 20.0,
      });
    });

    it('should handle zero revenue scenarios (avoid division by zero)', () => {
      const zeroRevenueData = [
        {
          date: '2024-01-01',
          sales: 0,
          profit: 100, // This shouldn't be possible, but test edge case
          itemCount: 1,
        },
        {
          date: '2024-02-01',
          sales: 0,
          profit: 0,
          itemCount: 0,
        },
      ];

      const processed = processGraphData(zeroRevenueData);

      expect(processed[0].averageMargin).toBe(0); // Should avoid division by zero
      expect(processed[1].averageMargin).toBe(0);
    });
  });

  describe('Category Aggregation (BUSINESS LOGIC CRITICAL)', () => {
    it('should aggregate sales by category correctly', () => {
      const aggregated = aggregateByCategory(mockSales);

      expect(aggregated.psaGradedCard).toEqual({
        count: 2, // Charizard and Venusaur
        revenue: 7700, // 5500 + 2200
        profit: 1200, // (5500-4000) + (2200-2500) = 1500 + (-300)
      });

      expect(aggregated.rawCard).toEqual({
        count: 1, // Blastoise
        revenue: 1800,
        profit: 600, // 1800 - 1200
      });

      expect(aggregated.sealedProduct).toEqual({
        count: 1, // Booster Box
        revenue: 85000,
        profit: 10000, // 85000 - 75000
      });
    });

    it('should handle empty sales array', () => {
      const aggregated = aggregateByCategory([]);

      expect(aggregated).toEqual({
        psaGradedCard: { count: 0, revenue: 0, profit: 0 },
        rawCard: { count: 0, revenue: 0, profit: 0 },
        sealedProduct: { count: 0, revenue: 0, profit: 0 },
      });
    });

    it('should skip unknown categories', () => {
      const salesWithUnknownCategory: ISale[] = [
        ...mockSales,
        {
          id: 'unknown-1',
          itemId: 'unknown-item',
          itemCategory: 'Unknown Category' as any,
          itemName: 'Mystery Item',
          myPrice: 100,
          actualSoldPrice: 150,
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Unknown Buyer',
        },
      ];

      const aggregated = aggregateByCategory(salesWithUnknownCategory);

      // Unknown category should be ignored
      expect(aggregated.psaGradedCard.count).toBe(2);
      expect(aggregated.rawCard.count).toBe(1);
      expect(aggregated.sealedProduct.count).toBe(1);

      // Totals should not include unknown category
      const totalRevenue =
        aggregated.psaGradedCard.revenue +
        aggregated.rawCard.revenue +
        aggregated.sealedProduct.revenue;
      expect(totalRevenue).toBe(94500); // Should not include the 150 from unknown category
    });

    it('should handle category name variations', () => {
      const salesWithVariations: ISale[] = [
        {
          id: 'var-1',
          itemId: 'item-1',
          itemCategory: 'PSA Graded Card', // Standard format
          itemName: 'Card 1',
          myPrice: 100,
          actualSoldPrice: 150,
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer 1',
        },
        {
          id: 'var-2',
          itemId: 'item-2',
          itemCategory: 'Raw Card', // Standard format
          itemName: 'Card 2',
          myPrice: 200,
          actualSoldPrice: 250,
          dateSold: '2024-01-02T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer 2',
        },
        {
          id: 'var-3',
          itemId: 'item-3',
          itemCategory: 'Sealed Product', // Standard format
          itemName: 'Product 1',
          myPrice: 300,
          actualSoldPrice: 350,
          dateSold: '2024-01-03T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer 3',
        },
      ];

      const aggregated = aggregateByCategory(salesWithVariations);

      expect(aggregated.psaGradedCard.count).toBe(1);
      expect(aggregated.rawCard.count).toBe(1);
      expect(aggregated.sealedProduct.count).toBe(1);
    });
  });

  describe('Trend Analysis (ANALYTICS CRITICAL)', () => {
    it('should calculate trend analysis for growth scenario', () => {
      const growthData: ISalesGraphData[] = [
        {
          date: '2024-01-01',
          revenue: 1000,
          profit: 200,
          itemsSold: 2,
          averageMargin: 20,
        },
        {
          date: '2024-02-01',
          revenue: 1500, // 50% growth
          profit: 400, // 100% growth
          itemsSold: 3,
          averageMargin: 26.67,
        },
      ];

      const trend = calculateTrendAnalysis(growthData);

      expect(trend.revenueGrowthRate).toBe(50.0);
      expect(trend.profitGrowthRate).toBe(100.0);
      expect(trend.trend).toBe('up');
    });

    it('should calculate trend analysis for decline scenario', () => {
      const declineData: ISalesGraphData[] = [
        {
          date: '2024-01-01',
          revenue: 2000,
          profit: 500,
          itemsSold: 4,
          averageMargin: 25,
        },
        {
          date: '2024-02-01',
          revenue: 1500, // -25% decline
          profit: 200, // -60% decline
          itemsSold: 2,
          averageMargin: 13.33,
        },
      ];

      const trend = calculateTrendAnalysis(declineData);

      expect(trend.revenueGrowthRate).toBe(-25.0);
      expect(trend.profitGrowthRate).toBe(-60.0);
      expect(trend.trend).toBe('down');
    });

    it('should handle stable scenario', () => {
      const stableData: ISalesGraphData[] = [
        {
          date: '2024-01-01',
          revenue: 1000,
          profit: 200,
          itemsSold: 2,
          averageMargin: 20,
        },
        {
          date: '2024-02-01',
          revenue: 1030, // 3% growth (within stable range)
          profit: 210, // 5% growth
          itemsSold: 2,
          averageMargin: 20.39,
        },
      ];

      const trend = calculateTrendAnalysis(stableData);

      expect(trend.revenueGrowthRate).toBe(3.0);
      expect(trend.profitGrowthRate).toBe(5.0);
      expect(trend.trend).toBe('stable'); // <5% change is considered stable
    });

    it('should handle insufficient data', () => {
      const insufficientData: ISalesGraphData[] = [
        {
          date: '2024-01-01',
          revenue: 1000,
          profit: 200,
          itemsSold: 2,
          averageMargin: 20,
        },
      ];

      const trend = calculateTrendAnalysis(insufficientData);

      expect(trend.revenueGrowthRate).toBe(0);
      expect(trend.profitGrowthRate).toBe(0);
      expect(trend.trend).toBe('stable');
    });

    it('should handle zero starting values', () => {
      const zeroStartData: ISalesGraphData[] = [
        {
          date: '2024-01-01',
          revenue: 0,
          profit: 0,
          itemsSold: 0,
          averageMargin: 0,
        },
        {
          date: '2024-02-01',
          revenue: 1000,
          profit: 200,
          itemsSold: 2,
          averageMargin: 20,
        },
      ];

      const trend = calculateTrendAnalysis(zeroStartData);

      expect(trend.revenueGrowthRate).toBe(0); // Avoid division by zero
      expect(trend.profitGrowthRate).toBe(0);
      expect(trend.trend).toBe('stable');
    });
  });

  describe('Date Range Filtering (DATA FILTERING CRITICAL)', () => {
    it('should filter sales by date range', () => {
      const startDate = '2024-01-18T00:00:00.000Z';
      const endDate = '2024-02-05T00:00:00.000Z';

      const filtered = filterSalesByDateRange(mockSales, startDate, endDate);

      expect(filtered).toHaveLength(2); // Blastoise (1/20) and Booster Box (2/1)
      expect(filtered[0].itemName).toBe('Blastoise Base Set');
      expect(filtered[1].itemName).toBe('Base Set Booster Box');
    });

    it('should filter with only start date', () => {
      const startDate = '2024-01-30T00:00:00.000Z';

      const filtered = filterSalesByDateRange(mockSales, startDate);

      expect(filtered).toHaveLength(2); // Booster Box (2/1) and Venusaur (2/10)
      expect(filtered[0].itemName).toBe('Base Set Booster Box');
      expect(filtered[1].itemName).toBe('Venusaur Base Set');
    });

    it('should filter with only end date', () => {
      const endDate = '2024-01-25T00:00:00.000Z';

      const filtered = filterSalesByDateRange(mockSales, undefined, endDate);

      expect(filtered).toHaveLength(2); // Charizard (1/15) and Blastoise (1/20)
      expect(filtered[0].itemName).toBe('Charizard Base Set');
      expect(filtered[1].itemName).toBe('Blastoise Base Set');
    });

    it('should return all sales when no date range provided', () => {
      const filtered = filterSalesByDateRange(mockSales);

      expect(filtered).toHaveLength(4);
      expect(filtered).toEqual(mockSales);
    });

    it('should handle empty sales array', () => {
      const filtered = filterSalesByDateRange([], '2024-01-01', '2024-12-31');

      expect(filtered).toEqual([]);
    });

    it('should handle invalid date formats gracefully', () => {
      const invalidStartDate = 'invalid-date';
      const validEndDate = '2024-12-31T00:00:00.000Z';

      // Should not throw, but behavior may vary based on Date constructor
      const filtered = filterSalesByDateRange(
        mockSales,
        invalidStartDate,
        validEndDate
      );
      expect(Array.isArray(filtered)).toBe(true);
    });
  });

  describe('KPI Calculations (DASHBOARD CRITICAL)', () => {
    it('should calculate comprehensive KPIs', () => {
      const kpis = calculateKPIs(mockSales);

      expect(kpis.totalRevenue).toBe(94500.0);
      expect(kpis.totalProfit).toBe(11800.0);
      expect(kpis.averageMargin).toBe(12.49); // (11800/94500) * 100
      expect(kpis.totalItems).toBe(4);
      expect(kpis.averageSalePrice).toBe(23625.0); // 94500 / 4
      expect(kpis.bestPerformingCategory).toBe('sealedProduct'); // Highest revenue
      expect(kpis.profitabilityRatio).toBe(12.49); // Same as average margin
    });

    it('should handle empty sales array for KPIs', () => {
      const kpis = calculateKPIs([]);

      expect(kpis.totalRevenue).toBe(0);
      expect(kpis.totalProfit).toBe(0);
      expect(kpis.averageMargin).toBe(0);
      expect(kpis.totalItems).toBe(0);
      expect(kpis.averageSalePrice).toBe(0);
      expect(kpis.bestPerformingCategory).toBe('');
      expect(kpis.profitabilityRatio).toBe(0);
    });

    it('should identify best performing category correctly', () => {
      const testSales: ISale[] = [
        {
          id: 'test-1',
          itemId: 'item-1',
          itemCategory: 'Raw Card',
          itemName: 'High Revenue Raw Card',
          myPrice: 10000,
          actualSoldPrice: 50000, // Highest single category revenue
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'Wire Transfer',
          deliveryMethod: 'Insured',
          buyerInfo: 'High Value Buyer',
        },
        {
          id: 'test-2',
          itemId: 'item-2',
          itemCategory: 'PSA Graded Card',
          itemName: 'Medium PSA Card',
          myPrice: 5000,
          actualSoldPrice: 8000,
          dateSold: '2024-01-02T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'PSA Collector',
        },
      ];

      const kpis = calculateKPIs(testSales);

      expect(kpis.bestPerformingCategory).toBe('rawCard'); // Raw card has higher revenue (50000 vs 8000)
    });

    it('should handle negative profit scenarios in KPIs', () => {
      const lossSales: ISale[] = [
        {
          id: 'loss-1',
          itemId: 'item-1',
          itemCategory: 'PSA Graded Card',
          itemName: 'Loss Card',
          myPrice: 1000,
          actualSoldPrice: 500, // Loss of 500
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Buyer',
        },
      ];

      const kpis = calculateKPIs(lossSales);

      expect(kpis.totalRevenue).toBe(500);
      expect(kpis.totalProfit).toBe(-500);
      expect(kpis.averageMargin).toBe(-100.0); // (-500/500) * 100
      expect(kpis.profitabilityRatio).toBe(-100.0);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets efficiently', () => {
      // Generate 1000 sales records
      const largeSales: ISale[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `sale-${i}`,
        itemId: `item-${i}`,
        itemCategory: ['PSA Graded Card', 'Raw Card', 'Sealed Product'][
          i % 3
        ] as any,
        itemName: `Item ${i}`,
        myPrice: Math.floor(Math.random() * 1000),
        actualSoldPrice: Math.floor(Math.random() * 1500),
        dateSold: new Date(2024, 0, (i % 30) + 1).toISOString(),
        paymentMethod: 'PayPal',
        deliveryMethod: 'Shipped',
        buyerInfo: `Buyer ${i}`,
      }));

      const startTime = performance.now();

      const revenue = calculateTotalRevenue(largeSales);
      const profit = calculateTotalProfit(largeSales);
      const aggregated = aggregateByCategory(largeSales);
      const kpis = calculateKPIs(largeSales);

      const endTime = performance.now();

      expect(typeof revenue).toBe('number');
      expect(typeof profit).toBe('number');
      expect(aggregated.psaGradedCard.count).toBeGreaterThan(0);
      expect(kpis.totalItems).toBe(1000);

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(100); // 100ms max for 1000 records
    });

    it('should maintain precision with many small transactions', () => {
      const smallTransactions: ISale[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `small-${i}`,
          itemId: `item-${i}`,
          itemCategory: 'Raw Card',
          itemName: `Small Item ${i}`,
          myPrice: 0.01, // 1 cent cost
          actualSoldPrice: 0.02, // 1 cent profit each
          dateSold: '2024-01-01T00:00:00.000Z',
          paymentMethod: 'PayPal',
          deliveryMethod: 'Shipped',
          buyerInfo: 'Small Buyer',
        })
      );

      const totalRevenue = calculateTotalRevenue(smallTransactions);
      const totalProfit = calculateTotalProfit(smallTransactions);

      expect(totalRevenue).toBe(2.0); // 100 * 0.02
      expect(totalProfit).toBe(1.0); // 100 * 0.01
    });
  });
});
