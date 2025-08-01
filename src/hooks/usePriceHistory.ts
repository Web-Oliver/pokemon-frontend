/**
 * Price History Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles price history management
 */

import { useCallback, useEffect, useState } from 'react';

export interface PriceHistoryEntry {
  price: number;
  date: string;
  source?: string;
}

export interface UsePriceHistoryReturn {
  priceHistory: PriceHistoryEntry[];
  currentPrice: number;
  addPriceEntry: (price: number, source?: string) => void;
  removePriceEntry: (index: number) => void;
  updateCurrentPrice: (price: number) => void;
  setPriceHistory: (history: PriceHistoryEntry[]) => void;
  clearPriceHistory: () => void;
  getLatestPrice: () => number | undefined;
  getPriceChangePercentage: () => number | undefined;
}

/**
 * Hook for price history management
 * Follows SRP - only handles price tracking and history operations
 */
export const usePriceHistory = (
  initialHistory: PriceHistoryEntry[] = [],
  initialPrice: number = 0
): UsePriceHistoryReturn => {
  const [priceHistory, setPriceHistory] =
    useState<PriceHistoryEntry[]>(initialHistory);
  const [currentPrice, setCurrentPrice] = useState<number>(initialPrice);

  const addPriceEntry = useCallback((price: number, source?: string) => {
    const newEntry: PriceHistoryEntry = {
      price,
      date: new Date().toISOString(),
      source,
    };

    setPriceHistory((prev) => [...prev, newEntry]);
    setCurrentPrice(price);
  }, []);

  const removePriceEntry = useCallback((index: number) => {
    setPriceHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateCurrentPrice = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  const clearPriceHistory = useCallback(() => {
    setPriceHistory([]);
    setCurrentPrice(0);
  }, []);

  const getLatestPrice = useCallback((): number | undefined => {
    if (priceHistory.length === 0) {
      return undefined;
    }
    return priceHistory[priceHistory.length - 1].price;
  }, [priceHistory]);

  const getPriceChangePercentage = useCallback((): number | undefined => {
    if (priceHistory.length < 2) {
      return undefined;
    }

    const firstPrice = priceHistory[0].price;
    const latestPrice = priceHistory[priceHistory.length - 1].price;

    if (firstPrice === 0) {
      return undefined;
    }

    return ((latestPrice - firstPrice) / firstPrice) * 100;
  }, [priceHistory]);

  // Update current price when price history changes
  useEffect(() => {
    const latestPrice = getLatestPrice();
    if (latestPrice !== undefined && latestPrice !== currentPrice) {
      setCurrentPrice(latestPrice);
    }
  }, [priceHistory, getLatestPrice, currentPrice]);

  return {
    priceHistory,
    currentPrice,
    addPriceEntry,
    removePriceEntry,
    updateCurrentPrice,
    setPriceHistory,
    clearPriceHistory,
    getLatestPrice,
    getPriceChangePercentage,
  };
};
