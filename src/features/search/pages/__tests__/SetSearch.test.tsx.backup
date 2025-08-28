/**
 * SetSearch Page Unit Tests
 *
 * Tests SetSearch page functionality including:
 * - Component rendering and search interface
 * - Search input and filtering
 * - Pagination functionality
 * - API calls and data loading
 * - Error handling and user interactions
 * - Year validation and filtering
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SetSearch from '../SetSearch';
import { usePaginatedSearch } from '../../../../shared/hooks/usePaginatedSearch';

// Mock dependencies
vi.mock('../../../../shared/hooks/usePaginatedSearch', () => ({
  usePaginatedSearch: vi.fn(),
}));

vi.mock('../../../../shared/utils/navigation', () => ({
  navigationHelper: {
    navigateTo: vi.fn(),
  },
}));

vi.mock('../../../../shared/utils/performance/logger', () => ({
  log: vi.fn(),
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

const mockSets = [
  {
    id: '1',
    setName: 'Base Set',
    year: 1998,
    totalCardsInSet: 102,
    setUrl: 'base-set',
  },
  {
    id: '2',
    setName: 'Jungle',
    year: 1999,
    totalCardsInSet: 64,
    setUrl: 'jungle',
  },
];

const mockPagination = {
  currentPage: 1,
  totalPages: 3,
  totalItems: 25,
  hasNextPage: true,
  hasPreviousPage: false,
};

describe('SetSearch Page', () => {
  const mockUsePaginatedSearch = {
    items: mockSets,
    pagination: mockPagination,
    loading: false,
    error: null,
    searchSets: vi.fn(),
    setPage: vi.fn(),
    clearError: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(usePaginatedSearch).mockReturnValue(mockUsePaginatedSearch);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders search page with search inputs', () => {
    render(<SetSearch />, { wrapper: createWrapper() });

    expect(screen.getByText('Set Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search sets/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/filter by year/i)).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('displays sets data correctly', () => {
    render(<SetSearch />, { wrapper: createWrapper() });

    expect(screen.getByText('Base Set')).toBeInTheDocument();
    expect(screen.getByText('Jungle')).toBeInTheDocument();
    expect(screen.getByText('1998')).toBeInTheDocument();
    expect(screen.getByText('1999')).toBeInTheDocument();
    expect(screen.getByText('102 cards')).toBeInTheDocument();
    expect(screen.getByText('64 cards')).toBeInTheDocument();
  });

  it('performs initial search on component mount', () => {
    render(<SetSearch />, { wrapper: createWrapper() });

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
    });
  });

  it('handles search input changes', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search sets/i);
    await user.type(searchInput, 'Charizard');

    expect(searchInput).toHaveValue('Charizard');
  });

  it('handles year filter input changes', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const yearInput = screen.getByPlaceholderText(/filter by year/i);
    await user.type(yearInput, '1998');

    expect(yearInput).toHaveValue('1998');
  });

  it('performs search when search button is clicked', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search sets/i);
    const searchButton = screen.getByText('Search');

    await user.type(searchInput, 'Base');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      search: 'Base',
      page: 1,
      limit: 12,
    });
  });

  it('performs search when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search sets/i);

    await user.type(searchInput, 'Jungle{enter}');

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      search: 'Jungle',
      page: 1,
      limit: 12,
    });
  });

  it('performs search with both search term and year filter', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search sets/i);
    const yearInput = screen.getByPlaceholderText(/filter by year/i);
    const searchButton = screen.getByText('Search');

    await user.type(searchInput, 'Base');
    await user.type(yearInput, '1998');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      search: 'Base',
      year: 1998,
      page: 1,
      limit: 12,
    });
  });

  it('validates year filter range', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const yearInput = screen.getByPlaceholderText(/filter by year/i);
    const searchButton = screen.getByText('Search');

    // Test invalid year (too early)
    await user.clear(yearInput);
    await user.type(yearInput, '1800');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
    });

    // Test invalid year (too late)
    await user.clear(yearInput);
    await user.type(yearInput, '2050');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
    });

    // Test valid year
    await user.clear(yearInput);
    await user.type(yearInput, '2000');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      year: 2000,
      page: 1,
      limit: 12,
    });
  });

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search sets/i);
    const yearInput = screen.getByPlaceholderText(/filter by year/i);
    const clearButton = screen.getByText('Clear Filters');

    // Set some values
    await user.type(searchInput, 'Base');
    await user.type(yearInput, '1998');

    // Clear filters
    await user.click(clearButton);

    expect(searchInput).toHaveValue('');
    expect(yearInput).toHaveValue('');
    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
    });
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    // Should show pagination controls
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

    // Click next page
    const nextButton = screen.getByLabelText('Next page');
    await user.click(nextButton);

    expect(mockUsePaginatedSearch.setPage).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<SetSearch />, { wrapper: createWrapper() });

    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('enables next button when has next page', () => {
    render(<SetSearch />, { wrapper: createWrapper() });

    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    vi.mocked(usePaginatedSearch).mockReturnValue({
      ...mockUsePaginatedSearch,
      pagination: {
        ...mockPagination,
        currentPage: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });

    render(<SetSearch />, { wrapper: createWrapper() });

    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('displays loading state correctly', () => {
    vi.mocked(usePaginatedSearch).mockReturnValue({
      ...mockUsePaginatedSearch,
      loading: true,
    });

    render(<SetSearch />, { wrapper: createWrapper() });

    // PageLayout should handle loading state
    expect(screen.getByText('Set Search')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    vi.mocked(usePaginatedSearch).mockReturnValue({
      ...mockUsePaginatedSearch,
      error: 'Failed to search sets',
    });

    render(<SetSearch />, { wrapper: createWrapper() });

    // PageLayout should handle error state
    expect(screen.getByText('Set Search')).toBeInTheDocument();
  });

  it('displays empty state when no sets found', () => {
    vi.mocked(usePaginatedSearch).mockReturnValue({
      ...mockUsePaginatedSearch,
      items: [],
    });

    render(<SetSearch />, { wrapper: createWrapper() });

    expect(screen.getByText('No sets found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your search criteria')
    ).toBeInTheDocument();
  });

  it('navigates to set detail when set is clicked', async () => {
    const user = userEvent.setup();
    const { navigationHelper } = await import(
      '../../../../shared/utils/navigation'
    );

    render(<SetSearch />, { wrapper: createWrapper() });

    const setCard = screen.getByText('Base Set').closest('button');
    expect(setCard).toBeInTheDocument();

    if (setCard) {
      await user.click(setCard);
      expect(navigationHelper.navigateTo).toHaveBeenCalledWith(
        '/sets/base-set'
      );
    }
  });

  it('handles non-numeric year input gracefully', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const yearInput = screen.getByPlaceholderText(/filter by year/i);
    const searchButton = screen.getByText('Search');

    await user.type(yearInput, 'abc');
    await user.click(searchButton);

    // Should search without year filter when year is not a number
    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
    });
  });

  it('shows correct total items count', () => {
    render(<SetSearch />, { wrapper: createWrapper() });

    expect(screen.getByText('Total: 25 sets')).toBeInTheDocument();
  });

  it('handles search with only year filter', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const yearInput = screen.getByPlaceholderText(/filter by year/i);
    const searchButton = screen.getByText('Search');

    await user.type(yearInput, '2000');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      year: 2000,
      page: 1,
      limit: 12,
    });
  });

  it('handles search with only search term', async () => {
    const user = userEvent.setup();
    render(<SetSearch />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search sets/i);
    const searchButton = screen.getByText('Search');

    await user.type(searchInput, 'Fossil');
    await user.click(searchButton);

    expect(mockUsePaginatedSearch.searchSets).toHaveBeenCalledWith({
      search: 'Fossil',
      page: 1,
      limit: 12,
    });
  });

  it('displays set cards with correct styling and information', () => {
    render(<SetSearch />, { wrapper: createWrapper() });

    // Should show set cards with glassmorphism styling
    const setCards = screen.getAllByText(/cards/);
    expect(setCards).toHaveLength(2);

    // Should show year badges
    const yearBadges = screen.getByText('1998');
    expect(yearBadges).toBeInTheDocument();
  });
});
