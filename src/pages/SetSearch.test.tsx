/**
 * SetSearch Page Integration Tests
 * Following CLAUDE.md testing principles - no mocking for API interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SetSearch from './SetSearch';
import * as setsApi from '../api/setsApi';

// Mock the setsApi module
vi.mock('../api/setsApi');
const mockSetsApi = vi.mocked(setsApi);

describe('SetSearch Page Integration Tests', () => {
  const mockSetsResponse = {
    sets: [
      {
        _id: 'set-1',
        setName: 'Base Set',
        year: 1998,
        setUrl: 'https://psacard.com/set/base-set',
        totalCardsInSet: 102,
        totalPsaPopulation: 50000
      },
      {
        _id: 'set-2',
        setName: 'Jungle',
        year: 1999,
        setUrl: 'https://psacard.com/set/jungle',
        totalCardsInSet: 64,
        totalPsaPopulation: 30000
      },
      {
        _id: 'set-3',
        setName: 'Fossil',
        year: 1999,
        setUrl: 'https://psacard.com/set/fossil',
        totalCardsInSet: 62,
        totalPsaPopulation: 25000
      }
    ],
    total: 3,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetsApi.getPaginatedSets.mockResolvedValue(mockSetsResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render set search page with header and filters', async () => {
      render(<SetSearch />);

      expect(screen.getByText('Set Search')).toBeInTheDocument();
      expect(screen.getByText('Search and browse Pokémon card sets')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search sets by name...')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. 1998')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    });

    it('should display sets count in header', async () => {
      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('3 sets available')).toBeInTheDocument();
      });
    });

    it('should load and display sets on initial render', async () => {
      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('Base Set')).toBeInTheDocument();
        expect(screen.getByText('Jungle')).toBeInTheDocument();
        expect(screen.getByText('Fossil')).toBeInTheDocument();
      });

      expect(screen.getByText('1998')).toBeInTheDocument();
      expect(screen.getAllByText('1999')).toHaveLength(2); // Jungle and Fossil both from 1999
      expect(screen.getByText('Search Results (3 sets)')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call API with search term when search button is clicked', async () => {
      render(<SetSearch />);

      const searchInput = screen.getByPlaceholderText('Search sets by name...');
      fireEvent.change(searchInput, { target: { value: 'Base' } });

      const searchButton = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
          page: 1,
          limit: 12,
          search: 'Base'
        });
      });
    });

    it('should call API with year filter when search button is clicked', async () => {
      render(<SetSearch />);

      const yearInput = screen.getByPlaceholderText('e.g. 1998');
      fireEvent.change(yearInput, { target: { value: '1998' } });

      const searchButton = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
          page: 1,
          limit: 12,
          year: 1998
        });
      });
    });

    it('should call API with both search term and year filter', async () => {
      render(<SetSearch />);

      const searchInput = screen.getByPlaceholderText('Search sets by name...');
      fireEvent.change(searchInput, { target: { value: 'Base' } });

      const yearInput = screen.getByPlaceholderText('e.g. 1998');
      fireEvent.change(yearInput, { target: { value: '1998' } });

      const searchButton = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
          page: 1,
          limit: 12,
          search: 'Base',
          year: 1998
        });
      });
    });

    it('should trigger search when Enter key is pressed in search input', async () => {
      render(<SetSearch />);

      const searchInput = screen.getByPlaceholderText('Search sets by name...');
      fireEvent.change(searchInput, { target: { value: 'Jungle' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
          page: 1,
          limit: 12,
          search: 'Jungle'
        });
      });
    });

    it('should trigger search when Enter key is pressed in year input', async () => {
      render(<SetSearch />);

      const yearInput = screen.getByPlaceholderText('e.g. 1998');
      fireEvent.change(yearInput, { target: { value: '1999' } });
      fireEvent.keyPress(yearInput, { key: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
          page: 1,
          limit: 12,
          year: 1999
        });
      });
    });
  });

  describe('Clear Filters', () => {
    it('should clear search inputs and reload data when clear button is clicked', async () => {
      render(<SetSearch />);

      // Set search values
      const searchInput = screen.getByPlaceholderText('Search sets by name...');
      fireEvent.change(searchInput, { target: { value: 'Base' } });

      const yearInput = screen.getByPlaceholderText('e.g. 1998');
      fireEvent.change(yearInput, { target: { value: '1998' } });

      // Clear filters
      const clearButton = screen.getByRole('button', { name: 'Clear' });
      fireEvent.click(clearButton);

      // Check inputs are cleared
      expect(searchInput).toHaveValue('');
      expect(yearInput).toHaveValue('');

      // Check API is called without filters
      await waitFor(() => {
        expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
          page: 1,
          limit: 12
        });
      });
    });
  });

  describe('Set Display', () => {
    it('should display set information correctly', async () => {
      render(<SetSearch />);

      await waitFor(() => {
        // Check Base Set information
        expect(screen.getByText('Base Set')).toBeInTheDocument();
        expect(screen.getByText('1998')).toBeInTheDocument();
        expect(screen.getByText('102')).toBeInTheDocument(); // Total Cards
        expect(screen.getByText('50000')).toBeInTheDocument(); // PSA Population

        // Check external link
        const psaLink = screen.getByText('View on PSA');
        expect(psaLink).toBeInTheDocument();
        expect(psaLink).toHaveAttribute('href', 'https://psacard.com/set/base-set');
        expect(psaLink).toHaveAttribute('target', '_blank');
      });
    });

    it('should display all sets in grid layout', async () => {
      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('Base Set')).toBeInTheDocument();
        expect(screen.getByText('Jungle')).toBeInTheDocument();
        expect(screen.getByText('Fossil')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should not show pagination when there is only one page', async () => {
      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('Base Set')).toBeInTheDocument();
      });

      // Should not show pagination controls
      expect(screen.queryByText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByText('Next')).not.toBeInTheDocument();
    });

    it('should show pagination when there are multiple pages', async () => {
      const multiPageResponse = {
        ...mockSetsResponse,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: false
      };

      mockSetsApi.getPaginatedSets.mockResolvedValue(multiPageResponse);

      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
      });
    });

    it('should handle page navigation', async () => {
      const multiPageResponse = {
        ...mockSetsResponse,
        total: 25,
        totalPages: 3,
        currentPage: 1,
        hasNextPage: true,
        hasPrevPage: false
      };

      mockSetsApi.getPaginatedSets.mockResolvedValue(multiPageResponse);

      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      // Click next page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
          page: 2,
          limit: 12
        });
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading spinner while fetching data', async () => {
      // Make API call pending
      mockSetsApi.getPaginatedSets.mockImplementation(() => new Promise(() => {}));

      render(<SetSearch />);

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('should show error message when API call fails', async () => {
      mockSetsApi.getPaginatedSets.mockRejectedValue(new Error('API Error'));

      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Sets')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch sets')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    it('should retry fetching data when retry button is clicked', async () => {
      mockSetsApi.getPaginatedSets
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockSetsResponse);

      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('Error Loading Sets')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Base Set')).toBeInTheDocument();
      });
    });

    it('should show empty state when no sets are found', async () => {
      const emptyResponse = {
        sets: [],
        total: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      };

      mockSetsApi.getPaginatedSets.mockResolvedValue(emptyResponse);

      render(<SetSearch />);

      await waitFor(() => {
        expect(screen.getByText('No Sets Found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search criteria to find more sets.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Clear Filters' })).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call getPaginatedSets on component mount', async () => {
      render(<SetSearch />);

      expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
        page: 1,
        limit: 12
      });
    });

    it('should maintain search state during pagination', async () => {
      const multiPageResponse = {
        ...mockSetsResponse,
        total: 25,
        totalPages: 3,
        hasNextPage: true
      };

      mockSetsApi.getPaginatedSets.mockResolvedValue(multiPageResponse);

      render(<SetSearch />);

      // Set search criteria
      const searchInput = screen.getByPlaceholderText('Search sets by name...');
      fireEvent.change(searchInput, { target: { value: 'Base' } });

      const searchButton = screen.getByRole('button', { name: 'Search' });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Next')).toBeInTheDocument();
      });

      // Navigate to next page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockSetsApi.getPaginatedSets).toHaveBeenCalledWith({
          page: 2,
          limit: 12,
          search: 'Base'
        });
      });
    });
  });
});