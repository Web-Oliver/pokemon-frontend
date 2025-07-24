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
    // Total items count (active collection only, not sold)
    const totalItems =
      psaCards.length + rawCards.length + sealedProducts.length;

    // Calculate total collection value (myPrice for active items)
    const totalValue = [
      ...psaCards.map((card) => card.myPrice || 0),
      ...rawCards.map((card) => card.myPrice || 0),
      ...sealedProducts.map((product) => product.myPrice || 0),
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
    const totalSales = soldItems.length;

    // Calculate average PSA grade
    const psaGrades = psaCards
      .map((card) => parseFloat(card.grade))
      .filter((grade) => !isNaN(grade));

    const averageGrade =
      psaGrades.length > 0
        ? (
            psaGrades.reduce((sum, grade) => sum + grade, 0) / psaGrades.length
          ).toFixed(1)
        : null;

    // Count top graded cards (PSA 9+ and 10)
    const topGradedCards = psaCards.filter((card) => {
      const grade = parseFloat(card.grade);
      return grade >= 9;
    }).length;

    // Count recently added items (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyAdded = [
      ...psaCards.filter((card) => new Date(card.dateAdded) >= sevenDaysAgo),
      ...rawCards.filter((card) => new Date(card.dateAdded) >= sevenDaysAgo),
      ...sealedProducts.filter(
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
        psaCards: psaCards.length,
        rawCards: rawCards.length,
        sealedProducts: sealedProducts.length,
      },
    };
  }, [psaCards, rawCards, sealedProducts, soldItems]);

  return { ...stats, loading };
};
