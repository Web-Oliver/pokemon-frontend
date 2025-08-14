/**
 * Activity Page Unit Tests
 *
 * Tests Activity page functionality including:
 * - Component rendering and activity display
 * - Search functionality and filtering
 * - Activity type filtering and date range filtering
 * - Activity stats display
 * - Load more functionality
 * - Loading and error states
 * - Navigation interactions
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Activity from '../Activity';
import {
  ACTIVITY_TYPES,
  useActivity,
} from '../../../../shared/hooks/useActivity';

// Mock dependencies
vi.mock('../../../../shared/hooks/useActivity', () => ({
  useActivity: vi.fn(),
  ACTIVITY_TYPES: {
    CARD_ADDED: 'card_added',
    CARD_UPDATED: 'card_updated',
    CARD_DELETED: 'card_deleted',
    PRICE_UPDATE: 'price_update',
    AUCTION_CREATED: 'auction_created',
    AUCTION_UPDATED: 'auction_updated',
    AUCTION_DELETED: 'auction_deleted',
    AUCTION_ITEM_ADDED: 'auction_item_added',
    AUCTION_ITEM_REMOVED: 'auction_item_removed',
    SALE_COMPLETED: 'sale_completed',
    SALE_UPDATED: 'sale_updated',
    MILESTONE: 'milestone',
    COLLECTION_STATS: 'collection_stats',
    SYSTEM: 'system',
  },
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    navigateTo: vi.fn(),
  },
}));

vi.mock('../../../../shared/utils', () => ({
  displayPrice: vi.fn((price) => `$${price}`),
  getRelativeTime: vi.fn((date) => '2 hours ago'),
}));

vi.mock('../../../../shared/utils/helpers/activityHelpers', () => ({
  getActivityColor: vi.fn((type) => 'blue'),
}));

vi.mock('../../../../shared/hooks/theme/useTheme', () => ({
  useTheme: vi.fn(() => ({
    currentTheme: 'cosmic',
    setTheme: vi.fn(),
    accessibility: {},
    animation: { enabled: true },
    layout: {},
    toggleDarkMode: vi.fn(),
  })),
}));

vi.mock('../../../../shared/utils/ui/themeConfig', () => ({
  useCentralizedTheme: vi.fn(() => ({
    visualTheme: 'cosmic',
    particleEffectsEnabled: true,
    glassmorphismIntensity: 0.8,
  })),
}));

// Mock reusable components
vi.mock(
  '../../../../shared/components/molecules/common/ActivityStatCard',
  () => ({
    default: ({ title, value, icon, colorScheme }: any) => (
      <div data-testid="activity-stat-card">
        <div>{title}</div>
        <div>{value}</div>
      </div>
    ),
  })
);

vi.mock(
  '../../../../shared/components/molecules/common/ActivityListItem',
  () => ({
    default: ({ activity, uniqueKey }: any) => (
      <div data-testid="activity-list-item" key={uniqueKey}>
        <div>{activity.title}</div>
        <div>{activity.type}</div>
        <div>{activity.description}</div>
      </div>
    ),
  })
);

vi.mock(
  '../../../../shared/components/molecules/common/ActivityFilterHub',
  () => ({
    default: ({
      searchInput,
      setSearchInput,
      handleSearch,
      clearSearch,
      handleFilterChange,
      handleDateRangeChange,
      filterOptions,
      dateRangeOptions,
    }: any) => (
      <div data-testid="activity-filter-hub">
        <form onSubmit={handleSearch}>
          <input
            data-testid="search-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search activities..."
          />
          <button type="submit">Search</button>
          <button type="button" onClick={clearSearch}>
            Clear
          </button>
        </form>
        <div>
          {filterOptions.map((option: any) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div>
          {dateRangeOptions.map((option: any) => (
            <button
              key={option.value}
              onClick={() => handleDateRangeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    ),
  })
);

vi.mock(
  '../../../../shared/components/molecules/common/GenericLoadingState',
  () => ({
    default: ({ text }: any) => <div data-testid="loading-state">{text}</div>,
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
    _id: '1',
    type: ACTIVITY_TYPES.CARD_ADDED,
    title: 'Added Charizard',
    description: 'Added Charizard PSA 10 to collection',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    metadata: { cardName: 'Charizard', grade: 10 },
  },
  {
    _id: '2',
    type: ACTIVITY_TYPES.SALE_COMPLETED,
    title: 'Sold Blastoise',
    description: 'Sold Blastoise Raw Card for $150',
    timestamp: new Date('2024-01-16T14:30:00Z'),
    metadata: { salePrice: 150, cardName: 'Blastoise' },
  },
  {
    _id: '3',
    type: ACTIVITY_TYPES.PRICE_UPDATE,
    title: 'Updated Venusaur Price',
    description: 'Updated Venusaur price to $200',
    timestamp: new Date('2024-01-17T09:15:00Z'),
    metadata: { oldPrice: 180, newPrice: 200 },
  },
];

const mockStats = {
  total: 25,
  lastActivity: '2024-01-17T09:15:00Z',
  recentCount: 5,
};

describe('Activity Page', () => {
  const mockUseActivity = {
    activities: mockActivities,
    stats: mockStats,
    loading: false,
    error: null,
    hasMore: true,
    searchTerm: '',
    filters: { type: undefined, dateRange: undefined },
    setFilters: vi.fn(),
    searchActivities: vi.fn(),
    clearSearch: vi.fn(),
    loadMore: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useActivity).mockReturnValue(mockUseActivity);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders activity page with all components', () => {
    render(<Activity />, { wrapper: createWrapper() });

    expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Advanced timeline visualization of your collection universe'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('activity-filter-hub')).toBeInTheDocument();
  });

  it('displays activity statistics cards', () => {
    render(<Activity />, { wrapper: createWrapper() });

    const statCards = screen.getAllByTestId('activity-stat-card');
    expect(statCards.length).toBe(3);

    expect(screen.getByText('Total Activities')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Showing Results')).toBeInTheDocument();
  });

  it('displays activities list with proper data', () => {
    render(<Activity />, { wrapper: createWrapper() });

    const activityItems = screen.getAllByTestId('activity-list-item');
    expect(activityItems.length).toBe(3);

    expect(screen.getByText('Added Charizard')).toBeInTheDocument();
    expect(screen.getByText('Sold Blastoise')).toBeInTheDocument();
    expect(screen.getByText('Updated Venusaur Price')).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const searchInput = screen.getByTestId('search-input');
    const searchButton = screen.getByText('Search');

    await user.type(searchInput, 'Charizard');
    await user.click(searchButton);

    expect(mockUseActivity.searchActivities).toHaveBeenCalledWith('Charizard');
  });

  it('handles clear search', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    expect(mockUseActivity.clearSearch).toHaveBeenCalled();
  });

  it('handles activity type filtering', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const cardAddedFilter = screen.getByText('Cards Added');
    await user.click(cardAddedFilter);

    expect(mockUseActivity.setFilters).toHaveBeenCalledWith({
      type: ACTIVITY_TYPES.CARD_ADDED,
    });
  });

  it('handles "all" filter selection', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const allFilter = screen.getByText('All Activity');
    await user.click(allFilter);

    expect(mockUseActivity.setFilters).toHaveBeenCalledWith({
      type: undefined,
    });
  });

  it('handles date range filtering', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const weekFilter = screen.getByText('This Week');
    await user.click(weekFilter);

    expect(mockUseActivity.setFilters).toHaveBeenCalledWith({
      dateRange: 'week',
    });
  });

  it('handles "all time" date range selection', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const allTimeFilter = screen.getByText('All Time');
    await user.click(allTimeFilter);

    expect(mockUseActivity.setFilters).toHaveBeenCalledWith({
      dateRange: undefined,
    });
  });

  it('displays loading state correctly', () => {
    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      loading: true,
      activities: [],
    });

    render(<Activity />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  it('displays empty state when no activities', () => {
    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      activities: [],
    });

    render(<Activity />, { wrapper: createWrapper() });

    expect(screen.getByText('No activities found')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Try adjusting your search term or filters to see more results.'
      )
    ).toBeInTheDocument();
  });

  it('displays error message in empty state', () => {
    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      activities: [],
      error: 'Failed to load activities',
    });

    render(<Activity />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to load activities')).toBeInTheDocument();
  });

  it('handles load more functionality', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const loadMoreButton = screen.getByText('Load Earlier Activities');
    await user.click(loadMoreButton);

    expect(mockUseActivity.loadMore).toHaveBeenCalled();
  });

  it('disables load more button when loading', () => {
    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      loading: true,
    });

    render(<Activity />, { wrapper: createWrapper() });

    const loadMoreButton = screen.getByText('Loading...');
    expect(loadMoreButton.closest('button')).toBeDisabled();
  });

  it('hides load more button when no more activities', () => {
    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      hasMore: false,
    });

    render(<Activity />, { wrapper: createWrapper() });

    expect(
      screen.queryByText('Load Earlier Activities')
    ).not.toBeInTheDocument();
  });

  it('handles back navigation', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<Activity />, { wrapper: createWrapper() });

    const backButton = screen.getByRole('button', { name: /arrow/i });
    await user.click(backButton);

    expect(navigationHelper.navigateTo).toHaveBeenCalledWith('/dashboard');
  });

  it('deduplicates activities correctly', () => {
    const duplicateActivities = [
      ...mockActivities,
      // Duplicate activity with same _id
      {
        _id: '1',
        type: ACTIVITY_TYPES.CARD_ADDED,
        title: 'Duplicate Charizard',
        description: 'Duplicate entry',
        timestamp: new Date('2024-01-15T10:00:00Z'),
        metadata: {},
      },
    ];

    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      activities: duplicateActivities,
    });

    render(<Activity />, { wrapper: createWrapper() });

    const activityItems = screen.getAllByTestId('activity-list-item');
    expect(activityItems.length).toBe(3); // Should still be 3, not 4
  });

  it('handles activities without _id using fallback keys', () => {
    const activitiesWithoutId = mockActivities.map((activity, index) => ({
      ...activity,
      _id: undefined,
      id: `alt-${index}`,
    }));

    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      activities: activitiesWithoutId,
    });

    render(<Activity />, { wrapper: createWrapper() });

    const activityItems = screen.getAllByTestId('activity-list-item');
    expect(activityItems.length).toBe(3);
  });

  it('initializes with clean filter state on mount', () => {
    render(<Activity />, { wrapper: createWrapper() });

    expect(mockUseActivity.setFilters).toHaveBeenCalledWith({
      type: undefined,
      dateRange: undefined,
    });
  });

  it('handles search form submission', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'test search');

    const form = searchInput.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockUseActivity.searchActivities).toHaveBeenCalledWith(
      'test search'
    );
  });

  it('clears search when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<Activity />, { wrapper: createWrapper() });

    const searchInput = screen.getByTestId('search-input');
    const form = searchInput.closest('form');

    if (form) {
      fireEvent.submit(form);
    }

    expect(mockUseActivity.clearSearch).toHaveBeenCalled();
  });

  it('displays proper stats values', () => {
    render(<Activity />, { wrapper: createWrapper() });

    expect(screen.getByText('25')).toBeInTheDocument(); // Total activities
    expect(screen.getByText('3')).toBeInTheDocument(); // Showing results (activities.length)
  });

  it('handles activity with missing stats gracefully', () => {
    vi.mocked(useActivity).mockReturnValue({
      ...mockUseActivity,
      stats: null,
    });

    render(<Activity />, { wrapper: createWrapper() });

    expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 when no stats
    expect(screen.getByText('No activity')).toBeInTheDocument();
  });

  it('renders all filter options correctly', () => {
    render(<Activity />, { wrapper: createWrapper() });

    expect(screen.getByText('All Activity')).toBeInTheDocument();
    expect(screen.getByText('Cards Added')).toBeInTheDocument();
    expect(screen.getByText('Price Updates')).toBeInTheDocument();
    expect(screen.getByText('Auctions')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Milestones')).toBeInTheDocument();
  });

  it('renders all date range options correctly', () => {
    render(<Activity />, { wrapper: createWrapper() });

    expect(screen.getByText('All Time')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('This Quarter')).toBeInTheDocument();
  });
});
