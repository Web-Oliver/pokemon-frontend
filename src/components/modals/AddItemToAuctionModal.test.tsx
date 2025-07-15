/**
 * AddItemToAuctionModal Integration Tests
 * Phase 9.2 - Test suite for Add Item to Auction Modal functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import AddItemToAuctionModal from './AddItemToAuctionModal';
import { useCollection } from '../../hooks/useCollection';

// Mock the useCollection hook
vi.mock('../../hooks/useCollection');

// Mock collection data
const mockPsaCards = [
  {
    id: 'psa1',
    cardName: 'Charizard',
    grade: '10',
    myPrice: 500,
    sold: false,
    setName: 'Base Set',
    images: ['image1.jpg'],
    dateAdded: '2024-01-01',
  },
  {
    id: 'psa2',
    cardName: 'Blastoise',
    grade: '9',
    myPrice: 300,
    sold: false,
    setName: 'Base Set',
    images: ['image2.jpg'],
    dateAdded: '2024-01-02',
  },
];

const mockRawCards = [
  {
    id: 'raw1',
    cardName: 'Venusaur',
    condition: 'Near Mint',
    myPrice: 150,
    sold: false,
    setName: 'Base Set',
    images: ['image3.jpg'],
    dateAdded: '2024-01-03',
  },
];

const mockSealedProducts = [
  {
    id: 'sealed1',
    name: 'Booster Box',
    myPrice: 800,
    sold: false,
    setName: 'Base Set',
    images: ['image4.jpg'],
    dateAdded: '2024-01-04',
  },
];

describe('AddItemToAuctionModal Integration Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnAddItems = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useCollection hook implementation
    (useCollection as ReturnType<typeof vi.fn>).mockReturnValue({
      psaCards: mockPsaCards,
      rawCards: mockRawCards,
      sealedProducts: mockSealedProducts,
      loading: false,
      error: null,
    });
  });

  describe('Modal Rendering', () => {
    test('should render modal when open', () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      expect(screen.getByText('Add Items to Auction')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search items by name or set...')).toBeInTheDocument();
      expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    });

    test('should not render modal when closed', () => {
      render(
        <AddItemToAuctionModal isOpen={false} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      expect(screen.queryByText('Add Items to Auction')).not.toBeInTheDocument();
    });

    test('should display collection items', () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      expect(screen.getByText('Charizard - Grade 10')).toBeInTheDocument();
      expect(screen.getByText('Blastoise - Grade 9')).toBeInTheDocument();
      expect(screen.getByText('Venusaur - Near Mint')).toBeInTheDocument();
      expect(screen.getByText('Booster Box - Base Set')).toBeInTheDocument();
    });
  });

  describe('Search and Filter Functionality', () => {
    test('should filter items by search term', async () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      const searchInput = screen.getByPlaceholderText('Search items by name or set...');
      fireEvent.change(searchInput, { target: { value: 'Charizard' } });

      await waitFor(() => {
        expect(screen.getByText('Charizard - Grade 10')).toBeInTheDocument();
        expect(screen.queryByText('Blastoise - Grade 9')).not.toBeInTheDocument();
      });
    });

    test('should filter items by category', async () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      const categorySelect = screen.getByDisplayValue('All Categories');
      fireEvent.change(categorySelect, { target: { value: 'PsaGradedCard' } });

      await waitFor(() => {
        expect(screen.getByText('Charizard - Grade 10')).toBeInTheDocument();
        expect(screen.getByText('Blastoise - Grade 9')).toBeInTheDocument();
        expect(screen.queryByText('Venusaur - Near Mint')).not.toBeInTheDocument();
      });
    });

    test('should display no items message when no results found', async () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      const searchInput = screen.getByPlaceholderText('Search items by name or set...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No items found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
      });
    });
  });

  describe('Item Selection', () => {
    test('should select and deselect items', async () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      const charizardItem = screen.getByText('Charizard - Grade 10').closest('div');
      fireEvent.click(charizardItem!);

      await waitFor(() => {
        expect(screen.getByText('1 of 4 items selected')).toBeInTheDocument();
      });

      // Deselect
      fireEvent.click(charizardItem!);

      await waitFor(() => {
        expect(screen.getByText('0 of 4 items selected')).toBeInTheDocument();
      });
    });

    test('should select all items', async () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);

      await waitFor(() => {
        expect(screen.getByText('4 of 4 items selected')).toBeInTheDocument();
        expect(screen.getByText('Deselect All')).toBeInTheDocument();
      });
    });

    test('should update add button text based on selection', async () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      const charizardItem = screen.getByText('Charizard - Grade 10').closest('div');
      fireEvent.click(charizardItem!);

      await waitFor(() => {
        expect(screen.getByText('Add 1 Item')).toBeInTheDocument();
      });

      const blastoiseItem = screen.getByText('Blastoise - Grade 9').closest('div');
      fireEvent.click(blastoiseItem!);

      await waitFor(() => {
        expect(screen.getByText('Add 2 Items')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('should call onAddItems with selected items', async () => {
      mockOnAddItems.mockResolvedValue(undefined);

      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      // Select items
      const charizardItem = screen.getByText('Charizard - Grade 10').closest('div');
      fireEvent.click(charizardItem!);

      const blastoiseItem = screen.getByText('Blastoise - Grade 9').closest('div');
      fireEvent.click(blastoiseItem!);

      // Submit
      const addButton = screen.getByText('Add 2 Items');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnAddItems).toHaveBeenCalledWith([
          { itemId: 'psa1', itemCategory: 'PsaGradedCard' },
          { itemId: 'psa2', itemCategory: 'PsaGradedCard' },
        ]);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('should not submit when no items selected', () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      const addButton = screen.getByText('Add 0 Items');
      expect(addButton).toBeDisabled();
    });

    test('should show loading state during submission', async () => {
      // eslint-disable-next-line no-unused-vars
      let resolvePromise: (value: unknown) => void;
      const submissionPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockOnAddItems.mockReturnValue(submissionPromise);

      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      // Select item
      const charizardItem = screen.getByText('Charizard - Grade 10').closest('div');
      fireEvent.click(charizardItem!);

      // Submit
      const addButton = screen.getByText('Add 1 Item');
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Adding...')).toBeInTheDocument();
      });

      // Resolve the promise
      resolvePromise!(undefined);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Loading and Error States', () => {
    test('should display loading spinner when loading', () => {
      (useCollection as ReturnType<typeof vi.fn>).mockReturnValue({
        psaCards: [],
        rawCards: [],
        sealedProducts: [],
        loading: true,
        error: null,
      });

      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      expect(screen.getByText('Loading collection items...')).toBeInTheDocument();
    });

    test('should display error message when error occurs', () => {
      (useCollection as ReturnType<typeof vi.fn>).mockReturnValue({
        psaCards: [],
        rawCards: [],
        sealedProducts: [],
        loading: false,
        error: 'Failed to load collection',
      });

      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      expect(screen.getByText('Failed to load collection')).toBeInTheDocument();
    });

    test('should display empty state when no collection items', () => {
      (useCollection as ReturnType<typeof vi.fn>).mockReturnValue({
        psaCards: [],
        rawCards: [],
        sealedProducts: [],
        loading: false,
        error: null,
      });

      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('No unsold items available in your collection.')).toBeInTheDocument();
    });
  });

  describe('Modal Interaction', () => {
    test('should close modal when cancel button clicked', () => {
      render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test('should reset state when modal closes', async () => {
      const { rerender } = render(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      // Select an item and search
      const charizardItem = screen.getByText('Charizard - Grade 10').closest('div');
      fireEvent.click(charizardItem!);

      const searchInput = screen.getByPlaceholderText('Search items by name or set...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Close and reopen modal
      rerender(
        <AddItemToAuctionModal isOpen={false} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      rerender(
        <AddItemToAuctionModal isOpen={true} onClose={mockOnClose} onAddItems={mockOnAddItems} />
      );

      // Check that state is reset
      expect(screen.getByText('0 of 4 items selected')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search items by name or set...')).toHaveValue('');
    });
  });
});
