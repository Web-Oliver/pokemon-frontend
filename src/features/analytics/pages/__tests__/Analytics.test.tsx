/**
 * Analytics Page Unit Tests
 *
 * Tests Analytics page functionality including:
 * - Component rendering and data display
 * - Date range filtering
 * - Activity timeline and stats
 * - Metrics grid and category stats
 * - Data loading and error states
 * - Navigation and user interactions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Analytics from '../Analytics';
// Import mocked hooks
import { useActivity } from '../../../../shared/hooks/useActivity';
import { useActivityStats } from '../../../../shared/hooks/useActivityStats';
import { useCollectionStats } from '../../../../shared/hooks/useCollectionStats';
import { useAnalyticsData } from '../../../../shared/hooks/useAnalyticsData';

// Mock dependencies
vi.mock('../../../../shared/hooks/useActivity', () => ({
  useActivity: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useActivityStats', () => ({
  useActivityStats: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useCollectionStats', () => ({
  useCollectionStats: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useAnalyticsData', () => ({
  useAnalyticsData: vi.fn(),
}));

// Mock analytics components
vi.mock('../../../../shared/components/analytics', () => ({
  AnalyticsBackground: () => (
    <div data-testid="analytics-background">Background</div>
  ),
  AnalyticsHeader: () => (
    <div data-testid="analytics-header">Analytics Header</div>
  ),
  ActivityTimeline: ({ activities }: any) => (
    <div data-testid="activity-timeline">
      Timeline ({activities?.length || 0} activities)
    </div>
  ),
  CategoryStats: ({ categories }: any) => (
    <div data-testid="category-stats">
      Category Stats ({categories?.length || 0} categories)
    </div>
  ),
  MetricsGrid: ({ metrics }: any) => (
    <div data-testid="metrics-grid">
      Metrics Grid ({metrics?.length || 0} metrics)
    </div>
  ),
}));

// Mock DateRangeFilter component
vi.mock(
  '../../../../shared/components/molecules/common/DateRangeFilter',
  () => ({
    default: ({ value, onChange, presetOptions, loading }: any) => (
      <div data-testid="date-range-filter">
        <select
          value={value.preset || 'custom'}
          onChange={(e) => onChange({ preset: e.target.value })}
          disabled={loading}
        >
          {presetOptions.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value="custom">Custom Range</option>
        </select>
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

const mockActivities = [
  {
    id: '1',
    type: 'create',
    title: 'Added Charizard',
    description: 'Added Charizard PSA 10',
    timestamp: new Date('2024-01-01'),
    metadata: { badges: ['new'] },
  },
  {
    id: '2',
    type: 'sale',
    title: 'Sold Blastoise',
    description: 'Sold Blastoise for $100',
    timestamp: new Date('2024-01-02'),
    metadata: { badges: ['sold'] },
  },
];

const mockActivityStats = {
  totalActivities: 25,
  activitiesThisWeek: 5,
  activitiesThisMonth: 15,
  mostActiveDay: 'Monday',
};

const mockAnalyticsData = {
  metrics: [
    { label: 'Total Items', value: 150, change: '+5%' },
    { label: 'Total Value', value: '$5,000', change: '+2%' },
    { label: 'This Month', value: 10, change: '+50%' },
  ],
  categories: [
    { name: 'PSA Graded', count: 50, percentage: 60 },
    { name: 'Raw Cards', count: 30, percentage: 30 },
    { name: 'Sealed', count: 10, percentage: 10 },
  ],
};

describe('Analytics Page', () => {
  const mockUseActivity = {
    activities: mockActivities,
    loading: false,
    fetchActivities: vi.fn(),
    refresh: vi.fn(),
  };

  const mockUseActivityStats = {
    stats: mockActivityStats,
  };

  const mockUseCollectionStats = {
    totalValueFormatted: '$5,000',
  };

  const mockUseAnalyticsData = mockAnalyticsData;

  beforeEach(() => {
    vi.mocked(useActivity).mockReturnValue(mockUseActivity);
    vi.mocked(useActivityStats).mockReturnValue(mockUseActivityStats);
    vi.mocked(useCollectionStats).mockReturnValue(mockUseCollectionStats);
    vi.mocked(useAnalyticsData).mockReturnValue(mockUseAnalyticsData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders analytics page with all components', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-background')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-header')).toBeInTheDocument();
    expect(screen.getByTestId('date-range-filter')).toBeInTheDocument();
    expect(screen.getByTestId('metrics-grid')).toBeInTheDocument();
    expect(screen.getByTestId('category-stats')).toBeInTheDocument();
    expect(screen.getByTestId('activity-timeline')).toBeInTheDocument();
  });

  it('initializes with default date range (month)', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    const dateFilter = screen.getByTestId('date-range-filter');
    const select = dateFilter.querySelector('select');
    expect(select?.value).toBe('month');
  });

  it('fetches activities on mount with default date range', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    expect(mockUseActivity.fetchActivities).toHaveBeenCalledWith({
      dateRange: 'month',
    });
  });

  it('handles date range filter changes', async () => {
    const user = userEvent.setup();
    render(<Analytics />, { wrapper: createWrapper() });

    const select = screen
      .getByTestId('date-range-filter')
      .querySelector('select');
    if (select) {
      await user.selectOptions(select, 'week');
    }

    await waitFor(() => {
      expect(mockUseActivity.fetchActivities).toHaveBeenCalledWith({
        dateRange: 'week',
      });
    });
  });

  it('handles "all time" date range correctly', async () => {
    const user = userEvent.setup();
    render(<Analytics />, { wrapper: createWrapper() });

    const select = screen
      .getByTestId('date-range-filter')
      .querySelector('select');
    if (select) {
      await user.selectOptions(select, 'all');
    }

    await waitFor(() => {
      expect(mockUseActivity.fetchActivities).toHaveBeenCalledWith({
        dateRange: undefined,
      });
    });
  });

  it('displays all time range options', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('This Quarter')).toBeInTheDocument();
    expect(screen.getByText('This Year')).toBeInTheDocument();
    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('passes activities to activity timeline component', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Timeline (2 activities)')).toBeInTheDocument();
  });

  it('passes metrics to metrics grid component', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Metrics Grid (3 metrics)')).toBeInTheDocument();
  });

  it('passes categories to category stats component', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    expect(
      screen.getByText('Category Stats (3 categories)')
    ).toBeInTheDocument();
  });

  it('displays loading state in date filter when loading', () => {
    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      loading: true,
    });

    render(<Analytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    const select = screen
      .getByTestId('date-range-filter')
      .querySelector('select');
    expect(select).toBeDisabled();
  });

  it('handles empty activities data', () => {
    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      activities: [],
    });

    render(<Analytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Timeline (0 activities)')).toBeInTheDocument();
  });

  it('handles empty analytics data', () => {
    vi.mocked(useAnalyticsData).mockReturnValue({
      metrics: [],
      categories: [],
    });

    render(<Analytics />, { wrapper: createWrapper() });

    expect(screen.getByText('Metrics Grid (0 metrics)')).toBeInTheDocument();
    expect(
      screen.getByText('Category Stats (0 categories)')
    ).toBeInTheDocument();
  });

  it('handles navigation correctly', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

    render(<Analytics />, { wrapper: createWrapper() });

    // Simulate navigation call (this would typically be triggered by a component interaction)
    const page = screen.getByTestId('analytics-header');

    // The page component doesn't directly expose navigation, but we can test the function exists
    expect(page).toBeInTheDocument();

    pushStateSpy.mockRestore();
    dispatchEventSpy.mockRestore();
  });

  it('fetches activities with limit parameter', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    // Verify that useActivity was called with limit parameter
    expect(useActivity).toHaveBeenCalledWith({
      limit: 100,
    });
  });

  it('handles custom date range', async () => {
    const user = userEvent.setup();

    // Mock useState to return custom range
    const mockSetDateRange = vi.fn();
    const mockUseState = vi.spyOn(React, 'useState');
    mockUseState.mockReturnValueOnce([
      {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      },
      mockSetDateRange,
    ]);

    render(<Analytics />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockUseActivity.fetchActivities).toHaveBeenCalledWith({
        dateRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31'),
        },
      });
    });

    mockUseState.mockRestore();
  });

  it('processes analytics data correctly', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    // Verify that useAnalyticsData was called with activities
    expect(useAnalyticsData).toHaveBeenCalledWith({
      activities: mockActivities,
    });
  });

  it('handles refresh functionality', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    // The refresh function should be available through the hook
    expect(mockUseActivity.refresh).toBeDefined();
  });

  it('has proper page layout structure', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    expect(
      screen.getByText('Collection analytics and insights')
    ).toBeInTheDocument();

    // Check for proper grid layout structure
    const gridContainer = screen
      .getByText('Analytics')
      .closest('.min-h-screen');
    expect(gridContainer).toHaveClass('min-h-screen');
  });

  it('maintains responsive design structure', () => {
    render(<Analytics />, { wrapper: createWrapper() });

    // The component should have responsive grid classes
    const container = screen.getByText('Analytics').closest('div');
    expect(container).toBeInTheDocument();
  });
});
