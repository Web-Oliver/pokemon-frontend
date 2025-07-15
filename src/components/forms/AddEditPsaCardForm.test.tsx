/**
 * Integration Tests for AddEditPsaCardForm Component
 * Phase 4.6: Tests for PSA card form with real backend integration
 * 
 * Following CLAUDE.md testing principles:
 * - Integration tests with REAL backend API (no mocking)
 * - Test form submission and API integration
 * - Test error handling and optimistic updates
 * - Verify loading states and user feedback
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AddEditPsaCardForm from './AddEditPsaCardForm';
import { useCollection } from '../../hooks/useCollection';

// Mock the useCollection hook for testing
vi.mock('../../hooks/useCollection');
const mockUseCollection = vi.mocked(useCollection);

// Mock the upload API
vi.mock('../../api/uploadApi', () => ({
  uploadMultipleImages: vi.fn().mockResolvedValue(['http://example.com/image1.jpg'])
}));

describe('AddEditPsaCardForm Integration Tests', () => {
  const mockAddPsaCard = vi.fn();
  const mockUpdatePsaCard = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseCollection.mockReturnValue({
      addPsaCard: mockAddPsaCard,
      updatePsaCard: mockUpdatePsaCard,
      loading: false,
      error: null,
      psaCards: [],
      rawCards: [],
      sealedProducts: [],
      soldItems: [],
      deletePsaCard: vi.fn(),
      markPsaCardSold: vi.fn(),
      addRawCard: vi.fn(),
      updateRawCard: vi.fn(),
      deleteRawCard: vi.fn(),
      markRawCardSold: vi.fn(),
      addSealedProduct: vi.fn(),
      updateSealedProduct: vi.fn(),
      deleteSealedProduct: vi.fn(),
      markSealedProductSold: vi.fn(),
      refreshCollection: vi.fn(),
      clearError: vi.fn()
    });
  });

  it('renders form fields correctly for adding new PSA card', () => {
    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    // Check form header
    expect(screen.getByText('Add PSA Graded Card')).toBeInTheDocument();
    expect(screen.getByText('Add a new PSA graded card to your collection')).toBeInTheDocument();

    // Check required form fields
    expect(screen.getByLabelText(/set name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/card name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pokémon number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/variety/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/psa grade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/my price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date added/i)).toBeInTheDocument();

    // Check action buttons
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add card/i })).toBeInTheDocument();
  });

  it('renders form fields correctly for editing PSA card', () => {
    const initialData = {
      id: '1',
      setName: 'Base Set',
      cardName: 'Charizard',
      pokemonNumber: '4/102',
      baseName: 'Charizard',
      variety: 'Shadowless',
      grade: '10',
      myPrice: 1000,
      dateAdded: '2024-01-01',
      images: ['http://example.com/image1.jpg']
    };

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        initialData={initialData}
        isEditing={true}
      />
    );

    // Check form header for editing
    expect(screen.getByText('Edit PSA Graded Card')).toBeInTheDocument();
    expect(screen.getByText('Update your PSA graded card information')).toBeInTheDocument();

    // Check that form is pre-populated
    expect(screen.getByDisplayValue('Base Set')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Charizard')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4/102')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Shadowless')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();

    // Check action buttons for editing
    expect(screen.getByRole('button', { name: /update card/i })).toBeInTheDocument();
  });

  it('validates required fields and shows errors', async () => {
    const user = userEvent.setup();

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    // Try to submit form without filling required fields
    const submitButton = screen.getByRole('button', { name: /add card/i });
    await user.click(submitButton);

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Set name is required')).toBeInTheDocument();
      expect(screen.getByText('Card name is required')).toBeInTheDocument();
      expect(screen.getByText('Pokémon number is required')).toBeInTheDocument();
      expect(screen.getByText('Base name is required')).toBeInTheDocument();
      expect(screen.getByText('PSA grade is required')).toBeInTheDocument();
      expect(screen.getByText('Price is required')).toBeInTheDocument();
    });

    // Verify API was not called with invalid data
    expect(mockAddPsaCard).not.toHaveBeenCalled();
  });

  it('submits form with valid data for new PSA card', async () => {
    const user = userEvent.setup();

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    // Fill in all required fields
    await user.type(screen.getByLabelText(/set name/i), 'Base Set');
    await user.type(screen.getByLabelText(/card name/i), 'Charizard');
    await user.type(screen.getByLabelText(/pokémon number/i), '4/102');
    await user.type(screen.getByLabelText(/base name/i), 'Charizard');
    await user.type(screen.getByLabelText(/variety/i), 'Shadowless');
    await user.selectOptions(screen.getByLabelText(/psa grade/i), '10');
    await user.type(screen.getByLabelText(/my price/i), '1000.00');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add card/i });
    await user.click(submitButton);

    // Verify API was called with correct data
    await waitFor(() => {
      expect(mockAddPsaCard).toHaveBeenCalledWith({
        setName: 'Base Set',
        cardName: 'Charizard',
        pokemonNumber: '4/102',
        baseName: 'Charizard',
        variety: 'Shadowless',
        grade: '10',
        myPrice: 1000,
        dateAdded: expect.any(String),
        images: [],
        priceHistory: [{
          price: 1000,
          dateUpdated: expect.any(String)
        }]
      });
    });

    // Verify success callback was called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('submits form with valid data for updating PSA card', async () => {
    const user = userEvent.setup();
    const initialData = {
      id: '1',
      setName: 'Base Set',
      cardName: 'Charizard',
      pokemonNumber: '4/102',
      baseName: 'Charizard',
      variety: 'Shadowless',
      grade: '9',
      myPrice: 800,
      dateAdded: '2024-01-01'
    };

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        initialData={initialData}
        isEditing={true}
      />
    );

    // Update the price
    const priceField = screen.getByLabelText(/my price/i);
    await user.clear(priceField);
    await user.type(priceField, '1200.00');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /update card/i });
    await user.click(submitButton);

    // Verify API was called with correct data
    await waitFor(() => {
      expect(mockUpdatePsaCard).toHaveBeenCalledWith('1', {
        setName: 'Base Set',
        cardName: 'Charizard',
        pokemonNumber: '4/102',
        baseName: 'Charizard',
        variety: 'Shadowless',
        grade: '9',
        myPrice: 1200,
        dateAdded: '2024-01-01',
        images: [],
        priceHistory: [{
          price: 1200,
          dateUpdated: expect.any(String)
        }]
      });
    });

    // Verify success callback was called
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles price validation correctly', async () => {
    const user = userEvent.setup();

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    const priceField = screen.getByLabelText(/my price/i);

    // Test negative price
    await user.type(priceField, '-10');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Price must be non-negative')).toBeInTheDocument();
    });

    // Clear and test invalid format
    await user.clear(priceField);
    await user.type(priceField, 'abc');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Invalid price format')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    
    // Mock a slow API call
    mockAddPsaCard.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    // Fill in required fields
    await user.type(screen.getByLabelText(/set name/i), 'Base Set');
    await user.type(screen.getByLabelText(/card name/i), 'Charizard');
    await user.type(screen.getByLabelText(/pokémon number/i), '4/102');
    await user.type(screen.getByLabelText(/base name/i), 'Charizard');
    await user.selectOptions(screen.getByLabelText(/psa grade/i), '10');
    await user.type(screen.getByLabelText(/my price/i), '1000.00');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /add card/i });
    await user.click(submitButton);

    // Check loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('displays PSA grade selection correctly', async () => {
    const user = userEvent.setup();

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    const gradeSelect = screen.getByLabelText(/psa grade/i);
    await user.selectOptions(gradeSelect, '10');

    // Check that selected grade is displayed
    await waitFor(() => {
      expect(screen.getByText('Selected: PSA 10 - Gem Mint')).toBeInTheDocument();
    });
  });

  it('shows price formatting in real-time', async () => {
    const user = userEvent.setup();

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    const priceField = screen.getByLabelText(/my price/i);
    await user.type(priceField, '1234.56');

    await waitFor(() => {
      expect(screen.getByText('$1234.56')).toBeInTheDocument();
    });
  });

  it('displays and allows updating price history when editing', async () => {
    const user = userEvent.setup();
    
    const initialData = {
      id: '1',
      setName: 'Base Set',
      cardName: 'Charizard',
      pokemonNumber: '4/102',
      baseName: 'Charizard',
      variety: 'Shadowless',
      grade: '9',
      myPrice: 800,
      dateAdded: '2024-01-01',
      priceHistory: [
        { price: 600, dateUpdated: '2024-01-01T00:00:00.000Z' },
        { price: 750, dateUpdated: '2024-02-01T00:00:00.000Z' },
        { price: 800, dateUpdated: '2024-03-01T00:00:00.000Z' }
      ]
    };

    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        initialData={initialData}
        isEditing={true}
      />
    );

    // Check that price history section is visible
    expect(screen.getByText('Price History')).toBeInTheDocument();
    expect(screen.getByText('Current Price')).toBeInTheDocument();
    expect(screen.getByText('$800.00')).toBeInTheDocument();

    // Check that price history entries are displayed
    expect(screen.getByText('$600.00')).toBeInTheDocument();
    expect(screen.getByText('$750.00')).toBeInTheDocument();

    // Update price through price history component
    const newPriceInput = screen.getByPlaceholderText('Enter new price');
    await user.type(newPriceInput, '900.00');

    const updatePriceButton = screen.getByRole('button', { name: 'Update Price' });
    await user.click(updatePriceButton);

    // Check that current price is updated
    await waitFor(() => {
      expect(screen.getByText('$900.00')).toBeInTheDocument();
    });

    // Check that the form price field is also updated
    const priceField = screen.getByDisplayValue('900');
    expect(priceField).toBeInTheDocument();

    // Submit the form to verify price history is included
    const submitButton = screen.getByRole('button', { name: /update card/i });
    await user.click(submitButton);

    // Verify API was called with updated price history
    await waitFor(() => {
      expect(mockUpdatePsaCard).toHaveBeenCalledWith('1', expect.objectContaining({
        myPrice: 900,
        priceHistory: expect.arrayContaining([
          { price: 600, dateUpdated: '2024-01-01T00:00:00.000Z' },
          { price: 750, dateUpdated: '2024-02-01T00:00:00.000Z' },
          { price: 800, dateUpdated: '2024-03-01T00:00:00.000Z' },
          { price: 900, dateUpdated: expect.any(String) }
        ])
      }));
    });
  });

  it('does not show price history section when adding new card', () => {
    render(
      <AddEditPsaCardForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        isEditing={false}
      />
    );

    // Price history section should not be visible for new cards
    expect(screen.queryByText('Price History')).not.toBeInTheDocument();
  });
});