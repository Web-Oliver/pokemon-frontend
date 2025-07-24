/**
 * Collection State Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Following CLAUDE.md + Context7 React optimization principles:
 * - Single Responsibility: Only manages collection state (SRP)
 * - Dependency Inversion: Abstract state management from operations (DIP)
 * - DRY: Centralized state management logic
 * - Performance: Memoized state setters with useCallback
 */

import { useState, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { DisplayItem } from '../utils/collectionDataTransforms';

export interface CollectionState {
  psaCards: DisplayItem[];
  rawCards: DisplayItem[];
  sealedProducts: DisplayItem[];
  soldItems: DisplayItem[];
  loading: boolean;
  error: string | null;
}

export interface UseCollectionStateReturn {
  state: CollectionState;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateState: (updater: (prev: CollectionState) => CollectionState) => void;
  setPsaCards: (cards: IPsaGradedCard[]) => void;
  setRawCards: (cards: IRawCard[]) => void;
  setSealedProducts: (products: ISealedProduct[]) => void;
  setSoldItems: (items: (IPsaGradedCard | IRawCard | ISealedProduct)[]) => void;
  addPsaCard: (card: IPsaGradedCard) => void;
  addRawCard: (card: IRawCard) => void;
  addSealedProduct: (product: ISealedProduct) => void;
  updatePsaCard: (id: string, card: IPsaGradedCard) => void;
  updateRawCard: (id: string, card: IRawCard) => void;
  updateSealedProduct: (id: string, product: ISealedProduct) => void;
  removePsaCard: (id: string) => void;
  removeRawCard: (id: string) => void;
  removeSealedProduct: (id: string) => void;
  movePsaCardToSold: (id: string, soldCard: IPsaGradedCard) => void;
  moveRawCardToSold: (id: string, soldCard: IRawCard) => void;
  moveSealedProductToSold: (id: string, soldProduct: ISealedProduct) => void;
}

/**
 * Collection State Management Hook
 *
 * Provides centralized state management for all collection data with optimized
 * performance using useCallback for stable function references.
 */
export const useCollectionState = (): UseCollectionStateReturn => {
  const [state, setState] = useState<CollectionState>({
    psaCards: [],
    rawCards: [],
    sealedProducts: [],
    soldItems: [],
    loading: false,
    error: null,
  });

  // Core state setters - memoized for performance
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const updateState = useCallback((updater: (prev: CollectionState) => CollectionState) => {
    setState(updater);
  }, []);

  // Collection array setters - memoized for performance
  const setPsaCards = useCallback((cards: IPsaGradedCard[]) => {
    setState(prev => ({ ...prev, psaCards: cards }));
  }, []);

  const setRawCards = useCallback((cards: IRawCard[]) => {
    setState(prev => ({ ...prev, rawCards: cards }));
  }, []);

  const setSealedProducts = useCallback((products: ISealedProduct[]) => {
    setState(prev => ({ ...prev, sealedProducts: products }));
  }, []);

  const setSoldItems = useCallback((items: (IPsaGradedCard | IRawCard | ISealedProduct)[]) => {
    setState(prev => ({ ...prev, soldItems: items }));
  }, []);

  // Optimistic update operations - memoized for performance
  const addPsaCard = useCallback((card: IPsaGradedCard) => {
    setState(prev => ({
      ...prev,
      psaCards: [...prev.psaCards, card],
    }));
  }, []);

  const addRawCard = useCallback((card: IRawCard) => {
    setState(prev => ({
      ...prev,
      rawCards: [...prev.rawCards, card],
    }));
  }, []);

  const addSealedProduct = useCallback((product: ISealedProduct) => {
    setState(prev => ({
      ...prev,
      sealedProducts: [...prev.sealedProducts, product],
    }));
  }, []);

  const updatePsaCard = useCallback((id: string, card: IPsaGradedCard) => {
    setState(prev => ({
      ...prev,
      psaCards: prev.psaCards.map(c => (c.id === id ? card : c)),
    }));
  }, []);

  const updateRawCard = useCallback((id: string, card: IRawCard) => {
    setState(prev => ({
      ...prev,
      rawCards: prev.rawCards.map(c => (c.id === id ? card : c)),
    }));
  }, []);

  const updateSealedProduct = useCallback((id: string, product: ISealedProduct) => {
    setState(prev => ({
      ...prev,
      sealedProducts: prev.sealedProducts.map(p => (p.id === id ? product : p)),
    }));
  }, []);

  const removePsaCard = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      psaCards: prev.psaCards.filter(card => card.id !== id),
    }));
  }, []);

  const removeRawCard = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      rawCards: prev.rawCards.filter(card => card.id !== id),
    }));
  }, []);

  const removeSealedProduct = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      sealedProducts: prev.sealedProducts.filter(product => product.id !== id),
    }));
  }, []);

  const movePsaCardToSold = useCallback((id: string, soldCard: IPsaGradedCard) => {
    setState(prev => ({
      ...prev,
      psaCards: prev.psaCards.filter(card => card.id !== id),
      soldItems: [...prev.soldItems, soldCard],
    }));
  }, []);

  const moveRawCardToSold = useCallback((id: string, soldCard: IRawCard) => {
    setState(prev => ({
      ...prev,
      rawCards: prev.rawCards.filter(card => card.id !== id),
      soldItems: [...prev.soldItems, soldCard],
    }));
  }, []);

  const moveSealedProductToSold = useCallback((id: string, soldProduct: ISealedProduct) => {
    setState(prev => ({
      ...prev,
      sealedProducts: prev.sealedProducts.filter(product => product.id !== id),
      soldItems: [...prev.soldItems, soldProduct],
    }));
  }, []);

  return {
    state,
    setLoading,
    setError,
    clearError,
    updateState,
    setPsaCards,
    setRawCards,
    setSealedProducts,
    setSoldItems,
    addPsaCard,
    addRawCard,
    addSealedProduct,
    updatePsaCard,
    updateRawCard,
    updateSealedProduct,
    removePsaCard,
    removeRawCard,
    removeSealedProduct,
    movePsaCardToSold,
    moveRawCardToSold,
    moveSealedProductToSold,
  };
};
