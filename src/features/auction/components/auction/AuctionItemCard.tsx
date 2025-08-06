/**
 * AuctionItemCard Component
 *
 * Extracted from AuctionDetail.tsx to follow SRP principle
 * Handles display of individual auction items with actions
 * Following CLAUDE.md principles: Single Responsibility, reusable UI components
 * 
 * REFACTORED: Now uses BaseCard for consistent card styling and behavior
 */

import React from 'react';
import { Trash2, DollarSign, Package, ShoppingBag } from 'lucide-react';
import { BaseCard } from '../../../../shared/components/molecules/common/BaseCard';
import { PokemonButton } from '../../../../shared/components/atoms/design-system/PokemonButton';
import {
  getItemDisplayData,
  getItemCategoryColor,
  formatItemCategory,
  formatCurrency,
} from '../../../../shared/utils/helpers/itemDisplayHelpers';

export interface AuctionItemCardProps {
  item: any;
  isItemSold: (item: any) => boolean;
  onMarkSold: (item: any) => void;
  onRemoveItem: (item: any) => void;
  disabled?: boolean;
}

export const AuctionItemCard: React.FC<AuctionItemCardProps> = ({
  item,
  isItemSold,
  onMarkSold,
  onRemoveItem,
  disabled = false,
}) => {
  const displayData = getItemDisplayData(item);
  const isSold = isItemSold(item);

  return (
    <BaseCard
      variant="glass"
      size="lg"
      interactive={false}
      status={isSold ? 'success' : 'default'}
      className="group"
    >
      <div className="flex gap-6">
        {/* Item Image */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--theme-surface-secondary)] to-[var(--theme-surface)] border border-[var(--theme-border)]">
            {displayData.itemImage ? (
              <img
                src={displayData.itemImage}
                alt={displayData.itemName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package
                  size={32}
                  className="text-[var(--theme-text-secondary)]"
                />
              </div>
            )}

            {/* Sold overlay */}
            {isSold && (
              <div className="absolute inset-0 bg-[var(--theme-status-success)]/90 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-semibold text-sm">SOLD</span>
              </div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-1 truncate">
                {displayData.itemName}
              </h3>

              {/* Item category badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getItemCategoryColor(item.itemCategory)}`}
                >
                  {formatItemCategory(item.itemCategory)}
                </span>

                {isSold && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--theme-status-success)]/20 text-[var(--theme-status-success)] border border-[var(--theme-status-success)]/50">
                    Sold
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Item Details Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            {displayData.setName && (
              <div className="flex justify-between">
                <span className="text-[var(--theme-text-secondary)]">
                  Set:
                </span>
                <span className="text-[var(--theme-text-primary)] font-medium truncate ml-2">
                  {displayData.setName}
                </span>
              </div>
            )}

            {displayData.cardNumber && (
              <div className="flex justify-between">
                <span className="text-[var(--theme-text-secondary)]">
                  Card #:
                </span>
                <span className="text-[var(--theme-text-primary)] font-medium">
                  {displayData.cardNumber}
                </span>
              </div>
            )}

            {displayData.grade && (
              <div className="flex justify-between">
                <span className="text-[var(--theme-text-secondary)]">
                  Grade:
                </span>
                <span className="text-[var(--theme-text-primary)] font-medium">
                  {displayData.grade}
                </span>
              </div>
            )}

            {displayData.condition && (
              <div className="flex justify-between">
                <span className="text-[var(--theme-text-secondary)]">
                  Condition:
                </span>
                <span className="text-[var(--theme-text-primary)] font-medium">
                  {displayData.condition}
                </span>
              </div>
            )}

            <div className="flex justify-between col-span-2">
              <span className="text-[var(--theme-text-secondary)]">
                Price:
              </span>
              <span className="text-[var(--theme-accent-primary)] font-semibold text-lg">
                {formatCurrency(displayData.price)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isSold && (
              <PokemonButton
                variant="secondary"
                size="sm"
                startIcon={<DollarSign size={16} />}
                onClick={() => onMarkSold(item)}
                disabled={disabled}
                className="flex-1"
              >
                Mark Sold
              </PokemonButton>
            )}

            <PokemonButton
              variant="danger"
              size="sm"
              startIcon={<Trash2 size={16} />}
              onClick={() => onRemoveItem(item)}
              disabled={disabled}
              className={isSold ? 'flex-1' : ''}
            >
              Remove
            </PokemonButton>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};