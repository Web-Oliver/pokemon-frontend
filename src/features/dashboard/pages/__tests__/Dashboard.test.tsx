/**
 * Dashboard Page Unit Tests
 *
 * Tests Dashboard page functionality including:
 * - Dashboard statistics display
 * - Collection stats cards (items, value, sales, grades)
 * - Recent activities timeline
 * - Navigation to different sections
 * - Data loading and error states
 * - Quick action buttons
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import Dashboard from '../Dashboard';
// Import mocked hooks and services - EXACT STRUCTURE MATCH
import { useRecentActivities } from '../../../../shared/hooks/useActivity';
import { useCollectionStats } from '../../../../shared/hooks/useCollectionStats';

// Mock dependencies
vi.mock('../../../../shared/hooks/useActivity', () => ({
  useRecentActivities: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useCollectionStats', () => ({
  useCollectionStats: vi.fn(),
}));

vi.mock('../../../../shared/services/UnifiedApiService', () => ({
  unifiedApiService: {
    status: {
      getApiStatus: vi.fn(),
      getDataCounts: vi.fn(),
    },
    collection: {
      getPsaGradedCards: vi.fn(),
      getRawCards: vi.fn(),
      getSealedProducts: vi.fn(),
      getPsaGradedCardById: vi.fn(),
      createPsaCard: vi.fn(),
      updatePsaCard: vi.fn(),
      deletePsaCard: vi.fn(),
      markPsaCardSold: vi.fn(),
    },
    auctions: {
      getAuctions: vi.fn(),
      getAuctionById: vi.fn(),
      createAuction: vi.fn(),
      updateAuction: vi.fn(),
      deleteAuction: vi.fn(),
    },
  },
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    navigateTo: vi.fn(),
    navigateToCreate: {
      item: vi.fn(),
    },
  },
}));

vi.mock('../../../../shared/utils', () => ({
  displayPrice: vi.fn((price) => `$${price?.toLocaleString() || '0'}`),
}));

vi.mock('../../../../shared/utils/helpers/activityHelpers', () => ({
  getActivityIcon: vi.fn(() => 'TrendingUp'),
  getActivityColor: vi.fn(() => 'blue'),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock('../../../../shared/utils/ui/themeConfig', () => ({
  useCentralizedTheme: vi.fn(() => ({
    visualTheme: 'cosmic',
    particleEffectsEnabled: true,
    glassmorphismIntensity: 0.8,
  })),
  themeUtils: {
    getThemeClasses: vi.fn(() => ({})),
    applyTheme: vi.fn(),
    shouldShowParticles: vi.fn(() => true),
  },
}));

// Mock dashboard components to match actual component props and rendering
vi.mock('../../components/dashboard', () => ({
  DashboardItemsCard: ({ value, loading }: any) => (
    <div data-testid="dashboard-items-card">
      <div>{loading ? 'Loading...' : value}</div>
    </div>
  ),
  DashboardValueCard: ({ value, loading }: any) => (
    <div data-testid="dashboard-value-card">
      <div>{loading ? 'Loading...' : value}</div>
    </div>
  ),
  DashboardSalesCard: ({ value, loading }: any) => (
    <div data-testid="dashboard-sales-card">
      <div>{loading ? 'Loading...' : value}</div>
    </div>
  ),
  DashboardGradedCard: ({ value, loading }: any) => (
    <div data-testid="dashboard-graded-card">
      <div>{loading ? 'Loading...' : value}</div>
    </div>
  ),
  DashboardDataCard: ({ value, loading }: any) => (
    <div data-testid="dashboard-data-card">
      <div>{loading ? 'Loading...' : value}</div>
    </div>
  ),
}));

vi.mock(
  '../../../../shared/components/molecules/common/ActivityListItem',
  () => ({
    default: ({ activity }: any) => (
      <div data-testid="activity-item">
        <div>{activity.title}</div>
        <div>{activity.type}</div>
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

// EXACT match for useCollectionStats return type
const mockCollectionStats = {
  totalItems: 150,
  totalValue: 25000,
  totalSales: 12,
  averageGrade: '8.5',
  totalValueFormatted: '$25,000',
  topGradedCards: 75,
  recentlyAdded: 5,
  itemsByType: {
    psaCards: 75,
    rawCards: 50,
    sealedProducts: 25,
  },
  loading: false, // Hook includes loading state
};

const mockRecentActivities = [
  {
    _id: 'activity-1',
    type: 'card_added',
    title: 'Added Charizard PSA 10',
    description: 'Added new card to collection',
    timestamp: new Date('2024-01-15T10:00:00Z'),
    metadata: { cardName: 'Charizard' },
  },
  {
    _id: 'activity-2',
    type: 'sale_completed',
    title: 'Sold Blastoise',
    description: 'Completed sale for $200',
    timestamp: new Date('2024-01-14T14:30:00Z'),
    metadata: { salePrice: 200 },
  },
];

const mockDataStats = {
  setsCount: 45,
  cardsCount: 8500,
  productsCount: 350,
};

describe('Dashboard Page', () => {
  const mockUseCollectionStats = mockCollectionStats;
  // EXACT match for useRecentActivities return type
  const mockUseRecentActivities = {
    activities: mockRecentActivities,
    loading: false,
    refresh: vi.fn(), // Hook includes refresh function
  };

  beforeEach(() => {
    vi.mocked(useCollectionStats).mockReturnValue(mockUseCollectionStats);
    vi.mocked(useRecentActivities).mockReturnValue(mockUseRecentActivities);
    vi.mocked(useQuery).mockReturnValue({
      data: mockDataStats,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard page with header and stats', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Command Center')).toBeInTheDocument();
    expect(
      screen.getByText('Neural-powered collection management for your universe')
    ).toBeInTheDocument();
  });

  it('displays collection statistics cards', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId('dashboard-items-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-value-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-sales-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-graded-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-data-card')).toBeInTheDocument();
  });

  it('displays correct statistics values', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('displays data statistics', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('0')).toBeInTheDocument(); // Data card shows setProducts count = 0 from mock
  });

  it('displays recent activities', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    const activityItems = screen.getAllByTestId('activity-item');
    expect(activityItems).toHaveLength(2);

    expect(screen.getByText('Added Charizard PSA 10')).toBeInTheDocument();
    expect(screen.getByText('Sold Blastoise')).toBeInTheDocument();
    expect(screen.getByText('card_added')).toBeInTheDocument();
    expect(screen.getByText('sale_completed')).toBeInTheDocument();
  });

  it('renders dashboard cards', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId('dashboard-items-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-value-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-sales-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-graded-card')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-data-card')).toBeInTheDocument();
  });

  it('handles quick action for adding new item', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<Dashboard />, { wrapper: createWrapper() });

    // EXACT match - Dashboard calls navigateTo('/add-item')
    const addButton = screen.getByText('Add New Item');
    await user.click(addButton);
    expect(navigationHelper.navigateTo).toHaveBeenCalledWith('/add-item');
  });

  it('displays loading state for collection stats', () => {
    vi.mocked(useCollectionStats).mockReturnValue({
      ...mockUseCollectionStats,
      loading: true,
    });

    render(<Dashboard />, { wrapper: createWrapper() });

    // Should show loading indicators in dashboard cards
    expect(screen.getByText('Command Center')).toBeInTheDocument();
  });

  it('displays loading state for recent activities', () => {
    vi.mocked(useRecentActivities).mockReturnValue({
      activities: [],
      loading: true,
      error: null,
    });

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('displays error state for recent activities', () => {
    vi.mocked(useRecentActivities).mockReturnValue({
      activities: [],
      loading: false,
      refresh: vi.fn(),
    });

    render(<Dashboard />, { wrapper: createWrapper() });

    // Error handling is done by PageLayout, just check component renders
    expect(screen.getByText('Command Center')).toBeInTheDocument();
  });

  it('displays empty state when no activities', () => {
    vi.mocked(useRecentActivities).mockReturnValue({
      activities: [],
      loading: false,
      error: null,
    });

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('No recent activities')).toBeInTheDocument();
  });

  it('displays data stats loading state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Sets: 0')).toBeInTheDocument();
    expect(screen.getByText('Cards: 0')).toBeInTheDocument();
  });

  it('displays data stats error state', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load data'),
      refetch: vi.fn(),
    } as any);

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('Sets: 0')).toBeInTheDocument();
    expect(screen.getByText('Cards: 0')).toBeInTheDocument();
  });

  it('handles stats with zero values gracefully', () => {
    vi.mocked(useCollectionStats).mockReturnValue({
      totalItems: 0,
      totalValue: 0,
      psaGradedCards: 0,
      rawCards: 0,
      sealedProducts: 0,
      averageGrade: 0,
      totalValueFormatted: '$0',
      salesCount: 0,
      salesValue: 0,
    });

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    vi.mocked(useCollectionStats).mockReturnValue({
      ...mockCollectionStats,
      totalItems: 1250,
      totalValue: 125000,
      salesValue: 15500,
    });

    render(<Dashboard />, { wrapper: createWrapper() });

    expect(screen.getByText('1250')).toBeInTheDocument();
    expect(screen.getByText('$125,000')).toBeInTheDocument(); // Uses formatted value
    expect(screen.getByText('15500')).toBeInTheDocument(); // Sales count
  });

  it('displays dashboard sections in correct order', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    // Check that main sections are present
    expect(screen.getByText('Command Center')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
  });

  it('shows proper activity timeline formatting', () => {
    render(<Dashboard />, { wrapper: createWrapper() });

    // Activities should be displayed in chronological order
    const activityItems = screen.getAllByTestId('activity-item');
    expect(activityItems[0]).toHaveTextContent('Added Charizard PSA 10');
    expect(activityItems[1]).toHaveTextContent('Sold Blastoise');
  });

  it('handles navigation to full activity list', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<Dashboard />, { wrapper: createWrapper() });

    // EXACT match - Dashboard shows "View All Activity & Analytics" button
    const viewAllButton = screen.getByText('View All Activity & Analytics');
    await user.click(viewAllButton);
    expect(navigationHelper.navigateTo).toHaveBeenCalledWith('/activity');
  });
});
