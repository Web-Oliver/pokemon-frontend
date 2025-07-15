/**
 * Price History Display Component
 * Layer 3: Components (UI Building Blocks)
 * Displays price history and allows price updates
 */

import React, { useState } from 'react';
import { IPriceHistoryEntry } from '../domain/models/common';
import Button from './common/Button';
import Input from './common/Input';
import { log } from '../utils/logger';

export interface PriceHistoryDisplayProps {
  priceHistory: IPriceHistoryEntry[];
  currentPrice: number;
  onPriceUpdate: (newPrice: number, date: string) => void;
}

export const PriceHistoryDisplay: React.FC<PriceHistoryDisplayProps> = ({
  priceHistory,
  currentPrice,
  onPriceUpdate,
}) => {
  const [newPrice, setNewPrice] = useState<string>('');

  const handlePriceUpdate = () => {
    const price = parseFloat(newPrice);
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    const currentDate = new Date().toISOString();
    log(`Updating price to ${price} on ${currentDate}`);
    
    onPriceUpdate(price, currentDate);
    setNewPrice('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.]/g, '');
    setNewPrice(numericValue);
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Price History</h3>
      
      {/* Current Price Display */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-600">Current Price</div>
        <div className="text-xl font-bold text-blue-900">
          {formatPrice(currentPrice)}
        </div>
      </div>

      {/* Price History List */}
      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
        {priceHistory.length > 0 ? (
          priceHistory
            .sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime())
            .map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-white rounded border"
              >
                <span className="font-medium text-gray-900">
                  {formatPrice(entry.price)}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(entry.dateUpdated)}
                </span>
              </div>
            ))
        ) : (
          <div className="text-sm text-gray-500 italic text-center py-4">
            No price history available
          </div>
        )}
      </div>

      {/* Update Price Section */}
      <div className="border-t pt-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Update Price
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter new price"
              value={newPrice}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          <Button
            onClick={handlePriceUpdate}
            disabled={!newPrice.trim() || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0}
            className="whitespace-nowrap"
          >
            Update Price
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Enter the new price (e.g., 150.00)
        </div>
      </div>
    </div>
  );
};