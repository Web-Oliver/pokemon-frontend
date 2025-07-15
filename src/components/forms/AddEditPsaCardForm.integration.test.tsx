/**
 * AddEditPsaCardForm Integration Tests with Smart Search
 * Phase 5.1: Smart Search Integration Tests
 * 
 * Testing the hierarchical search functionality:
 * 1. Set search affects Product/Card search filtering
 * 2. Product/Card selection autofills set information
 * 3. No simultaneous suggestions
 * 4. Set-first filtering behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AddEditPsaCardForm from './AddEditPsaCardForm';
import * as cardsApi from '../../api/cardsApi';
import * as setsApi from '../../api/setsApi';
import * as uploadApi from '../../api/uploadApi';

// Mock API modules
vi.mock('../../api/cardsApi');
vi.mock('../../api/setsApi');
vi.mock('../../api/uploadApi');
vi.mock('../../hooks/useCollection');

// Mock data
const mockSets = [
  { _id: '1', setName: 'Base Set', year: 1998, setUrl: '', totalCardsInSet: 102, totalPsaPopulation: 50000 },
  { _id: '2', setName: 'Jungle', year: 1999, setUrl: '', totalCardsInSet: 64, totalPsaPopulation: 30000 },
  { _id: '3', setName: 'Fossil', year: 1999, setUrl: '', totalCardsInSet: 62, totalPsaPopulation: 25000 }
];

const mockCards = [
  {
    _id: '1',
    setId: '1',
    pokemonNumber: '4/102',
    cardName: 'Charizard',
    baseName: 'Charizard',
    variety: 'Holo',
    psaGrades: { psa_1: 10, psa_2: 15, psa_3: 25, psa_4: 40, psa_5: 60, psa_6: 80, psa_7: 120, psa_8: 200, psa_9: 300, psa_10: 150 },
    psaTotalGradedForCard: 1000
  },
  {
    _id: '2',
    setId: '1',
    pokemonNumber: '25/102',
    cardName: 'Pikachu',
    baseName: 'Pikachu',
    variety: '',
    psaGrades: { psa_1: 5, psa_2: 8, psa_3: 12, psa_4: 20, psa_5: 30, psa_6: 40, psa_7: 60, psa_8: 100, psa_9: 150, psa_10: 75 },
    psaTotalGradedForCard: 500
  }
];

const mockProps = {
  onCancel: vi.fn(),
  onSuccess: vi.fn(),
  isEditing: false
};

// Mock useCollection hook
vi.mock('../../hooks/useCollection', () => ({
  useCollection: () => ({
    addPsaCard: vi.fn(),
    updatePsaCard: vi.fn(),
    loading: false
  })
}));

describe('AddEditPsaCardForm Smart Search Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup API mocks
    vi.mocked(setsApi.getSets).mockResolvedValue(mockSets);
    vi.mocked(cardsApi.getCardSuggestions).mockResolvedValue(['Charizard', 'Pikachu']);
    vi.mocked(cardsApi.getBestMatchCard).mockResolvedValue(mockCards[0]);
    vi.mocked(setsApi.getSetById).mockResolvedValue(mockSets[0]);
    vi.mocked(uploadApi.uploadMultipleImages).mockResolvedValue([]);
  });

  it('displays set name suggestions when typing in set field', async () => {
    const user = userEvent.setup();
    render(<AddEditPsaCardForm {...mockProps} />);
    
    const setNameInput = screen.getByLabelText(/set name/i);
    
    // Type in set name field
    await user.type(setNameInput, 'Base');
    
    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('Base Set')).toBeInTheDocument();
    });
    
    // Verify setsApi.getSets was called
    expect(setsApi.getSets).toHaveBeenCalled();
  });

  it('filters card suggestions based on selected set', async () => {
    const user = userEvent.setup();
    render(<AddEditPsaCardForm {...mockProps} />);
    
    const setNameInput = screen.getByLabelText(/set name/i);
    const cardNameInput = screen.getByLabelText(/card name/i);
    
    // First, select a set
    await user.type(setNameInput, 'Base');
    await waitFor(() => {
      expect(screen.getByText('Base Set')).toBeInTheDocument();
    });
    
    // Click on the set suggestion
    await user.click(screen.getByText('Base Set'));
    
    // Now type in card name field
    await user.type(cardNameInput, 'Char');
    
    // Wait for card suggestions
    await waitFor(() => {
      expect(cardsApi.getCardSuggestions).toHaveBeenCalledWith('Char', 10);
    });
  });

  it('autofills set information when card is selected', async () => {
    const user = userEvent.setup();
    render(<AddEditPsaCardForm {...mockProps} />);
    
    const cardNameInput = screen.getByLabelText(/card name/i);
    
    // Type in card name field first
    await user.type(cardNameInput, 'Charizard');
    
    // Wait for suggestions
    await waitFor(() => {
      expect(screen.getByText('Charizard')).toBeInTheDocument();
    });
    
    // Click on card suggestion
    await user.click(screen.getByText('Charizard'));
    
    // Wait for auto-fill to complete
    await waitFor(() => {
      expect(cardsApi.getBestMatchCard).toHaveBeenCalledWith('Charizard');
      expect(setsApi.getSetById).toHaveBeenCalledWith('1');
    });
    
    // Check if set name field was auto-filled
    const setNameInput = screen.getByLabelText(/set name/i) as HTMLInputElement;
    await waitFor(() => {
      expect(setNameInput.value).toBe('Base Set');
    });
  });

  it('autofills card information fields when card is selected', async () => {
    const user = userEvent.setup();
    render(<AddEditPsaCardForm {...mockProps} />);
    
    const cardNameInput = screen.getByLabelText(/card name/i);
    
    // Type and select a card
    await user.type(cardNameInput, 'Charizard');
    await waitFor(() => {
      expect(screen.getByText('Charizard')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Charizard'));
    
    // Wait for auto-fill
    await waitFor(() => {
      const pokemonNumberInput = screen.getByLabelText(/pokémon number/i) as HTMLInputElement;
      const baseNameInput = screen.getByLabelText(/base name/i) as HTMLInputElement;
      const varietyInput = screen.getByLabelText(/variety/i) as HTMLInputElement;
      
      expect(pokemonNumberInput.value).toBe('4/102');
      expect(baseNameInput.value).toBe('Charizard');
      expect(varietyInput.value).toBe('Holo');
    });
  });

  it('only shows suggestions for the active field', async () => {
    const user = userEvent.setup();
    render(<AddEditPsaCardForm {...mockProps} />);
    
    const setNameInput = screen.getByLabelText(/set name/i);
    const cardNameInput = screen.getByLabelText(/card name/i);
    
    // Focus set name and type
    await user.click(setNameInput);
    await user.type(setNameInput, 'Base');
    
    // Wait for set suggestions
    await waitFor(() => {
      expect(screen.getByText('Base Set')).toBeInTheDocument();
    });
    
    // Now focus card name field
    await user.click(cardNameInput);
    
    // Set suggestions should disappear
    await waitFor(() => {
      expect(screen.queryByText('Base Set')).not.toBeInTheDocument();
    });
  });

  it('clears card/product field when set changes', async () => {
    const user = userEvent.setup();
    render(<AddEditPsaCardForm {...mockProps} />);
    
    const setNameInput = screen.getByLabelText(/set name/i);
    const cardNameInput = screen.getByLabelText(/card name/i);
    
    // First, type in card name
    await user.type(cardNameInput, 'Pikachu');
    
    // Then select a different set
    await user.click(setNameInput);
    await user.type(setNameInput, 'Jungle');
    
    await waitFor(() => {
      expect(screen.getByText('Jungle')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Jungle'));
    
    // Card name field should be cleared
    await waitFor(() => {
      const cardNameInputElement = screen.getByLabelText(/card name/i) as HTMLInputElement;
      expect(cardNameInputElement.value).toBe('');
    });
  });

  it('displays filtering indicator when set is selected', async () => {
    const user = userEvent.setup();
    render(<AddEditPsaCardForm {...mockProps} />);
    
    const setNameInput = screen.getByLabelText(/set name/i);
    
    // Select a set
    await user.type(setNameInput, 'Base');
    await waitFor(() => {
      expect(screen.getByText('Base Set')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Base Set'));
    
    // Check for filtering indicator
    await waitFor(() => {
      expect(screen.getByText(/filtering by: base set/i)).toBeInTheDocument();
    });
  });
});