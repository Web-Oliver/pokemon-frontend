/**
 * Auctions Page Integration Tests
 * Tests the auction list functionality with real backend interaction
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Auctions from './Auctions';

// Mock the useAuction hook
const mockUseAuction = {
  auctions: [],
  loading: false,
  error: null,
  fetchAuctions: vi.fn(),
  clearError: vi.fn(),
};

vi.mock('../hooks/useAuction', () => ({
  useAuction: () => mockUseAuction,
}));

// Mock navigation functions
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
  },
});

Object.defineProperty(window, 'location', {
  value: {
    reload: vi.fn(),
  },
});

describe('Auctions Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuction.auctions = [];
    mockUseAuction.loading = false;
    mockUseAuction.error = null;
  });

  describe('Basic Rendering', () => {
    it('should render auction management header', () => {
      render(<Auctions />);

      expect(screen.getByText('Auction Management')).toBeInTheDocument();
      expect(screen.getByText('Manage your Pokemon card auctions')).toBeInTheDocument();
    });

    it('should render create auction button', () => {
      render(<Auctions />);

      expect(screen.getByRole('button', { name: /create auction/i })).toBeInTheDocument();
    });

    it('should render auction stats', () => {
      render(<Auctions />);

      expect(screen.getByText('Active Auctions')).toBeInTheDocument();
      expect(screen.getByText('Draft Auctions')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render filters section', () => {
      render(<Auctions />);

      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      mockUseAuction.loading = true;
      render(<Auctions />);

      expect(screen.getByText('Loading auctions...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when there is an error', () => {
      mockUseAuction.error = 'Failed to load auctions';
      render(<Auctions />);

      expect(screen.getByText('Failed to load auctions')).toBeInTheDocument();
    });

    it('should allow clearing error message', () => {
      mockUseAuction.error = 'Failed to load auctions';
      render(<Auctions />);

      const closeButton = screen.getByRole('button', { name: '' }); // X button
      fireEvent.click(closeButton);

      expect(mockUseAuction.clearError).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no auctions', () => {
      render(<Auctions />);

      expect(screen.getByText('No auctions found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first auction.')).toBeInTheDocument();
    });

    it('should show create first auction button in empty state', () => {
      render(<Auctions />);

      expect(screen.getByRole('button', { name: /create first auction/i })).toBeInTheDocument();
    });
  });

  describe('Auctions List', () => {
    const mockAuctions = [
      {
        id: '1',
        topText: 'Test Auction 1',
        bottomText: 'Test description 1',
        status: 'active' as const,
        auctionDate: '2024-01-15T10:00:00Z',
        items: [
          { itemId: 'item1', itemCategory: 'PsaGradedCard', sold: false },
          { itemId: 'item2', itemCategory: 'RawCard', sold: true },
        ],
        totalValue: 1000,
        soldValue: 500,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
        isActive: true,
      },
      {
        id: '2',
        topText: 'Test Auction 2',
        bottomText: 'Test description 2',
        status: 'draft' as const,
        auctionDate: '2024-01-20T10:00:00Z',
        items: [],
        totalValue: 0,
        soldValue: 0,
        createdAt: '2024-01-05T10:00:00Z',
        updatedAt: '2024-01-08T10:00:00Z',
        isActive: false,
      },
    ];

    it('should display auction list with correct data', () => {
      mockUseAuction.auctions = mockAuctions;
      render(<Auctions />);

      expect(screen.getByText('Test Auction 1')).toBeInTheDocument();
      expect(screen.getByText('Test Auction 2')).toBeInTheDocument();
      expect(screen.getByText('Auctions (2)')).toBeInTheDocument();
    });

    it('should display auction status badges', () => {
      mockUseAuction.auctions = mockAuctions;
      render(<Auctions />);

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should display auction stats correctly', () => {
      mockUseAuction.auctions = mockAuctions;
      render(<Auctions />);

      expect(screen.getByText('2 items')).toBeInTheDocument();
      expect(screen.getByText('0 items')).toBeInTheDocument();
      expect(screen.getByText('Total: $1,000.00')).toBeInTheDocument();
      expect(screen.getByText('Sold: $500.00')).toBeInTheDocument();
    });

    it('should navigate to auction detail when clicking on auction', () => {
      mockUseAuction.auctions = mockAuctions;
      render(<Auctions />);

      const auctionItem = screen.getByText('Test Auction 1').closest('div');
      if (auctionItem) {
        fireEvent.click(auctionItem);
        expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/auctions/1');
      }
    });
  });

  describe('Filtering', () => {
    it('should call fetchAuctions with status filter when filter changes', async () => {
      render(<Auctions />);

      const statusSelect = screen.getByLabelText('Status');
      fireEvent.change(statusSelect, { target: { value: 'active' } });

      await waitFor(() => {
        expect(mockUseAuction.fetchAuctions).toHaveBeenCalledWith({ status: 'active' });
      });
    });

    it('should show clear filters button when filter is applied', () => {
      render(<Auctions />);

      const statusSelect = screen.getByLabelText('Status');
      fireEvent.change(statusSelect, { target: { value: 'active' } });

      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    it('should clear filters when clear button is clicked', () => {
      render(<Auctions />);

      const statusSelect = screen.getByLabelText('Status');
      fireEvent.change(statusSelect, { target: { value: 'active' } });

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearButton);

      expect(mockUseAuction.fetchAuctions).toHaveBeenCalledWith();
    });
  });

  describe('Navigation', () => {
    it('should navigate to create auction page when create button is clicked', () => {
      render(<Auctions />);

      const createButton = screen.getByRole('button', { name: /create auction/i });
      fireEvent.click(createButton);

      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/auctions/create');
    });
  });

  describe('Stats Calculation', () => {
    it('should calculate and display auction statistics correctly', () => {
      const mockAuctionsWithStats = [
        {
          id: '1',
          status: 'active',
          items: [],
          totalValue: 0,
          soldValue: 0,
          auctionDate: '',
          topText: '',
          bottomText: '',
          createdAt: '',
          updatedAt: '',
          isActive: true,
        },
        {
          id: '2',
          status: 'active',
          items: [],
          totalValue: 0,
          soldValue: 0,
          auctionDate: '',
          topText: '',
          bottomText: '',
          createdAt: '',
          updatedAt: '',
          isActive: true,
        },
        {
          id: '3',
          status: 'draft',
          items: [],
          totalValue: 0,
          soldValue: 0,
          auctionDate: '',
          topText: '',
          bottomText: '',
          createdAt: '',
          updatedAt: '',
          isActive: false,
        },
        {
          id: '4',
          status: 'sold',
          items: [],
          totalValue: 0,
          soldValue: 0,
          auctionDate: '',
          topText: '',
          bottomText: '',
          createdAt: '',
          updatedAt: '',
          isActive: false,
        },
      ];

      mockUseAuction.auctions = mockAuctionsWithStats;
      render(<Auctions />);

      // Check active auctions count
      const activeSection = screen.getByText('Active Auctions').closest('div')?.parentElement;
      expect(activeSection).toHaveTextContent('2');

      // Check draft auctions count
      const draftSection = screen.getByText('Draft Auctions').closest('div')?.parentElement;
      expect(draftSection).toHaveTextContent('1');

      // Check completed auctions count
      const completedSection = screen.getByText('Completed').closest('div')?.parentElement;
      expect(completedSection).toHaveTextContent('1');
    });
  });
});
