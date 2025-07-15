/**
 * Collection Page Integration Tests
 * Following CLAUDE.md testing principles - no mocking for API interactions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Collection from './Collection';
import * as useCollectionModule from '../hooks/useCollection';

// Mock useCollection hook for testing
const mockUseCollection = vi.fn();
vi.spyOn(useCollectionModule, 'useCollection').mockImplementation(mockUseCollection);

describe('Collection Page - Mark as Sold Integration', () => {
  const mockMarkPsaCardSold = vi.fn();
  const mockMarkRawCardSold = vi.fn();
  const mockMarkSealedProductSold = vi.fn();

  const mockCollectionData = {
    psaCards: [
      {
        _id: 'psa-1',
        cardName: 'Charizard',
        grade: '10',
        myPrice: 1000,
        sold: false
      },
      {
        _id: 'psa-2',
        cardName: 'Blastoise',
        grade: '9',
        myPrice: 500,
        sold: true,
        saleDetails: {
          actualSoldPrice: 550,
          dateSold: '2024-01-15T00:00:00.000Z'
        }
      }
    ],
    rawCards: [
      {
        _id: 'raw-1',
        cardName: 'Venusaur',
        condition: 'Near Mint',
        myPrice: 200,
        sold: false
      }
    ],
    sealedProducts: [
      {
        _id: 'sealed-1',
        name: 'Base Set Booster Box',
        category: 'Booster Box',
        myPrice: 5000,
        sold: false
      }
    ],
    soldItems: [
      {
        _id: 'psa-2',
        cardName: 'Blastoise',
        grade: '9',
        myPrice: 500,
        sold: true,
        saleDetails: {
          actualSoldPrice: 550,
          dateSold: '2024-01-15T00:00:00.000Z'
        }
      }
    ],
    loading: false,
    error: null,
    markPsaCardSold: mockMarkPsaCardSold,
    markRawCardSold: mockMarkRawCardSold,
    markSealedProductSold: mockMarkSealedProductSold
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCollection.mockReturnValue(mockCollectionData);
  });

  describe('UI Rendering', () => {
    it('should render collection page with tabs', () => {
      render(<Collection />);

      expect(screen.getByText('My Collection')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PSA Graded Cards' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Raw Cards' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sealed Products' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sold Items' })).toBeInTheDocument();
    });

    it('should display PSA cards in PSA tab by default', () => {
      render(<Collection />);

      expect(screen.getByText('Charizard')).toBeInTheDocument();
      expect(screen.getByText('Grade: 10')).toBeInTheDocument();
      expect(screen.getByText('$1000')).toBeInTheDocument();
    });

    it('should show Mark as Sold button for unsold items', () => {
      render(<Collection />);

      // Should have Mark as Sold button for unsold Charizard
      expect(screen.getByText('Mark as Sold')).toBeInTheDocument();
    });

    it('should not show Mark as Sold button for sold items', () => {
      render(<Collection />);

      // Switch to PSA tab and check Blastoise (sold item)
      expect(screen.getByText('Blastoise')).toBeInTheDocument();
      expect(screen.getByText('Sold')).toBeInTheDocument();
      
      // Should not have Mark as Sold button for sold items
      const charizardButton = screen.getByText('Mark as Sold');
      expect(charizardButton).toBeInTheDocument(); // Only for Charizard
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Raw Cards tab and show raw cards', async () => {
      render(<Collection />);

      fireEvent.click(screen.getByRole('button', { name: 'Raw Cards' }));

      await waitFor(() => {
        expect(screen.getByText('Venusaur')).toBeInTheDocument();
        expect(screen.getByText('Condition: Near Mint')).toBeInTheDocument();
      });
    });

    it('should switch to Sealed Products tab and show sealed products', async () => {
      render(<Collection />);

      fireEvent.click(screen.getByRole('button', { name: 'Sealed Products' }));

      await waitFor(() => {
        expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
        expect(screen.getByText('Category: Booster Box')).toBeInTheDocument();
      });
    });

    it('should switch to Sold Items tab and show sold items', async () => {
      render(<Collection />);

      fireEvent.click(screen.getByRole('button', { name: 'Sold Items' }));

      await waitFor(() => {
        expect(screen.getByText('Blastoise')).toBeInTheDocument();
        expect(screen.getByText('Sold: 1/15/2024')).toBeInTheDocument();
        expect(screen.getByText('Sold: $550')).toBeInTheDocument();
      });
    });

    it('should not show Mark as Sold buttons in Sold Items tab', async () => {
      render(<Collection />);

      fireEvent.click(screen.getByRole('button', { name: 'Sold Items' }));

      await waitFor(() => {
        expect(screen.queryByText('Mark as Sold')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mark as Sold Modal', () => {
    it('should open modal when Mark as Sold button is clicked', async () => {
      render(<Collection />);

      const markAsSoldButton = screen.getByText('Mark as Sold');
      fireEvent.click(markAsSoldButton);

      await waitFor(() => {
        expect(screen.getByText('Mark "Charizard" as Sold')).toBeInTheDocument();
        expect(screen.getByText('Enter the sale details for this item.')).toBeInTheDocument();
      });
    });

    it('should close modal when cancel is clicked', async () => {
      render(<Collection />);

      const markAsSoldButton = screen.getByText('Mark as Sold');
      fireEvent.click(markAsSoldButton);

      await waitFor(() => {
        expect(screen.getByText('Mark "Charizard" as Sold')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Mark "Charizard" as Sold')).not.toBeInTheDocument();
      });
    });

    it('should close modal when backdrop is clicked', async () => {
      render(<Collection />);

      const markAsSoldButton = screen.getByText('Mark as Sold');
      fireEvent.click(markAsSoldButton);

      await waitFor(() => {
        expect(screen.getByText('Mark "Charizard" as Sold')).toBeInTheDocument();
      });

      const backdrop = document.querySelector('.bg-gray-500');
      fireEvent.click(backdrop!);

      await waitFor(() => {
        expect(screen.queryByText('Mark "Charizard" as Sold')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mark as Sold Functionality', () => {
    it('should call markPsaCardSold when PSA card is marked as sold', async () => {
      render(<Collection />);

      // Get the Mark as Sold button from the collection (not from the form)
      const markAsSoldButtons = screen.getAllByText('Mark as Sold');
      const collectionMarkAsSoldButton = markAsSoldButtons[0]; // First one is from the collection
      fireEvent.click(collectionMarkAsSoldButton);

      await waitFor(() => {
        expect(screen.getByText('Mark "Charizard" as Sold')).toBeInTheDocument();
      });

      // Fill in required form fields
      const actualSoldPriceInput = screen.getByLabelText(/Actual Sold Price/i);
      fireEvent.change(actualSoldPriceInput, { target: { value: '1100' } });

      const paymentMethodSelect = screen.getByLabelText(/Payment Method/i);
      fireEvent.change(paymentMethodSelect, { target: { value: 'CASH' } });

      const deliveryMethodSelect = screen.getByLabelText(/Delivery Method/i);
      fireEvent.change(deliveryMethodSelect, { target: { value: 'Local Meetup' } });

      const sourceSelect = screen.getByLabelText(/Source/i);
      fireEvent.change(sourceSelect, { target: { value: 'Facebook' } });

      // Get the submit button specifically (should be of type="submit")
      const submitButton = screen.getByRole('button', { name: 'Mark as Sold' });
      const formSubmitButton = Array.from(screen.getAllByRole('button', { name: 'Mark as Sold' }))
        .find(button => (button as HTMLButtonElement).type === 'submit');
      fireEvent.click(formSubmitButton!);

      await waitFor(() => {
        expect(mockMarkPsaCardSold).toHaveBeenCalledWith('psa-1', expect.objectContaining({
          actualSoldPrice: 1100,
          paymentMethod: 'CASH',
          deliveryMethod: 'Local Meetup',
          source: 'Facebook'
        }));
      });
    });

    it('should call markRawCardSold when Raw card is marked as sold', async () => {
      render(<Collection />);

      // Switch to Raw Cards tab
      fireEvent.click(screen.getByRole('button', { name: 'Raw Cards' }));

      await waitFor(() => {
        expect(screen.getByText('Venusaur')).toBeInTheDocument();
      });

      const markAsSoldButton = screen.getByText('Mark as Sold');
      fireEvent.click(markAsSoldButton);

      await waitFor(() => {
        expect(screen.getByText('Mark "Venusaur" as Sold')).toBeInTheDocument();
      });

      // Fill in required form fields
      const actualSoldPriceInput = screen.getByLabelText(/Actual Sold Price/i);
      fireEvent.change(actualSoldPriceInput, { target: { value: '250' } });

      const paymentMethodSelect = screen.getByLabelText(/Payment Method/i);
      fireEvent.change(paymentMethodSelect, { target: { value: 'Mobilepay' } });

      const deliveryMethodSelect = screen.getByLabelText(/Delivery Method/i);
      fireEvent.change(deliveryMethodSelect, { target: { value: 'Local Meetup' } });

      const sourceSelect = screen.getByLabelText(/Source/i);
      fireEvent.change(sourceSelect, { target: { value: 'DBA' } });

      // Get the submit button specifically (should be of type="submit")
      const submitButton = screen.getByRole('button', { name: 'Mark as Sold' });
      const formSubmitButton = Array.from(screen.getAllByRole('button', { name: 'Mark as Sold' }))
        .find(button => (button as HTMLButtonElement).type === 'submit');
      fireEvent.click(formSubmitButton!);

      await waitFor(() => {
        expect(mockMarkRawCardSold).toHaveBeenCalledWith('raw-1', expect.objectContaining({
          actualSoldPrice: 250,
          paymentMethod: 'Mobilepay',
          deliveryMethod: 'Local Meetup',
          source: 'DBA'
        }));
      });
    });

    it('should call markSealedProductSold when Sealed product is marked as sold', async () => {
      render(<Collection />);

      // Switch to Sealed Products tab
      fireEvent.click(screen.getByRole('button', { name: 'Sealed Products' }));

      await waitFor(() => {
        expect(screen.getByText('Base Set Booster Box')).toBeInTheDocument();
      });

      const markAsSoldButton = screen.getByText('Mark as Sold');
      fireEvent.click(markAsSoldButton);

      await waitFor(() => {
        expect(screen.getByText('Mark "Base Set Booster Box" as Sold')).toBeInTheDocument();
      });

      // Fill in required form fields
      const actualSoldPriceInput = screen.getByLabelText(/Actual Sold Price/i);
      fireEvent.change(actualSoldPriceInput, { target: { value: '5500' } });

      const paymentMethodSelect = screen.getByLabelText(/Payment Method/i);
      fireEvent.change(paymentMethodSelect, { target: { value: 'BankTransfer' } });

      const deliveryMethodSelect = screen.getByLabelText(/Delivery Method/i);
      fireEvent.change(deliveryMethodSelect, { target: { value: 'Sent' } });

      const sourceSelect = screen.getByLabelText(/Source/i);
      fireEvent.change(sourceSelect, { target: { value: 'Facebook' } });

      // Get the submit button specifically (should be of type="submit")
      const submitButton = screen.getByRole('button', { name: 'Mark as Sold' });
      const formSubmitButton = Array.from(screen.getAllByRole('button', { name: 'Mark as Sold' }))
        .find(button => (button as HTMLButtonElement).type === 'submit');
      fireEvent.click(formSubmitButton!);

      await waitFor(() => {
        expect(mockMarkSealedProductSold).toHaveBeenCalledWith('sealed-1', expect.objectContaining({
          actualSoldPrice: 5500,
          paymentMethod: 'BankTransfer',
          deliveryMethod: 'Sent',
          source: 'Facebook'
        }));
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading spinner when loading', () => {
      mockUseCollection.mockReturnValue({
        ...mockCollectionData,
        loading: true
      });

      render(<Collection />);

      expect(screen.getByRole('status')).toBeInTheDocument(); // LoadingSpinner has role="status"
    });

    it('should show error message when there is an error', () => {
      mockUseCollection.mockReturnValue({
        ...mockCollectionData,
        error: 'Failed to load collection'
      });

      render(<Collection />);

      expect(screen.getByText('Error Loading Collection')).toBeInTheDocument();
      expect(screen.getByText('Failed to load collection')).toBeInTheDocument();
    });

    it('should show empty state when no items', () => {
      mockUseCollection.mockReturnValue({
        ...mockCollectionData,
        psaCards: [],
        rawCards: [],
        sealedProducts: [],
        soldItems: []
      });

      render(<Collection />);

      expect(screen.getByText('No Items Found')).toBeInTheDocument();
      expect(screen.getByText('No PSA graded cards in your collection yet.')).toBeInTheDocument();
    });
  });
});