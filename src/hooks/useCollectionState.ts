/**
 * Collection State Management Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only manages collection state
 */

import { useState, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';

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

  // PSA Card state operations
  const addPsaCardToState = useCallback((card: IPsaGradedCard) => {
    setState((prev) => ({
      ...prev,
      psaCards: [...prev.psaCards, card],
    }));
  }, []);

  const updatePsaCardInState = useCallback(
    (id: string, updatedCard: IPsaGradedCard) => {
      setState((prev) => ({
        ...prev,
        psaCards: prev.psaCards.map((card) =>
          card.id === id ? updatedCard : card
        ),
      }));
    },
    []
  );

  const removePsaCardFromState = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      psaCards: prev.psaCards.filter((card) => card.id !== id),
    }));
  }, []);

  const movePsaCardToSold = useCallback(
    (id: string, soldCard: IPsaGradedCard) => {
      setState((prev) => ({
        ...prev,
        psaCards: prev.psaCards.filter((card) => card.id !== id),
        soldItems: [...prev.soldItems, soldCard],
      }));
    },
    []
  );

  // Raw Card state operations
  const addRawCardToState = useCallback((card: IRawCard) => {
    setState((prev) => ({
      ...prev,
      rawCards: [...prev.rawCards, card],
    }));
  }, []);

  const updateRawCardInState = useCallback(
    (id: string, updatedCard: IRawCard) => {
      setState((prev) => ({
        ...prev,
        rawCards: prev.rawCards.map((card) =>
          card.id === id ? updatedCard : card
        ),
      }));
    },
    []
  );

  const removeRawCardFromState = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      rawCards: prev.rawCards.filter((card) => card.id !== id),
    }));
  }, []);

  const moveRawCardToSold = useCallback((id: string, soldCard: IRawCard) => {
    setState((prev) => ({
      ...prev,
      rawCards: prev.rawCards.filter((card) => card.id !== id),
      soldItems: [...prev.soldItems, soldCard],
    }));
  }, []);

  // Sealed Product state operations
  const addSealedProductToState = useCallback((product: ISealedProduct) => {
    setState((prev) => ({
      ...prev,
      sealedProducts: [...prev.sealedProducts, product],
    }));
  }, []);

  const updateSealedProductInState = useCallback(
    (id: string, updatedProduct: ISealedProduct) => {
      setState((prev) => ({
        ...prev,
        sealedProducts: prev.sealedProducts.map((product) =>
          product.id === id ? updatedProduct : product
        ),
      }));
    },
    []
  );

  const removeSealedProductFromState = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      sealedProducts: prev.sealedProducts.filter(
        (product) => product.id !== id
      ),
    }));
  }, []);

  const moveSealedProductToSold = useCallback(
    (id: string, soldProduct: ISealedProduct) => {
      setState((prev) => ({
        ...prev,
        sealedProducts: prev.sealedProducts.filter(
          (product) => product.id !== id
        ),
        soldItems: [...prev.soldItems, soldProduct],
      }));
    },
    []
  );

  // Bulk state operations
  const setCollectionState = useCallback(
    (newState: Partial<CollectionState>) => {
      setState((prev) => ({
        ...prev,
        ...newState,
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
