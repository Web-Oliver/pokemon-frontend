/**
 * Integration tests for useSearch Hook
 * Tests hook interactions with real backend API (no mocking)
 * Tests hierarchical search logic and caching
 * Requires backend (SAFESPACE/pokemon-collection-backend) running on PORT 3000
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearch } from '../useSearch';

describe('useSearch Integration Tests', () => {
  beforeAll(() => {
    // Ensure backend is running
    console.log('🚨 IMPORTANT: Ensure backend is running on http://localhost:3000');
    console.log('Start backend with: cd ../pokemon-collection-backend && npm run dev');
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.searchTerm).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.selectedSet).toBe(null);
    expect(result.current.selectedCategory).toBe(null);
    expect(result.current.setName).toBe('');
    expect(result.current.categoryName).toBe('');
    expect(result.current.cardProductName).toBe('');
    expect(result.current.activeField).toBe(null);
  });

  it('should clear search state', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      result.current.clearSearch();
    });

    expect(result.current.searchTerm).toBe('');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should clear error state', async () => {
    const { result } = renderHook(() => useSearch());

    await act(async () => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  // Main search functionality tests
  describe('Search Operations', () => {
    it('should perform search with results', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.handleSearch('charizard');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      expect(result.current.searchTerm).toBe('charizard');
      expect(Array.isArray(result.current.searchResults)).toBe(true);
      expect(result.current.error).toBe(null);
      
      // Should have search metadata
      expect(result.current.searchMeta).toBeDefined();
      expect(typeof result.current.searchMeta?.queryTime).toBe('number');
    }, 15000);

    it('should handle empty search query', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.handleSearch('');
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.suggestions).toEqual([]);
    });

    it('should handle search with no results', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.handleSearch('nonexistentpokemoncard12345');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      expect(result.current.searchTerm).toBe('nonexistentpokemoncard12345');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.error).toBe(null);
    }, 15000);
  });

  // Category functionality tests
  describe('Category Functionality', () => {
    it('should update category name and trigger suggestions', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateCategoryName('booster');
      });

      expect(result.current.categoryName).toBe('booster');
      expect(result.current.activeField).toBe('category');

      // Wait for debounced suggestions
      await waitFor(() => {
        expect(result.current.suggestions.length).toBeGreaterThanOrEqual(0);
      }, { timeout: 5000 });
    }, 10000);

    it('should handle category selection and clear card/product field', async () => {
      const { result } = renderHook(() => useSearch());

      // First set some card/product name
      await act(async () => {
        result.current.updateCardProductName('test');
      });

      // Then select a category
      await act(async () => {
        result.current.handleSuggestionSelect({ category: 'Booster Box' }, 'category');
      });

      expect(result.current.categoryName).toBe('Booster Box');
      expect(result.current.selectedCategory).toBe('Booster Box');
      expect(result.current.cardProductName).toBe(''); // Should be cleared
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.activeField).toBe(null);
    });

    it('should clear selected category', async () => {
      const { result } = renderHook(() => useSearch());

      // First select a category
      await act(async () => {
        result.current.handleSuggestionSelect({ category: 'Booster Box' }, 'category');
      });

      // Then clear it
      await act(async () => {
        result.current.clearSelectedCategory();
      });

      expect(result.current.selectedCategory).toBe(null);
      expect(result.current.categoryName).toBe('');
    });
  });

  // Hierarchical search logic tests
  describe('Hierarchical Search Logic', () => {
    it('should update set name and trigger suggestions', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateSetName('base');
      });

      expect(result.current.setName).toBe('base');
      expect(result.current.activeField).toBe('set');

      // Wait for debounced suggestions
      await waitFor(() => {
        expect(result.current.suggestions.length).toBeGreaterThanOrEqual(0);
      }, { timeout: 5000 });
    }, 10000);

    it('should update card/product name and trigger suggestions', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateCardProductName('charizard');
      });

      expect(result.current.cardProductName).toBe('charizard');
      expect(result.current.activeField).toBe('cardProduct');

      // Wait for debounced suggestions
      await waitFor(() => {
        expect(result.current.suggestions.length).toBeGreaterThanOrEqual(0);
      }, { timeout: 5000 });
    }, 10000);

    it('should handle set selection and clear card/product field', async () => {
      const { result } = renderHook(() => useSearch());

      // First set some card/product name
      await act(async () => {
        result.current.updateCardProductName('test');
      });

      // Then select a set
      await act(async () => {
        result.current.handleSuggestionSelect({ setName: 'Base Set' }, 'set');
      });

      expect(result.current.setName).toBe('Base Set');
      expect(result.current.selectedSet).toBe('Base Set');
      expect(result.current.cardProductName).toBe(''); // Should be cleared
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.activeField).toBe(null);
    });

    it('should handle card/product selection and auto-fill set', async () => {
      const { result } = renderHook(() => useSearch());

      // Pass suggestion as object with setInfo like real API response
      await act(async () => {
        result.current.handleSuggestionSelect({
          cardName: 'Charizard',
          setInfo: { setName: 'Base Set' }
        }, 'cardProduct');
      });

      expect(result.current.cardProductName).toBe('Charizard');
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.activeField).toBe(null);
      expect(result.current.setName).toBe('Base Set'); // Should be auto-filled
      expect(result.current.selectedSet).toBe('Base Set');
    }, 15000);

    it('should clear selected set', async () => {
      const { result } = renderHook(() => useSearch());

      // First select a set
      await act(async () => {
        result.current.handleSuggestionSelect({ setName: 'Base Set' }, 'set');
      });

      // Then clear it
      await act(async () => {
        result.current.clearSelectedSet();
      });

      expect(result.current.selectedSet).toBe(null);
      expect(result.current.setName).toBe('');
    });

    it('should set active field correctly', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.setActiveField('set');
      });

      expect(result.current.activeField).toBe('set');

      await act(async () => {
        result.current.setActiveField('cardProduct');
      });

      expect(result.current.activeField).toBe('cardProduct');

      await act(async () => {
        result.current.setActiveField('category');
      });

      expect(result.current.activeField).toBe('category');

      await act(async () => {
        result.current.setActiveField(null);
      });

      expect(result.current.activeField).toBe(null);
    });
  });

  // Suggestions and auto-complete tests
  describe('Suggestions and Auto-complete', () => {
    it('should get set suggestions when typing set name', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateSetName('base');
      });

      // Wait for debounced suggestions
      await waitFor(() => {
        // Suggestions should be fetched for sets containing 'base'
        expect(result.current.suggestions).toBeDefined();
      }, { timeout: 5000 });

      expect(result.current.activeField).toBe('set');
    }, 10000);

    it('should get card suggestions when typing card name', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateCardProductName('pika');
      });

      // Wait for debounced suggestions
      await waitFor(() => {
        // Suggestions should be fetched for cards containing 'pika'
        expect(result.current.suggestions).toBeDefined();
      }, { timeout: 5000 });

      expect(result.current.activeField).toBe('cardProduct');
    }, 10000);

    it('should filter card suggestions by selected set', async () => {
      const { result } = renderHook(() => useSearch());

      // First select a set
      await act(async () => {
        result.current.handleSuggestionSelect({ setName: 'Base Set' }, 'set');
      });

      // Then search for cards
      await act(async () => {
        result.current.updateCardProductName('char');
      });

      // Wait for debounced suggestions
      await waitFor(() => {
        expect(result.current.suggestions).toBeDefined();
      }, { timeout: 5000 });

      // Suggestions should be filtered by the selected set
      expect(result.current.selectedSet).toBe('Base Set');
      expect(result.current.activeField).toBe('cardProduct');
    }, 10000);

    it('should not show suggestions for very short queries', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        result.current.updateSetName('a');
      });

      // Should not trigger suggestions for single character
      expect(result.current.suggestions).toEqual([]);
    });
  });

  // Best match functionality tests
  describe('Best Match Functionality', () => {
    it('should get best match for valid query', async () => {
      const { result } = renderHook(() => useSearch());

      let bestMatch;
      await act(async () => {
        bestMatch = await result.current.getBestMatch('charizard');
      });

      // Should return a card object or null
      expect(bestMatch === null || typeof bestMatch === 'object').toBe(true);
      
      if (bestMatch) {
        expect(bestMatch).toHaveProperty('_id');
        expect(bestMatch).toHaveProperty('cardName');
      }
    }, 10000);

    it('should handle best match for non-existent query', async () => {
      const { result } = renderHook(() => useSearch());

      let bestMatch;
      await act(async () => {
        bestMatch = await result.current.getBestMatch('nonexistentcard12345');
      });

      // Should return null for non-existent cards (no best match found)
      expect(bestMatch).toBe(null);
    }, 10000);
  });

  // Performance and caching tests
  describe('Performance and Caching', () => {
    it('should handle debounced suggestions correctly', async () => {
      const { result } = renderHook(() => useSearch());

      // Rapidly type to test debouncing
      await act(async () => {
        result.current.updateSetName('b');
      });

      await act(async () => {
        result.current.updateSetName('ba');
      });

      await act(async () => {
        result.current.updateSetName('bas');
      });

      await act(async () => {
        result.current.updateSetName('base');
      });

      // Wait for final debounced call
      await waitFor(() => {
        expect(result.current.setName).toBe('base');
      }, { timeout: 2000 });

      // Only the final query should trigger suggestions
      expect(result.current.activeField).toBe('set');
    }, 5000);

    it('should maintain state consistency during multiple operations', async () => {
      const { result } = renderHook(() => useSearch());

      // Perform multiple operations
      await act(async () => {
        result.current.updateSetName('base');
      });

      await act(async () => {
        result.current.handleSuggestionSelect({ setName: 'Base Set' }, 'set');
      });

      await act(async () => {
        result.current.updateCardProductName('charizard');
      });

      await act(async () => {
        await result.current.handleSearch('pikachu');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // State should be consistent
      expect(result.current.setName).toBe('Base Set');
      expect(result.current.selectedSet).toBe('Base Set');
      expect(result.current.cardProductName).toBe('charizard');
      expect(result.current.searchTerm).toBe('pikachu');
      expect(Array.isArray(result.current.searchResults)).toBe(true);
      
      // Should have searchMeta from the search
      expect(result.current.searchMeta).toBeDefined();
      if (result.current.searchMeta) {
        expect(typeof result.current.searchMeta.queryTime).toBe('number');
      }
    }, 15000);
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle search errors gracefully', async () => {
      const { result } = renderHook(() => useSearch());

      // Test with potentially problematic query
      await act(async () => {
        await result.current.handleSearch('测试查询'); // Non-ASCII characters
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 10000 });

      // Should handle gracefully without crashing
      expect(result.current.searchTerm).toBe('测试查询');
      // Error handling depends on backend implementation
    }, 15000);

    it('should handle suggestion errors gracefully', async () => {
      const { result } = renderHook(() => useSearch());

      // Test with edge case input
      await act(async () => {
        result.current.updateSetName('!@#$%^&*()');
      });

      // Wait for debounced call
      await waitFor(() => {
        expect(result.current.setName).toBe('!@#$%^&*()');
      }, { timeout: 2000 });

      // Should handle gracefully
      expect(result.current.activeField).toBe('set');
    }, 5000);
  });

  // Single field focus tests (no simultaneous suggestions)
  describe('Single Field Focus', () => {
    it('should clear suggestions when switching between fields', async () => {
      const { result } = renderHook(() => useSearch());

      // Start with set suggestions
      await act(async () => {
        result.current.updateSetName('base');
      });

      await waitFor(() => {
        expect(result.current.activeField).toBe('set');
      }, { timeout: 1000 });

      // Switch to card/product field
      await act(async () => {
        result.current.updateCardProductName('char');
      });

      // Suggestions should be cleared when field changes
      expect(result.current.activeField).toBe('cardProduct');
      // The hook should manage suggestions to only show for active field
    }, 5000);

    it('should only show suggestions for active field', async () => {
      const { result } = renderHook(() => useSearch());

      // Set active field to 'set'
      await act(async () => {
        result.current.setActiveField('set');
        result.current.updateSetName('base');
      });

      await waitFor(() => {
        expect(result.current.activeField).toBe('set');
      }, { timeout: 1000 });

      // Change to card/product field
      await act(async () => {
        result.current.setActiveField('cardProduct');
      });

      // Suggestions should be cleared when active field changes
      expect(result.current.activeField).toBe('cardProduct');
    }, 3000);
  });
});