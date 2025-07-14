/**
 * Collection Management Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Manages all collection-related state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import * as collectionApi from '../api/collectionApi';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';

export interface CollectionState {
  psaCards: IPsaGradedCard[];
  rawCards: IRawCard[];
  sealedProducts: ISealedProduct[];
  soldItems: (IPsaGradedCard | IRawCard | ISealedProduct)[];
  loading: boolean;
  error: string | null;
}

export interface UseCollectionReturn extends CollectionState {
  // PSA Graded Cards operations
  addPsaCard: (cardData: Partial<IPsaGradedCard>) => Promise<void>;
  updatePsaCard: (id: string, cardData: Partial<IPsaGradedCard>) => Promise<void>;
  deletePsaCard: (id: string) => Promise<void>;
  markPsaCardSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;
  
  // Raw Cards operations
  addRawCard: (cardData: Partial<IRawCard>) => Promise<void>;
  updateRawCard: (id: string, cardData: Partial<IRawCard>) => Promise<void>;
  deleteRawCard: (id: string) => Promise<void>;
  markRawCardSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;
  
  // Sealed Products operations
  addSealedProduct: (productData: Partial<ISealedProduct>) => Promise<void>;
  updateSealedProduct: (id: string, productData: Partial<ISealedProduct>) => Promise<void>;
  deleteSealedProduct: (id: string) => Promise<void>;
  markSealedProductSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;
  
  // General operations
  refreshCollection: () => Promise<void>;
  clearError: () => void;
}

export const useCollection = (): UseCollectionReturn => {
  const [state, setState] = useState<CollectionState>({
    psaCards: [],
    rawCards: [],
    sealedProducts: [],
    soldItems: [],
    loading: false,
    error: null,
  });

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * Fetch all collection data from the backend
   */
  const fetchAllCollectionData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      log('Fetching collection data...');
      
      // Fetch all collection items in parallel
      const [psaCardsResponse, rawCardsResponse, sealedProductsResponse] = await Promise.all([
        collectionApi.getPsaGradedCards({ sold: false }),
        collectionApi.getRawCards({ sold: false }),
        collectionApi.getSealedProductCollection({ sold: false }),
      ]);

      // Fetch sold items separately
      const [soldPsaCards, soldRawCards, soldSealedProducts] = await Promise.all([
        collectionApi.getPsaGradedCards({ sold: true }),
        collectionApi.getRawCards({ sold: true }),
        collectionApi.getSealedProductCollection({ sold: true }),
      ]);

      const soldItems = [...soldPsaCards, ...soldRawCards, ...soldSealedProducts];

      setState(prev => ({
        ...prev,
        psaCards: psaCardsResponse,
        rawCards: rawCardsResponse,
        sealedProducts: sealedProductsResponse,
        soldItems,
        loading: false,
      }));

      log('Collection data fetched successfully');
    } catch (error) {
      handleApiError(error, 'Failed to fetch collection data');
      setError('Failed to load collection data');
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Refresh collection data
   */
  const refreshCollection = useCallback(async () => {
    await fetchAllCollectionData();
  }, [fetchAllCollectionData]);

  // PSA Graded Cards Operations
  const addPsaCard = useCallback(async (cardData: Partial<IPsaGradedCard>) => {
    setLoading(true);
    setError(null);

    try {
      log('Adding PSA graded card...');
      const newCard = await collectionApi.createPsaGradedCard(cardData);
      
      // Optimistic update
      setState(prev => ({
        ...prev,
        psaCards: [...prev.psaCards, newCard],
        loading: false,
      }));

      log('PSA graded card added successfully');
    } catch (error) {
      handleApiError(error, 'Failed to add PSA graded card');
      setError('Failed to add PSA graded card');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updatePsaCard = useCallback(async (id: string, cardData: Partial<IPsaGradedCard>) => {
    setLoading(true);
    setError(null);

    try {
      log(`Updating PSA graded card ${id}...`);
      const updatedCard = await collectionApi.updatePsaGradedCard(id, cardData);
      
      // Optimistic update
      setState(prev => ({
        ...prev,
        psaCards: prev.psaCards.map(card => 
          card.id === id ? updatedCard : card
        ),
        loading: false,
      }));

      log('PSA graded card updated successfully');
    } catch (error) {
      handleApiError(error, 'Failed to update PSA graded card');
      setError('Failed to update PSA graded card');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const deletePsaCard = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      log(`Deleting PSA graded card ${id}...`);
      await collectionApi.deletePsaGradedCard(id);
      
      // Optimistic update
      setState(prev => ({
        ...prev,
        psaCards: prev.psaCards.filter(card => card.id !== id),
        loading: false,
      }));

      log('PSA graded card deleted successfully');
    } catch (error) {
      handleApiError(error, 'Failed to delete PSA graded card');
      setError('Failed to delete PSA graded card');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const markPsaCardSold = useCallback(async (id: string, saleDetails: ISaleDetails) => {
    setLoading(true);
    setError(null);

    try {
      log(`Marking PSA graded card ${id} as sold...`);
      const soldCard = await collectionApi.markPsaGradedCardSold(id, saleDetails);
      
      // Move card from collection to sold items
      setState(prev => ({
        ...prev,
        psaCards: prev.psaCards.filter(card => card.id !== id),
        soldItems: [...prev.soldItems, soldCard],
        loading: false,
      }));

      log('PSA graded card marked as sold successfully');
    } catch (error) {
      handleApiError(error, 'Failed to mark PSA graded card as sold');
      setError('Failed to mark PSA graded card as sold');
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Raw Cards Operations (similar pattern)
  const addRawCard = useCallback(async (cardData: Partial<IRawCard>) => {
    setLoading(true);
    setError(null);

    try {
      log('Adding raw card...');
      const newCard = await collectionApi.createRawCard(cardData);
      
      setState(prev => ({
        ...prev,
        rawCards: [...prev.rawCards, newCard],
        loading: false,
      }));

      log('Raw card added successfully');
    } catch (error) {
      handleApiError(error, 'Failed to add raw card');
      setError('Failed to add raw card');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updateRawCard = useCallback(async (id: string, cardData: Partial<IRawCard>) => {
    setLoading(true);
    setError(null);

    try {
      log(`Updating raw card ${id}...`);
      const updatedCard = await collectionApi.updateRawCard(id, cardData);
      
      setState(prev => ({
        ...prev,
        rawCards: prev.rawCards.map(card => 
          card.id === id ? updatedCard : card
        ),
        loading: false,
      }));

      log('Raw card updated successfully');
    } catch (error) {
      handleApiError(error, 'Failed to update raw card');
      setError('Failed to update raw card');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const deleteRawCard = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      log(`Deleting raw card ${id}...`);
      await collectionApi.deleteRawCard(id);
      
      setState(prev => ({
        ...prev,
        rawCards: prev.rawCards.filter(card => card.id !== id),
        loading: false,
      }));

      log('Raw card deleted successfully');
    } catch (error) {
      handleApiError(error, 'Failed to delete raw card');
      setError('Failed to delete raw card');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const markRawCardSold = useCallback(async (id: string, saleDetails: ISaleDetails) => {
    setLoading(true);
    setError(null);

    try {
      log(`Marking raw card ${id} as sold...`);
      const soldCard = await collectionApi.markRawCardSold(id, saleDetails);
      
      setState(prev => ({
        ...prev,
        rawCards: prev.rawCards.filter(card => card.id !== id),
        soldItems: [...prev.soldItems, soldCard],
        loading: false,
      }));

      log('Raw card marked as sold successfully');
    } catch (error) {
      handleApiError(error, 'Failed to mark raw card as sold');
      setError('Failed to mark raw card as sold');
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Sealed Products Operations (similar pattern)
  const addSealedProduct = useCallback(async (productData: Partial<ISealedProduct>) => {
    setLoading(true);
    setError(null);

    try {
      log('Adding sealed product...');
      const newProduct = await collectionApi.createSealedProduct(productData);
      
      setState(prev => ({
        ...prev,
        sealedProducts: [...prev.sealedProducts, newProduct],
        loading: false,
      }));

      log('Sealed product added successfully');
    } catch (error) {
      handleApiError(error, 'Failed to add sealed product');
      setError('Failed to add sealed product');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updateSealedProduct = useCallback(async (id: string, productData: Partial<ISealedProduct>) => {
    setLoading(true);
    setError(null);

    try {
      log(`Updating sealed product ${id}...`);
      const updatedProduct = await collectionApi.updateSealedProduct(id, productData);
      
      setState(prev => ({
        ...prev,
        sealedProducts: prev.sealedProducts.map(product => 
          product.id === id ? updatedProduct : product
        ),
        loading: false,
      }));

      log('Sealed product updated successfully');
    } catch (error) {
      handleApiError(error, 'Failed to update sealed product');
      setError('Failed to update sealed product');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const deleteSealedProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      log(`Deleting sealed product ${id}...`);
      await collectionApi.deleteSealedProduct(id);
      
      setState(prev => ({
        ...prev,
        sealedProducts: prev.sealedProducts.filter(product => product.id !== id),
        loading: false,
      }));

      log('Sealed product deleted successfully');
    } catch (error) {
      handleApiError(error, 'Failed to delete sealed product');
      setError('Failed to delete sealed product');
      setLoading(false);
    }
  }, [setLoading, setError]);

  const markSealedProductSold = useCallback(async (id: string, saleDetails: ISaleDetails) => {
    setLoading(true);
    setError(null);

    try {
      log(`Marking sealed product ${id} as sold...`);
      const soldProduct = await collectionApi.markSealedProductSold(id, saleDetails);
      
      setState(prev => ({
        ...prev,
        sealedProducts: prev.sealedProducts.filter(product => product.id !== id),
        soldItems: [...prev.soldItems, soldProduct],
        loading: false,
      }));

      log('Sealed product marked as sold successfully');
    } catch (error) {
      handleApiError(error, 'Failed to mark sealed product as sold');
      setError('Failed to mark sealed product as sold');
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Load collection data on hook initialization
  useEffect(() => {
    fetchAllCollectionData();
  }, [fetchAllCollectionData]);

  return {
    // State
    ...state,
    
    // PSA Cards operations
    addPsaCard,
    updatePsaCard,
    deletePsaCard,
    markPsaCardSold,
    
    // Raw Cards operations
    addRawCard,
    updateRawCard,
    deleteRawCard,
    markRawCardSold,
    
    // Sealed Products operations
    addSealedProduct,
    updateSealedProduct,
    deleteSealedProduct,
    markSealedProductSold,
    
    // General operations
    refreshCollection,
    clearError,
  };
};