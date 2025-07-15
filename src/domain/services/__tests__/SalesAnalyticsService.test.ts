/**
 * Unit tests for Sales Analytics Domain Service
 * Tests all business logic functions with sample data
 */

import {
  calculateTotalProfit,
  calculateAverageMargin,
  processGraphData,
  aggregateByCategory,
  calculateTrendAnalysis,
  filterSalesByDateRange,
  calculateKPIs,
} from '../SalesAnalyticsService';
import { ISale, ISalesGraphData } from '../../models/sale';

// Mock sales data for testing
const mockSales: ISale[] = [
  {
    id: '1',
    itemCategory: 'PsaGradedCard',
    itemName: 'Charizard Base Set Holo',
    myPrice: 100,
    actualSoldPrice: 150,
    calculatedProfit: 50,
    profitMargin: 33.33,
    dateSold: '2024-01-15T10:00:00Z',
    source: 'eBay',
  },
  {
    id: '2',
    itemCategory: 'RawCard',
    itemName: 'Blastoise Base Set',
    myPrice: 50,
    actualSoldPrice: 80,
    calculatedProfit: 30,
    profitMargin: 37.5,
    dateSold: '2024-01-20T10:00:00Z',
    source: 'Facebook',
  },
  {
    id: '3',
    itemCategory: 'SealedProduct',
    itemName: 'Base Set Booster Box',
    myPrice: 300,
    actualSoldPrice: 400,
    calculatedProfit: 100,
    profitMargin: 25.0,
    dateSold: '2024-02-01T10:00:00Z',
    source: 'Local',
  },
];

describe('SalesAnalyticsService', () => {
  describe('calculateTotalProfit', () => {
    it('should calculate total profit correctly', () => {
      const result = calculateTotalProfit(mockSales);
      expect(result).toBe(180); // 50 + 30 + 100
    });

    it('should return 0 for empty array', () => {
      const result = calculateTotalProfit([]);
      expect(result).toBe(0);
    });

    it('should handle null/undefined input', () => {
      expect(calculateTotalProfit(null as unknown as ISale[])).toBe(0);
      expect(calculateTotalProfit(undefined as unknown as ISale[])).toBe(0);
    });
  });

  describe('calculateAverageMargin', () => {
    it('should calculate average margin correctly', () => {
      const result = calculateAverageMargin(mockSales);
      expect(result).toBeCloseTo(31.94, 2); // (33.33 + 37.5 + 25.0) / 3
    });

    it('should return 0 for empty array', () => {
      const result = calculateAverageMargin([]);
      expect(result).toBe(0);
    });

    it('should handle null/undefined input', () => {
      expect(calculateAverageMargin(null as unknown as ISale[])).toBe(0);
      expect(calculateAverageMargin(undefined as unknown as ISale[])).toBe(0);
    });
  });

  describe('processGraphData', () => {
    it('should process raw graph data correctly', () => {
      const rawData = [
        { date: '2024-01-15', revenue: 150, profit: 50, count: 1 },
        { date: '2024-01-20', revenue: 80, profit: 30, count: 1 },
        { date: '2024-02-01', revenue: 400, profit: 100, count: 1 },
      ];

      const result = processGraphData(rawData);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2024-01-15',
        revenue: 150,
        profit: 50,
        itemsSold: 1,
        averageMargin: 0,
      });
    });

    it('should handle empty array', () => {
      const result = processGraphData([]);
      expect(result).toEqual([]);
    });

    it('should handle malformed data', () => {
      const rawData = [
        { _id: { date: '2024-01-15' }, revenue: '150', profit: '50' },
      ];

      const result = processGraphData(rawData);
      expect(result[0].revenue).toBe(150);
      expect(result[0].profit).toBe(50);
    });
  });

  describe('aggregateByCategory', () => {
    it('should aggregate sales by category correctly', () => {
      const result = aggregateByCategory(mockSales);
      
      expect(result.psaGradedCard).toEqual({
        count: 1,
        revenue: 150,
        profit: 50,
      });
      
      expect(result.rawCard).toEqual({
        count: 1,
        revenue: 80,
        profit: 30,
      });
      
      expect(result.sealedProduct).toEqual({
        count: 1,
        revenue: 400,
        profit: 100,
      });
    });

    it('should return zero counts for empty array', () => {
      const result = aggregateByCategory([]);
      
      expect(result.psaGradedCard.count).toBe(0);
      expect(result.rawCard.count).toBe(0);
      expect(result.sealedProduct.count).toBe(0);
    });
  });

  describe('calculateTrendAnalysis', () => {
    const mockGraphData: ISalesGraphData[] = [
      { date: '2024-01-01', revenue: 100, profit: 30 },
      { date: '2024-01-02', revenue: 120, profit: 40 },
      { date: '2024-01-03', revenue: 150, profit: 50 },
    ];

    it('should calculate trend analysis correctly', () => {
      const result = calculateTrendAnalysis(mockGraphData);
      
      expect(result.revenueGrowthRate).toBe(50); // (150-100)/100 * 100
      expect(result.profitGrowthRate).toBeCloseTo(66.67, 2);
      expect(result.trend).toBe('up');
    });

    it('should handle insufficient data', () => {
      const result = calculateTrendAnalysis([mockGraphData[0]]);
      
      expect(result.revenueGrowthRate).toBe(0);
      expect(result.profitGrowthRate).toBe(0);
      expect(result.trend).toBe('stable');
    });
  });

  describe('filterSalesByDateRange', () => {
    it('should filter sales by date range correctly', () => {
      const result = filterSalesByDateRange(
        mockSales,
        '2024-01-18T00:00:00Z',
        '2024-02-15T00:00:00Z'
      );
      
      expect(result).toHaveLength(2); // Excludes first sale from Jan 15
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
    });

    it('should return all sales when no date filters provided', () => {
      const result = filterSalesByDateRange(mockSales);
      expect(result).toHaveLength(3);
    });

    it('should handle empty array', () => {
      const result = filterSalesByDateRange([]);
      expect(result).toEqual([]);
    });
  });

  describe('calculateKPIs', () => {
    it('should calculate KPIs correctly', () => {
      const result = calculateKPIs(mockSales);
      
      expect(result.totalRevenue).toBe(630); // 150 + 80 + 400
      expect(result.totalProfit).toBe(180); // 50 + 30 + 100
      expect(result.totalItems).toBe(3);
      expect(result.averageSalePrice).toBe(210); // 630 / 3
      expect(result.bestPerformingCategory).toBe('sealedProduct');
      expect(result.profitabilityRatio).toBeCloseTo(28.57, 2);
    });

    it('should handle empty sales data', () => {
      const result = calculateKPIs([]);
      
      expect(result.totalRevenue).toBe(0);
      expect(result.totalProfit).toBe(0);
      expect(result.totalItems).toBe(0);
      expect(result.bestPerformingCategory).toBe('');
    });
  });
});