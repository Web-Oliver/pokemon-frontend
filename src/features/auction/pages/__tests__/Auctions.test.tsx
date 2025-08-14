/**
 * Auctions Page Unit Tests
 *
 * Tests Auctions page functionality including:
 * - Auction listing and display
 * - Status filtering functionality
 * - Navigation to create/detail pages
 * - Statistics and overview cards
 * - Loading and error states
 * - Empty state handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auctions from '../Auctions';
// Import mocked hook
import { useAuction } from '../../../../shared/hooks/useAuction';

// Mock dependencies
vi.mock('../../../../shared/hooks/useAuction', () => ({
  useAuction: vi.fn(),
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    navigateToAuctionDetail: vi.fn(),
    navigateToCreate: {
      auction: vi.fn(),
    },
    navigateTo: vi.fn(),
  },
}));

vi.mock('../../../../shared/utils/helpers/auctionStatusUtils', () => ({
  getStatusColor: vi.fn((status) => {
    const colors = {
      draft: 'bg-gray-500 text-white',
      active: 'bg-blue-500 text-white',
      sold: 'bg-green-500 text-white',
      expired: 'bg-red-500 text-white',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500 text-white';
  }),
  getStatusPriority: vi.fn((status) => {
    const priorities = { draft: 1, active: 2, sold: 3, expired: 4 };
    return priorities[status as keyof typeof priorities] || 1;
  }),
}));

vi.mock('../../../../shared/utils', () => ({
  formatDateWithTime: vi.fn((date) => '2024-01-15 10:30 AM'),
}));

vi.mock(
  '../../../../shared/components/molecules/common/GenericLoadingState',
  () => ({
    default: ({ text }: any) => <div data-testid="loading-state">{text}</div>,
  })
);

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

const mockAuctions = [
  {
    _id: 'auction-1',
    topText: 'Premium Pokemon Cards Auction',
    bottomText: 'Rare and vintage collection',
    status: 'active',
    auctionDate: '2024-02-15T10:00:00Z',
    totalValue: 5000,
    soldValue: 1200,
    itemCount: 25,
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z',
  },
  {
    _id: 'auction-2',
    topText: 'Modern Pokemon Collection',
    bottomText: 'Recent sets and promos',
    status: 'draft',
    auctionDate: '2024-03-01T12:00:00Z',
    totalValue: 2500,
    soldValue: 0,
    itemCount: 15,
    isActive: false,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    _id: 'auction-3',
    topText: 'Completed Auction',
    bottomText: 'Successfully sold items',
    status: 'sold',
    auctionDate: '2024-01-20T14:00:00Z',
    totalValue: 3000,
    soldValue: 2800,
    itemCount: 18,
    isActive: false,
    createdAt: '2024-01-05T00:00:00Z',
  },
];

describe('Auctions Page', () => {
  const mockUseAuction = {
    auctions: mockAuctions,
    loading: false,
    error: null,
    fetchAuctions: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(useAuction).mockReturnValue(mockUseAuction);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders auctions page with header and stats', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    expect(screen.getByText('Auction Management Hub')).toBeInTheDocument();
    expect(
      screen.getByText('Manage and track your Pokemon collection auctions')
    ).toBeInTheDocument();
  });

  it('displays auction statistics correctly', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    // Should show total auctions
    expect(screen.getByText('3')).toBeInTheDocument(); // Total auctions count

    // Should show active auctions
    expect(screen.getByText('1')).toBeInTheDocument(); // Active auctions count (status: active)

    // Should show total value from all auctions
    const totalValue = mockAuctions.reduce(
      (sum, auction) => sum + auction.totalValue,
      0
    );
    expect(
      screen.getByText(`$${totalValue.toLocaleString()}`)
    ).toBeInTheDocument();
  });

  it('displays list of auctions', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    expect(
      screen.getByText('Premium Pokemon Cards Auction')
    ).toBeInTheDocument();
    expect(screen.getByText('Modern Pokemon Collection')).toBeInTheDocument();
    expect(screen.getByText('Completed Auction')).toBeInTheDocument();
  });

  it('displays auction status badges with correct styling', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
    expect(screen.getByText('SOLD')).toBeInTheDocument();
  });

  it('displays auction details correctly', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    // Should show item counts
    expect(screen.getByText('25 items')).toBeInTheDocument();
    expect(screen.getByText('15 items')).toBeInTheDocument();
    expect(screen.getByText('18 items')).toBeInTheDocument();

    // Should show total values
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('$2,500')).toBeInTheDocument();
    expect(screen.getByText('$3,000')).toBeInTheDocument();
  });

  it('handles status filtering', async () => {
    const user = userEvent.setup();

    render(<Auctions />, { wrapper: createWrapper() });

    // Find and use the status filter
    const filterSelect = screen.getByDisplayValue('All Statuses');
    await user.selectOptions(filterSelect, 'active');

    // Should only show active auctions
    expect(
      screen.getByText('Premium Pokemon Cards Auction')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Modern Pokemon Collection')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Completed Auction')).not.toBeInTheDocument();
  });

  it('handles clearing status filter', async () => {
    const user = userEvent.setup();

    render(<Auctions />, { wrapper: createWrapper() });

    // Apply filter first
    const filterSelect = screen.getByDisplayValue('All Statuses');
    await user.selectOptions(filterSelect, 'draft');

    // Clear filter
    await user.selectOptions(filterSelect, '');

    // Should show all auctions again
    expect(
      screen.getByText('Premium Pokemon Cards Auction')
    ).toBeInTheDocument();
    expect(screen.getByText('Modern Pokemon Collection')).toBeInTheDocument();
    expect(screen.getByText('Completed Auction')).toBeInTheDocument();
  });

  it('handles navigation to auction detail', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<Auctions />, { wrapper: createWrapper() });

    // Click on an auction card to navigate to detail
    const auctionCard = screen
      .getByText('Premium Pokemon Cards Auction')
      .closest('.cursor-pointer');
    if (auctionCard) {
      await user.click(auctionCard);
      expect(navigationHelper.navigateToAuctionDetail).toHaveBeenCalledWith(
        'auction-1'
      );
    }
  });

  it('handles navigation to create auction', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<Auctions />, { wrapper: createWrapper() });

    const createButton = screen.getByText('Create New Auction');
    await user.click(createButton);

    expect(navigationHelper.navigateToCreate.auction).toHaveBeenCalled();
  });

  it('displays loading state correctly', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      loading: true,
      auctions: [],
    });

    render(<Auctions />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Loading auctions...')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      error: 'Failed to load auctions',
    });

    render(<Auctions />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to load auctions')).toBeInTheDocument();
  });

  it('handles error clearing', async () => {
    const user = userEvent.setup();

    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      error: 'Test error message',
    });

    render(<Auctions />, { wrapper: createWrapper() });

    expect(screen.getByText('Test error message')).toBeInTheDocument();

    // Find and click error dismiss button (typically an X button)
    const dismissButtons = screen.getAllByRole('button');
    const errorDismissButton = dismissButtons.find(
      (button) => button.querySelector('svg') // Look for X icon
    );

    if (errorDismissButton) {
      await user.click(errorDismissButton);
      expect(mockUseAuction.clearError).toHaveBeenCalled();
    }
  });

  it('displays empty state when no auctions', () => {
    vi.mocked(useAuction).mockReturnValue({
      ...mockUseAuction,
      auctions: [],
    });

    render(<Auctions />, { wrapper: createWrapper() });

    expect(screen.getByText('No auctions found')).toBeInTheDocument();
    expect(
      screen.getByText('Create your first auction to get started')
    ).toBeInTheDocument();
  });

  it('fetches auctions on mount', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    expect(mockUseAuction.fetchAuctions).toHaveBeenCalled();
  });

  it('sorts auctions by status priority and date', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    // Check that auctions are displayed in the correct order
    const auctionTexts = screen
      .getAllByText(/Pokemon/i)
      .map((el) => el.textContent);

    // Active auctions should appear first, then others by date
    expect(auctionTexts).toEqual([
      'Premium Pokemon Cards Auction', // active
      'Modern Pokemon Collection', // draft
      'Completed Auction', // sold
    ]);
  });

  it('displays sold value for completed auctions', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    // The completed auction should show sold value
    expect(screen.getByText('$2,800')).toBeInTheDocument(); // soldValue for completed auction
  });

  it('shows progress indicators for auctions with sales', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    // Should show progress for auctions that have soldValue > 0
    const auctionWithSales = mockAuctions.find((a) => a.soldValue > 0);
    if (auctionWithSales) {
      const progressPercentage = Math.round(
        (auctionWithSales.soldValue / auctionWithSales.totalValue) * 100
      );
      expect(screen.getByText(`${progressPercentage}%`)).toBeInTheDocument();
    }
  });

  it('handles auction date display formatting', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    // Should show formatted dates using the mocked formatter
    expect(screen.getAllByText('2024-01-15 10:30 AM')).toHaveLength(
      mockAuctions.length
    );
  });

  it('displays different status filters', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    const filterSelect = screen.getByDisplayValue('All Statuses');

    // Check that all status options are available
    expect(screen.getByText('All Statuses')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Sold')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
  });

  it('handles multiple status filters correctly', async () => {
    const user = userEvent.setup();

    render(<Auctions />, { wrapper: createWrapper() });

    const filterSelect = screen.getByDisplayValue('All Statuses');

    // Test draft filter
    await user.selectOptions(filterSelect, 'draft');
    expect(screen.getByText('Modern Pokemon Collection')).toBeInTheDocument();
    expect(
      screen.queryByText('Premium Pokemon Cards Auction')
    ).not.toBeInTheDocument();

    // Test sold filter
    await user.selectOptions(filterSelect, 'sold');
    expect(screen.getByText('Completed Auction')).toBeInTheDocument();
    expect(
      screen.queryByText('Modern Pokemon Collection')
    ).not.toBeInTheDocument();
  });

  it('shows correct auction item counts in statistics', () => {
    render(<Auctions />, { wrapper: createWrapper() });

    // Should calculate total items across all auctions
    const totalItems = mockAuctions.reduce(
      (sum, auction) => sum + auction.itemCount,
      0
    );
    expect(screen.getByText(totalItems.toString())).toBeInTheDocument();
  });

  it('handles navigation back to dashboard', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<Auctions />, { wrapper: createWrapper() });

    // Look for back button or navigation link
    const backButton =
      screen.getByLabelText(/back/i) || screen.getByText(/dashboard/i);
    if (backButton) {
      await user.click(backButton);
      expect(navigationHelper.navigateTo).toHaveBeenCalledWith('/dashboard');
    }
  });
});
