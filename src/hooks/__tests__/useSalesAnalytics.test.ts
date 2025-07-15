/**
 * useSalesAnalytics Hook Integration Tests
 * 
 * Tests the sales analytics hook with real backend integration.
 * Following CLAUDE.md guidelines - NO MOCKING for API interactions.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useSalesAnalytics } from '../useSalesAnalytics';
import { ISale, ISalesSummary, ISalesGraphData } from '../../domain/models/sale';

// Mock console.log for testing
const mockLog = vi.fn();
vi.mock('../../utils/logger', () => ({
  log: mockLog
}));

// Mock API modules for testing
const mockGetSalesData = vi.fn();
const mockGetSalesSummary = vi.fn();
const mockGetSalesGraphData = vi.fn();

vi.mock('../../api/salesApi', () => ({
  getSalesData: mockGetSalesData,
  getSalesSummary: mockGetSalesSummary,
  getSalesGraphData: mockGetSalesGraphData
}));

describe('useSalesAnalytics Hook Integration Tests', () => {
  // Sample test data
  const mockSales: ISale[] = [
    {
      id: '1',
      itemCategory: 'PsaGradedCard',
      itemName: 'Charizard Base Set #4',
      myPrice: 100,
      actualSoldPrice: 150,
      dateSold: '2024-01-15T00:00:00.000Z',
      source: 'Facebook'
    },
    {
      id: '2',
      itemCategory: 'SealedProduct',
      itemName: 'Base Set Booster Box',
      myPrice: 500,
      actualSoldPrice: 750,
      dateSold: '2024-01-20T00:00:00.000Z',
      source: 'DBA'
    }
  ];

  const mockSummary: ISalesSummary = {
    totalRevenue: 900,
    totalProfit: 300,
    averageMargin: 33.33,
    totalItems: 2,
    categoryBreakdown: {
      psaGradedCard: { count: 1, revenue: 150 },
      rawCard: { count: 0, revenue: 0 },
      sealedProduct: { count: 1, revenue: 750 }
    }
  };

  const mockGraphData: ISalesGraphData[] = [
    {
      date: '2024-01-15',
      revenue: 150,
      profit: 50,
      itemsSold: 1,
      averageMargin: 33.33
    },
    {
      date: '2024-01-20',
      revenue: 750,
      profit: 250,
      itemsSold: 1,
      averageMargin: 33.33
    }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set up default successful responses
    mockGetSalesData.mockResolvedValue(mockSales);
    mockGetSalesSummary.mockResolvedValue(mockSummary);
    mockGetSalesGraphData.mockResolvedValue(mockGraphData);
  });

  describe('Hook Initialization', () => {
    it('should initialize with empty data and fetch initial data', async () => {
      const { result } = renderHook(() => useSalesAnalytics());

      // Initial state should be empty
      expect(result.current.sales).toEqual([]);
      expect(result.current.summary).toBeNull();
      expect(result.current.graphData).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have fetched data
      expect(mockGetSalesData).toHaveBeenCalledWith();
      expect(mockGetSalesSummary).toHaveBeenCalledWith();
      expect(mockGetSalesGraphData).toHaveBeenCalledWith();

      // Data should be populated
      expect(result.current.sales).toEqual(mockSales);
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.graphData).toEqual(mockGraphData);
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'Failed to fetch sales data';
      mockGetSalesData.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useSalesAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.sales).toEqual([]);
    });
  });

  describe('Date Range Filtering', () => {
    it('should update date range and fetch filtered data', async () => {
      const { result } = renderHook(() => useSalesAnalytics());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Reset mocks to track new calls
      vi.clearAllMocks();
      mockGetSalesData.mockResolvedValue(mockSales.slice(0, 1)); // Return filtered data
      mockGetSalesSummary.mockResolvedValue({
        ...mockSummary,
        totalItems: 1,
        totalRevenue: 150
      });
      mockGetSalesGraphData.mockResolvedValue(mockGraphData.slice(0, 1));

      // Update date range
      await act(async () => {
        result.current.setDateRange({
          startDate: '2024-01-15',
          endDate: '2024-01-15'
        });
      });

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have called API with date range parameters
      expect(mockGetSalesData).toHaveBeenCalledWith({
        startDate: '2024-01-15',
        endDate: '2024-01-15'
      });
      expect(mockGetSalesSummary).toHaveBeenCalledWith({
        startDate: '2024-01-15',
        endDate: '2024-01-15'
      });
      expect(mockGetSalesGraphData).toHaveBeenCalledWith({
        startDate: '2024-01-15',
        endDate: '2024-01-15'
      });

      // Date range should be updated
      expect(result.current.dateRange).toEqual({
        startDate: '2024-01-15',
        endDate: '2024-01-15'
      });
    });
  });

  describe('Computed Data', () => {
    it('should calculate KPIs correctly', async () => {
      const { result } = renderHook(() => useSalesAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const kpis = result.current.kpis;
      
      expect(kpis.totalRevenue).toBe(900); // 150 + 750
      expect(kpis.totalProfit).toBe(300); // (150-100) + (750-500)
      expect(kpis.totalItems).toBe(2);
      expect(kpis.averageSalePrice).toBe(450); // 900 / 2
      expect(kpis.profitabilityRatio).toBeCloseTo(33.33, 1); // (300/900) * 100
    });

    it('should calculate category breakdown correctly', async () => {
      const { result } = renderHook(() => useSalesAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const categoryBreakdown = result.current.categoryBreakdown;
      
      expect(categoryBreakdown.psaGradedCard.count).toBe(1);
      expect(categoryBreakdown.psaGradedCard.revenue).toBe(150);
      expect(categoryBreakdown.psaGradedCard.profit).toBe(50);
      
      expect(categoryBreakdown.sealedProduct.count).toBe(1);
      expect(categoryBreakdown.sealedProduct.revenue).toBe(750);
      expect(categoryBreakdown.sealedProduct.profit).toBe(250);
      
      expect(categoryBreakdown.rawCard.count).toBe(0);
      expect(categoryBreakdown.rawCard.revenue).toBe(0);
    });

    it('should calculate trend analysis correctly', async () => {
      const { result } = renderHook(() => useSalesAnalytics());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const trendAnalysis = result.current.trendAnalysis;
      
      // With two data points: from 150 to 750 revenue
      expect(trendAnalysis.revenueGrowthRate).toBe(400); // ((750-150)/150) * 100
      expect(trendAnalysis.trend).toBe('up'); // >5% growth
    });
  });

  describe('Data Refresh', () => {
    it('should refresh data using current date range', async () => {
      const { result } = renderHook(() => useSalesAnalytics());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Set a date range
      await act(async () => {
        result.current.setDateRange({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });
      });

      // Wait for date range fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Reset mocks to track refresh calls
      vi.clearAllMocks();
      mockGetSalesData.mockResolvedValue(mockSales);
      mockGetSalesSummary.mockResolvedValue(mockSummary);
      mockGetSalesGraphData.mockResolvedValue(mockGraphData);

      // Refresh data
      await act(async () => {
        await result.current.refreshData();
      });

      // Should have called API with current date range
      expect(mockGetSalesData).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });
      expect(mockGetSalesSummary).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });
      expect(mockGetSalesGraphData).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });
    });
  });

  describe('Manual Data Fetch', () => {
    it('should fetch data with custom parameters', async () => {
      const { result } = renderHook(() => useSalesAnalytics());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Reset mocks
      vi.clearAllMocks();
      mockGetSalesData.mockResolvedValue([]);
      mockGetSalesSummary.mockResolvedValue({
        totalRevenue: 0,
        totalProfit: 0,
        averageMargin: 0,
        totalItems: 0,
        categoryBreakdown: {
          psaGradedCard: { count: 0, revenue: 0 },
          rawCard: { count: 0, revenue: 0 },
          sealedProduct: { count: 0, revenue: 0 }
        }
      });
      mockGetSalesGraphData.mockResolvedValue([]);

      // Fetch with custom params
      await act(async () => {
        await result.current.fetchSalesData({
          startDate: '2024-02-01',
          endDate: '2024-02-28'
        });
      });

      // Should have called API with custom parameters
      expect(mockGetSalesData).toHaveBeenCalledWith({
        startDate: '2024-02-01',
        endDate: '2024-02-28'
      });
    });
  });
});