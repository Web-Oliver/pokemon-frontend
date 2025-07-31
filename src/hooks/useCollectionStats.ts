/**
 * Collection Statistics Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Provides computed statistics from collection data
 */

import { useMemo } from 'react';
import { useCollectionOperations } from './useCollectionOperations';
import { displayPrice } from '../utils/formatting';

export interface CollectionStats {
  totalItems: number;
  totalValue: number;
  totalSales: number;
  averageGrade: string | null;
  totalValueFormatted: string;
  topGradedCards: number;
  recentlyAdded: number;
  itemsByType: {
    psaCards: number;
    rawCards: number;
    sealedProducts: number;
  };
}

export const useCollectionStats = (): CollectionStats & {
  loading: boolean;
} => {
  const { psaCards, rawCards, sealedProducts, soldItems, loading } =
    useCollectionOperations();

  const stats = useMemo((): CollectionStats => {
    // Ensure arrays are safe for operations (prevent undefined access errors)
    const safePsaCards = psaCards || [];
    const safeRawCards = rawCards || [];
    const safeSealedProducts = sealedProducts || [];
    const safeSoldItems = soldItems || [];

    // Total items count (active collection only, not sold)
    const totalItems =
      safePsaCards.length + safeRawCards.length + safeSealedProducts.length;

    // Calculate total collection value (myPrice for active items)
    const totalValue = [
      ...safePsaCards.map((card) => card.myPrice || 0),
      ...safeRawCards.map((card) => card.myPrice || 0),
      ...safeSealedProducts.map((product) => product.myPrice || 0),
    ].reduce((sum, price) => {
      // Handle both number and Decimal128 formats
      const numericPrice =
        typeof price === 'number'
          ? price
          : (price as any)?.$numberDecimal
            ? parseFloat((price as any).$numberDecimal)
            : parseFloat(price?.toString() || '0');
      return sum + (isNaN(numericPrice) ? 0 : numericPrice);
    }, 0);

    // Total sales count from sold items
    const totalSales = safeSoldItems.length;

    // Calculate average PSA grade
    const psaGrades = safePsaCards
      .map((card) => parseFloat(card.grade))
      .filter((grade) => !isNaN(grade));

    const averageGrade =
      psaGrades.length > 0
        ? (
            psaGrades.reduce((sum, grade) => sum + grade, 0) / psaGrades.length
          ).toFixed(1)
        : null;

    // Count top graded cards (PSA 9+ and 10)
    const topGradedCards = safePsaCards.filter((card) => {
      const grade = parseFloat(card.grade);
      return grade >= 9;
    }).length;

    // Count recently added items (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyAdded = [
      ...safePsaCards.filter(
        (card) => new Date(card.dateAdded) >= sevenDaysAgo
      ),
      ...safeRawCards.filter(
        (card) => new Date(card.dateAdded) >= sevenDaysAgo
      ),
      ...safeSealedProducts.filter(
        (product) => new Date(product.dateAdded) >= sevenDaysAgo
      ),
    ].length;

    return {
      totalItems,
      totalValue,
      totalSales,
      averageGrade,
      totalValueFormatted: displayPrice(totalValue, 'kr.', true),
      topGradedCards,
      recentlyAdded,
      itemsByType: {
        psaCards: safePsaCards.length,
        rawCards: safeRawCards.length,
        sealedProducts: safeSealedProducts.length,
      },
    };
  }, [psaCards, rawCards, sealedProducts, soldItems]);

  return { ...stats, loading };
};
