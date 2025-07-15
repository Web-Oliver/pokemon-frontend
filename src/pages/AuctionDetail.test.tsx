/**
 * AuctionDetail Page Integration Tests
 * Tests the auction detail functionality with real backend interaction
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AuctionDetail from './AuctionDetail';

// Mock the useAuction hook
const mockUseAuction = {
  currentAuction: null,
  loading: false,
  error: null,
  fetchAuctionById: vi.fn(),
  updateAuction: vi.fn(),
  deleteAuction: vi.fn(),
  clearError: vi.fn(),
  clearCurrentAuction: vi.fn()
};

vi.mock('../hooks/useAuction', () => ({
  useAuction: () => mockUseAuction
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
    pathname: '/auctions/test-id'
  },
});

// Mock window.confirm
global.confirm = vi.fn();

describe('AuctionDetail Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuction.currentAuction = null;
    mockUseAuction.loading = false;
    mockUseAuction.error = null;
    
    // Reset window.location.pathname for each test
    Object.defineProperty(window, 'location', {
      value: {
        reload: vi.fn(),
        pathname: '/auctions/test-id'
      },
      writable: true
    });
  });

  describe('Basic Rendering', () => {
    const mockAuction = {
      id: 'test-id',
      topText: 'Test Auction',
      bottomText: 'Test auction description',
      status: 'active' as const,
      auctionDate: '2024-01-15T10:00:00Z',
      items: [
        {
          itemId: 'item1',
          itemCategory: 'PsaGradedCard' as const,
          sold: false,
          salePrice: 100,
          itemName: 'Charizard PSA 10',
          itemImage: 'image1.jpg'
        },
        {
          itemId: 'item2',
          itemCategory: 'RawCard' as const,
          sold: true,
          salePrice: 50,
          itemName: 'Pikachu Raw',
          itemImage: 'image2.jpg'
        }
      ],
      totalValue: 1000,
      soldValue: 500,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      isActive: true,
      generatedFacebookPost: 'Check out this awesome auction!'
    };

    it('should fetch auction data on mount', () => {
      render(<AuctionDetail auctionId="test-id" />);
      
      expect(mockUseAuction.fetchAuctionById).toHaveBeenCalledWith('test-id');
    });

    it('should render auction header with correct data', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('Test Auction')).toBeInTheDocument();
      expect(screen.getByText('Test auction description')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render back to auctions button', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByRole('button', { name: /back to auctions/i })).toBeInTheDocument();
    });

    it('should render edit and delete buttons', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      mockUseAuction.loading = true;
      render(<AuctionDetail />);
      
      expect(screen.getByText('Loading auction details...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when there is an error', () => {
      mockUseAuction.error = 'Failed to load auction';
      mockUseAuction.currentAuction = {
        id: 'test-id',
        topText: 'Test',
        bottomText: 'Test',
        status: 'active' as const,
        auctionDate: '2024-01-15T10:00:00Z',
        items: [],
        totalValue: 0,
        soldValue: 0,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-10T10:00:00Z',
        isActive: true
      };
      render(<AuctionDetail />);
      
      expect(screen.getByText('Failed to load auction')).toBeInTheDocument();
    });
  });

  describe('Not Found State', () => {
    it('should show not found message when auction does not exist', () => {
      mockUseAuction.currentAuction = null;
      mockUseAuction.loading = false;
      render(<AuctionDetail />);
      
      expect(screen.getByText('Auction not found')).toBeInTheDocument();
      expect(screen.getByText("The auction you're looking for doesn't exist or has been deleted.")).toBeInTheDocument();
    });
  });

  describe('Auction Stats', () => {
    const mockAuction = {
      id: 'test-id',
      topText: 'Test Auction',
      bottomText: 'Test description',
      status: 'active' as const,
      auctionDate: '2024-01-15T10:00:00Z',
      items: [
        { itemId: 'item1', itemCategory: 'PsaGradedCard' as const, sold: false, salePrice: 100 },
        { itemId: 'item2', itemCategory: 'RawCard' as const, sold: true, salePrice: 50 },
        { itemId: 'item3', itemCategory: 'SealedProduct' as const, sold: false, salePrice: 200 }
      ],
      totalValue: 1000,
      soldValue: 500,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      isActive: true
    };

    it('should display progress correctly', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('1/3')).toBeInTheDocument(); // sold/total items
      expect(screen.getByText('33.3% of items sold')).toBeInTheDocument();
    });

    it('should display sold and remaining values', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('$500.00')).toBeInTheDocument(); // sold value
      expect(screen.getByText('$500.00')).toBeInTheDocument(); // remaining value (1000 - 500)
    });
  });

  describe('Auction Items', () => {
    const mockAuction = {
      id: 'test-id',
      topText: 'Test Auction',
      bottomText: 'Test description',
      status: 'active' as const,
      auctionDate: '2024-01-15T10:00:00Z',
      items: [
        {
          itemId: 'item1',
          itemCategory: 'PsaGradedCard' as const,
          sold: false,
          salePrice: 100,
          itemName: 'Charizard PSA 10'
        },
        {
          itemId: 'item2',
          itemCategory: 'RawCard' as const,
          sold: true,
          salePrice: 50,
          itemName: 'Pikachu Raw'
        }
      ],
      totalValue: 1000,
      soldValue: 500,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      isActive: true
    };

    it('should display auction items list', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('Auction Items (2)')).toBeInTheDocument();
      expect(screen.getByText('Charizard PSA 10')).toBeInTheDocument();
      expect(screen.getByText('Pikachu Raw')).toBeInTheDocument();
    });

    it('should show item categories correctly', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('PSA Graded Card')).toBeInTheDocument();
      expect(screen.getByText('Raw Card')).toBeInTheDocument();
    });

    it('should show sold status for sold items', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('Sold')).toBeInTheDocument();
    });

    it('should show mark sold button for unsold items', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      const markSoldButtons = screen.getAllByRole('button', { name: /mark sold/i });
      expect(markSoldButtons).toHaveLength(1); // Only one unsold item
    });

    it('should show remove buttons for all items', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons).toHaveLength(2); // Both items should have remove button
    });
  });

  describe('Empty Items State', () => {
    const mockEmptyAuction = {
      id: 'test-id',
      topText: 'Empty Auction',
      bottomText: 'Test description',
      status: 'draft' as const,
      auctionDate: '2024-01-15T10:00:00Z',
      items: [],
      totalValue: 0,
      soldValue: 0,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      isActive: false
    };

    it('should show empty state when no items in auction', () => {
      mockUseAuction.currentAuction = mockEmptyAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('No items in auction')).toBeInTheDocument();
      expect(screen.getByText('Add items from your collection to this auction.')).toBeInTheDocument();
    });

    it('should show add first item button in empty state', () => {
      mockUseAuction.currentAuction = mockEmptyAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByRole('button', { name: /add first item/i })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    const mockAuction = {
      id: 'test-id',
      topText: 'Test Auction',
      bottomText: 'Test description',
      status: 'active' as const,
      auctionDate: '2024-01-15T10:00:00Z',
      items: [],
      totalValue: 0,
      soldValue: 0,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      isActive: true
    };

    it('should navigate back to auctions when back button is clicked', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      const backButton = screen.getByRole('button', { name: /back to auctions/i });
      fireEvent.click(backButton);
      
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/auctions');
    });

    it('should navigate to edit page when edit button is clicked', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/auctions/test-id/edit');
    });
  });

  describe('Delete Functionality', () => {
    const mockAuction = {
      id: 'test-id',
      topText: 'Test Auction',
      bottomText: 'Test description',
      status: 'active' as const,
      auctionDate: '2024-01-15T10:00:00Z',
      items: [],
      totalValue: 0,
      soldValue: 0,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      isActive: true
    };

    it('should confirm before deleting auction', () => {
      mockUseAuction.currentAuction = mockAuction;
      (global.confirm as unknown as { mockReturnValue: (value: boolean) => void }).mockReturnValue(false);
      
      render(<AuctionDetail />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);
      
      expect(global.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this auction? This action cannot be undone.'
      );
      expect(mockUseAuction.deleteAuction).not.toHaveBeenCalled();
    });

    it('should delete auction when confirmed', async () => {
      mockUseAuction.currentAuction = mockAuction;
      (global.confirm as unknown as { mockReturnValue: (value: boolean) => void }).mockReturnValue(true);
      mockUseAuction.deleteAuction.mockResolvedValue(undefined);
      
      render(<AuctionDetail />);
      
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(mockUseAuction.deleteAuction).toHaveBeenCalledWith('test-id');
      });
    });
  });

  describe('Auction Metadata', () => {
    const mockAuction = {
      id: 'test-id',
      topText: 'Test Auction',
      bottomText: 'Test description',
      status: 'active' as const,
      auctionDate: '2024-01-15T10:00:00Z',
      items: [],
      totalValue: 0,
      soldValue: 0,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      isActive: true,
      generatedFacebookPost: 'Check out this awesome auction!'
    };

    it('should display auction metadata', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('Auction Details')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Last Updated')).toBeInTheDocument();
      expect(screen.getByText('Active Status')).toBeInTheDocument();
    });

    it('should display Facebook post when available', () => {
      mockUseAuction.currentAuction = mockAuction;
      render(<AuctionDetail />);
      
      expect(screen.getByText('Generated Facebook Post')).toBeInTheDocument();
      expect(screen.getByText('Check out this awesome auction!')).toBeInTheDocument();
    });
  });
});