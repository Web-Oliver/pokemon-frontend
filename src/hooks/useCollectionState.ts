/**
 * Collection State Management Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only manages collection state
 *
 * Standard for new API format with comprehensive array safety and validation
 * Following CLAUDE.md SOLID principles and steering document guidelines
 */

import { useState, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { log } from '../utils/logger';

export interface CollectionState {
  psaCards: IPsaGradedCard[];
  rawCards: IRawCard[];
  sealedProducts: ISealedProduct[];
  soldItems: (IPsaGradedCard | IRawCard | ISealedProduct)[];
}

export interface UseCollectionStateReturn extends CollectionState {
  // PSA Card state operations
  addPsaCardToState: (card: IPsaGradedCard) => void;
  updatePsaCardInState: (id: string, updatedCard: IPsaGradedCard) => void;
  removePsaCardFromState: (id: string) => void;
  movePsaCardToSold: (id: string, soldCard: IPsaGradedCard) => void;

  // Raw Card state operations
  addRawCardToState: (card: IRawCard) => void;
  updateRawCardInState: (id: string, updatedCard: IRawCard) => void;
  removeRawCardFromState: (id: string) => void;
  moveRawCardToSold: (id: string, soldCard: IRawCard) => void;

  // Sealed Product state operations
  addSealedProductToState: (product: ISealedProduct) => void;
  updateSealedProductInState: (
    id: string,
    updatedProduct: ISealedProduct
  ) => void;
  removeSealedProductFromState: (id: string) => void;
  moveSealedProductToSold: (id: string, soldProduct: ISealedProduct) => void;

  // Bulk state operations
  setCollectionState: (state: Partial<CollectionState>) => void;
  resetCollectionState: () => void;
}

const initialState: CollectionState = {
  psaCards: [],
  rawCards: [],
  sealedProducts: [],
  soldItems: [],
};

/**
 * Hook for managing collection state operations
 * Follows SRP - only handles state updates, no API calls
 */
export const useCollectionState = (): UseCollectionStateReturn => {
  const [state, setState] = useState<CollectionState>(initialState);

  // PSA Card state operations with enhanced safety
  const addPsaCardToState = useCallback((card: IPsaGradedCard) => {
    if (!card || typeof card !== 'object' || !card.id) {
      log('[COLLECTION STATE] Invalid PSA card provided to addPsaCardToState', {
        card,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      psaCards: [...(prev.psaCards || []), card],
    }));
  }, []);

  const updatePsaCardInState = useCallback(
    (id: string, updatedCard: IPsaGradedCard) => {
      if (!id || !updatedCard || typeof updatedCard !== 'object') {
        log('[COLLECTION STATE] Invalid parameters for updatePsaCardInState', {
          id,
          updatedCard,
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        psaCards: (prev.psaCards || []).map((card) =>
          card.id === id ? updatedCard : card
        ),
      }));
    },
    []
  );

  const removePsaCardFromState = useCallback((id: string) => {
    if (!id) {
      log('[COLLECTION STATE] Invalid ID provided to removePsaCardFromState', {
        id,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      psaCards: (prev.psaCards || []).filter((card) => card.id !== id),
    }));
  }, []);

  const movePsaCardToSold = useCallback(
    (id: string, soldCard: IPsaGradedCard) => {
      if (!id || !soldCard || typeof soldCard !== 'object') {
        log('[COLLECTION STATE] Invalid parameters for movePsaCardToSold', {
          id,
          soldCard,
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        psaCards: (prev.psaCards || []).filter((card) => card.id !== id),
        soldItems: [...(prev.soldItems || []), soldCard],
      }));
    },
    []
  );

  // Raw Card state operations with enhanced safety
  const addRawCardToState = useCallback((card: IRawCard) => {
    if (!card || typeof card !== 'object' || !card.id) {
      log('[COLLECTION STATE] Invalid raw card provided to addRawCardToState', {
        card,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      rawCards: [...(prev.rawCards || []), card],
    }));
  }, []);

  const updateRawCardInState = useCallback(
    (id: string, updatedCard: IRawCard) => {
      if (!id || !updatedCard || typeof updatedCard !== 'object') {
        log('[COLLECTION STATE] Invalid parameters for updateRawCardInState', {
          id,
          updatedCard,
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        rawCards: (prev.rawCards || []).map((card) =>
          card.id === id ? updatedCard : card
        ),
      }));
    },
    []
  );

  const removeRawCardFromState = useCallback((id: string) => {
    if (!id) {
      log('[COLLECTION STATE] Invalid ID provided to removeRawCardFromState', {
        id,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      rawCards: (prev.rawCards || []).filter((card) => card.id !== id),
    }));
  }, []);

  const moveRawCardToSold = useCallback((id: string, soldCard: IRawCard) => {
    if (!id || !soldCard || typeof soldCard !== 'object') {
      log('[COLLECTION STATE] Invalid parameters for moveRawCardToSold', {
        id,
        soldCard,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      rawCards: (prev.rawCards || []).filter((card) => card.id !== id),
      soldItems: [...(prev.soldItems || []), soldCard],
    }));
  }, []);

  // Sealed Product state operations with enhanced safety
  const addSealedProductToState = useCallback((product: ISealedProduct) => {
    if (!product || typeof product !== 'object' || !product.id) {
      log(
        '[COLLECTION STATE] Invalid sealed product provided to addSealedProductToState',
        { product }
      );
      return;
    }

    setState((prev) => ({
      ...prev,
      sealedProducts: [...(prev.sealedProducts || []), product],
    }));
  }, []);

  const updateSealedProductInState = useCallback(
    (id: string, updatedProduct: ISealedProduct) => {
      if (!id || !updatedProduct || typeof updatedProduct !== 'object') {
        log(
          '[COLLECTION STATE] Invalid parameters for updateSealedProductInState',
          { id, updatedProduct }
        );
        return;
      }

      setState((prev) => ({
        ...prev,
        sealedProducts: (prev.sealedProducts || []).map((product) =>
          product.id === id ? updatedProduct : product
        ),
      }));
    },
    []
  );

  const removeSealedProductFromState = useCallback((id: string) => {
    if (!id) {
      log(
        '[COLLECTION STATE] Invalid ID provided to removeSealedProductFromState',
        { id }
      );
      return;
    }

    setState((prev) => ({
      ...prev,
      sealedProducts: (prev.sealedProducts || []).filter(
        (product) => product.id !== id
      ),
    }));
  }, []);

  const moveSealedProductToSold = useCallback(
    (id: string, soldProduct: ISealedProduct) => {
      if (!id || !soldProduct || typeof soldProduct !== 'object') {
        log(
          '[COLLECTION STATE] Invalid parameters for moveSealedProductToSold',
          { id, soldProduct }
        );
        return;
      }

      setState((prev) => ({
        ...prev,
        sealedProducts: (prev.sealedProducts || []).filter(
          (product) => product.id !== id
        ),
        soldItems: [...(prev.soldItems || []), soldProduct],
      }));
    },
    []
  );

  // Bulk state operations with enhanced validation
  const setCollectionState = useCallback(
    (newState: Partial<CollectionState>) => {
      if (!newState || typeof newState !== 'object') {
        log('[COLLECTION STATE] Invalid state provided to setCollectionState', {
          newState,
        });
        return;
      }

      // Validate array properties if provided
      const validatedState: Partial<CollectionState> = {};

      if (newState.psaCards !== undefined) {
        validatedState.psaCards = Array.isArray(newState.psaCards)
          ? newState.psaCards
          : [];
      }

      if (newState.rawCards !== undefined) {
        validatedState.rawCards = Array.isArray(newState.rawCards)
          ? newState.rawCards
          : [];
      }

      if (newState.sealedProducts !== undefined) {
        validatedState.sealedProducts = Array.isArray(newState.sealedProducts)
          ? newState.sealedProducts
          : [];
      }

      if (newState.soldItems !== undefined) {
        validatedState.soldItems = Array.isArray(newState.soldItems)
          ? newState.soldItems
          : [];
      }

      setState((prev) => ({
        ...prev,
        ...validatedState,
      }));
    },
    []
  );

  const resetCollectionState = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    // State
    ...state,

    // PSA Card operations
    addPsaCardToState,
    updatePsaCardInState,
    removePsaCardFromState,
    movePsaCardToSold,

    // Raw Card operations
    addRawCardToState,
    updateRawCardInState,
    removeRawCardFromState,
    moveRawCardToSold,

    // Sealed Product operations
    addSealedProductToState,
    updateSealedProductInState,
    removeSealedProductFromState,
    moveSealedProductToSold,

    // Bulk operations
    setCollectionState,
    resetCollectionState,
  };
};
