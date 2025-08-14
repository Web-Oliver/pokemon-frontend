/**
 * SalesAnalytics Page Unit Tests
 *
 * Tests SalesAnalytics page functionality including:
 * - Component rendering and sales data display
 * - Date range filtering
 * - Sales statistics and metrics
 * - Category breakdown charts
 * - Recent sales list
 * - CSV export functionality
 * - Loading and error states
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SalesAnalytics from '../SalesAnalytics';
import { useSalesAnalytics } from '../../../../shared/hooks/useSalesAnalytics';
import { useExportOperations } from '../../../../shared/hooks/useExportOperations';

// Mock dependencies
vi.mock('../../../../shared/hooks/useSalesAnalytics', () => ({
  useSalesAnalytics: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useExportOperations', () => ({
  useExportOperations: vi.fn(),
}));

vi.mock(
  '../../../../shared/components/organisms/ui/toastNotifications',
  () => ({
    showSuccessToast: vi.fn(),
    showErrorToast: vi.fn(),
  })
);

vi.mock('../../../../shared/utils', () => ({
  displayPrice: vi.fn((price) => `$${price}`),
}));

// Mock reusable components
vi.mock('../../../../shared/components/molecules/common/SalesStatCard', () => ({
  default: ({ title, value, change, trend }: any) => (
    <div data-testid="sales-stat-card">
      <div>{title}</div>
      <div>{value}</div>
      {change && <div>Change: {change}</div>}
      {trend && <div>Trend: {trend}</div>}
    </div>
  ),
}));

vi.mock(
  '../../../../shared/components/molecules/common/CategorySalesCard',
  () => ({
    default: ({ category, amount, percentage }: any) => (
      <div data-testid="category-sales-card">
        <div>{category}</div>
        <div>Amount: {amount}</div>
        <div>Percentage: {percentage}%</div>
      </div>
    ),
  })
);

vi.mock(
  '../../../../shared/components/molecules/common/RecentSaleListItem',
  () => ({
    default: ({ sale }: any) => (
      <div data-testid="recent-sale-item">
        <div>{sale.itemName}</div>
        <div>Price: {sale.salePrice}</div>
        <div>Date: {sale.saleDate}</div>
      </div>
    ),
  })
);

vi.mock(
  '../../../../shared/components/molecules/common/SalesDateRangeFilter',
  () => ({
    default: ({ value, onChange, onApply, loading }: any) => (
      <div data-testid="sales-date-range-filter">
        <input
          type="date"
          value={value?.startDate || ''}
          onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          disabled={loading}
        />
        <input
          type="date"
          value={value?.endDate || ''}
          onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          disabled={loading}
        />
        <button onClick={onApply} disabled={loading}>
          Apply Filter
        </button>
        {loading && <span>Loading...</span>}
      </div>
    ),
  })
);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockSalesData = [
  {
    id: '1',
    itemName: 'Charizard PSA 10',
    salePrice: 500,
    saleDate: '2024-01-15',
    category: 'PSA Graded',
    profit: 200,
  },
  {
    id: '2',
    itemName: 'Blastoise Raw',
    salePrice: 150,
    saleDate: '2024-01-20',
    category: 'Raw Card',
    profit: 50,
  },
];

const mockSalesStats = {
  totalSales: 650,
  totalProfit: 250,
  averageSale: 325,
  salesThisMonth: 2,
  profitMargin: 38.5,
};

const mockCategoryBreakdown = [
  { category: 'PSA Graded', amount: 500, percentage: 76.9 },
  { category: 'Raw Card', amount: 150, percentage: 23.1 },
];

describe('SalesAnalytics Page', () => {
  const mockUseSalesAnalytics = {
    sales: mockSalesData,
    loading: false,
    error: null,
    dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
    setDateRange: vi.fn(),
    stats: mockSalesStats,
    categoryBreakdown: mockCategoryBreakdown,
  };

  const mockUseExportOperations = {
    exportSalesData: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useSalesAnalytics).mockReturnValue(mockUseSalesAnalytics);
    vi.mocked(useExportOperations).mockReturnValue(mockUseExportOperations);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders sales analytics page with all components', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Sales Analytics')).toBeInTheDocument();
    expect(
      screen.getByText('Track your collection sales and profitability')
    ).toBeInTheDocument();
    expect(screen.getByTestId('sales-date-range-filter')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('displays sales statistics cards', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const statCards = screen.getAllByTestId('sales-stat-card');
    expect(statCards.length).toBeGreaterThan(0);

    // Should show key metrics
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('Total Profit')).toBeInTheDocument();
    expect(screen.getByText('Average Sale')).toBeInTheDocument();
  });

  it('displays category breakdown cards', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const categoryCards = screen.getAllByTestId('category-sales-card');
    expect(categoryCards.length).toBe(2);

    expect(screen.getByText('PSA Graded')).toBeInTheDocument();
    expect(screen.getByText('Raw Card')).toBeInTheDocument();
    expect(screen.getByText('Amount: 500')).toBeInTheDocument();
    expect(screen.getByText('Amount: 150')).toBeInTheDocument();
    expect(screen.getByText('Percentage: 76.9%')).toBeInTheDocument();
    expect(screen.getByText('Percentage: 23.1%')).toBeInTheDocument();
  });

  it('displays recent sales list', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const saleItems = screen.getAllByTestId('recent-sale-item');
    expect(saleItems.length).toBe(2);

    expect(screen.getByText('Charizard PSA 10')).toBeInTheDocument();
    expect(screen.getByText('Blastoise Raw')).toBeInTheDocument();
    expect(screen.getByText('Price: 500')).toBeInTheDocument();
    expect(screen.getByText('Price: 150')).toBeInTheDocument();
  });

  it('handles date range filtering', async () => {
    const user = userEvent.setup();
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const startDateInput = screen
      .getByTestId('sales-date-range-filter')
      .querySelector('input[type="date"]');
    const applyButton = screen.getByText('Apply Filter');

    if (startDateInput) {
      await user.type(startDateInput, '2024-02-01');
    }

    await user.click(applyButton);

    expect(mockUseSalesAnalytics.setDateRange).toHaveBeenCalled();
  });

  it('handles CSV export successfully', async () => {
    const user = userEvent.setup();
    mockUseExportOperations.exportSalesData.mockResolvedValue(true);

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const exportButton = screen.getByText('Export CSV');
    await user.click(exportButton);

    expect(mockUseExportOperations.exportSalesData).toHaveBeenCalledWith(
      mockSalesData
    );
  });

  it('handles CSV export with no data', async () => {
    const user = userEvent.setup();
    const { showSuccessToast } = await import(
      '../../../../shared/components/organisms/ui/toastNotifications'
    );

    vi.mocked(useSalesAnalytics).mockReturnValue({
      ...mockUseSalesAnalytics,
      sales: [],
    });

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const exportButton = screen.getByText('Export CSV');
    await user.click(exportButton);

    expect(showSuccessToast).toHaveBeenCalledWith('No sales data to export');
  });

  it('handles CSV export error', async () => {
    const user = userEvent.setup();
    const { showErrorToast } = await import(
      '../../../../shared/components/organisms/ui/toastNotifications'
    );

    mockUseExportOperations.exportSalesData.mockRejectedValue(
      new Error('Export failed')
    );

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const exportButton = screen.getByText('Export CSV');
    await user.click(exportButton);

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(
        'Failed to export sales data'
      );
    });
  });

  it('displays loading state correctly', () => {
    vi.mocked(useSalesAnalytics).mockReturnValue({
      ...mockUseSalesAnalytics,
      loading: true,
    });

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    // PageLayout should handle loading state
    expect(screen.getByText('Sales Analytics')).toBeInTheDocument();

    // Date filter should show loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(useSalesAnalytics).mockReturnValue({
      ...mockUseSalesAnalytics,
      error: 'Failed to load sales data',
    });

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    // PageLayout should handle error state
    expect(screen.getByText('Sales Analytics')).toBeInTheDocument();
  });

  it('displays empty state when no sales data', () => {
    vi.mocked(useSalesAnalytics).mockReturnValue({
      ...mockUseSalesAnalytics,
      sales: [],
      stats: null,
      categoryBreakdown: [],
    });

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    expect(screen.getByText('No sales data available')).toBeInTheDocument();
    expect(
      screen.getByText('Start adding sales to see analytics')
    ).toBeInTheDocument();
  });

  it('calculates and displays profit margins correctly', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    // The profit margin should be displayed in stats
    expect(screen.getByText('Profit Margin')).toBeInTheDocument();
  });

  it('shows proper date range in filter', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const dateFilter = screen.getByTestId('sales-date-range-filter');
    const startInput = dateFilter.querySelector('input[type="date"]');

    expect(startInput).toHaveValue('2024-01-01');
  });

  it('disables filter controls when loading', () => {
    vi.mocked(useSalesAnalytics).mockReturnValue({
      ...mockUseSalesAnalytics,
      loading: true,
    });

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    const applyButton = screen.getByText('Apply Filter');
    expect(applyButton).toBeDisabled();

    const dateInputs = screen.getAllByRole('textbox');
    dateInputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });

  it('displays sales trends when available', () => {
    vi.mocked(useSalesAnalytics).mockReturnValue({
      ...mockUseSalesAnalytics,
      stats: {
        ...mockSalesStats,
        trend: 'increasing',
      },
    });

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Trend: increasing')).toBeInTheDocument();
  });

  it('formats prices correctly using display utility', () => {
    const {
      displayPrice,
    } = require('../../../../shared/utils');

    render(<SalesAnalytics />, { wrapper: createWrapper() });

    // Verify displayPrice was called for formatting
    expect(displayPrice).toHaveBeenCalled();
  });

  it('shows recent sales section header', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Recent Sales')).toBeInTheDocument();
  });

  it('shows category breakdown section header', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Sales by Category')).toBeInTheDocument();
  });

  it('handles date range state synchronization', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    // Component should synchronize local date range with hook date range
    const dateFilter = screen.getByTestId('sales-date-range-filter');
    expect(dateFilter).toBeInTheDocument();
  });

  it('displays proper page layout structure', () => {
    render(<SalesAnalytics />, { wrapper: createWrapper() });

    // Should have proper header with export button
    const exportButton = screen.getByText('Export CSV');
    expect(exportButton).toBeInTheDocument();

    // Should have unified header
    expect(
      screen.getByText('Financial Performance Dashboard')
    ).toBeInTheDocument();
  });
});
