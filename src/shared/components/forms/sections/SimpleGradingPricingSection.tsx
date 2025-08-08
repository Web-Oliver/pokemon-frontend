/**
 * Simple Grading Pricing Section Component
 * Provides the interface that AddEditCardForm expects for PSA grading
 */

import React from 'react';

interface SimpleGradingPricingSectionProps {
  grade: string;
  onGradeChange: (grade: string) => void;
  price: string;
  onPriceChange: (price: string) => void;
  priceLabel: string;
  error?: string;
}

export const SimpleGradingPricingSection: React.FC<SimpleGradingPricingSectionProps> = ({
  grade,
  onGradeChange,
  price,
  onPriceChange,
  priceLabel,
  error,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Grading & Pricing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PSA Grade */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            PSA Grade
          </label>
          <select
            value={grade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="">Select Grade</option>
            <option value="1">PSA 1</option>
            <option value="2">PSA 2</option>
            <option value="3">PSA 3</option>
            <option value="4">PSA 4</option>
            <option value="5">PSA 5</option>
            <option value="6">PSA 6</option>
            <option value="7">PSA 7</option>
            <option value="8">PSA 8</option>
            <option value="9">PSA 9</option>
            <option value="10">PSA 10</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            {priceLabel}
          </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="0.00"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}
    </div>
  );
};

export default SimpleGradingPricingSection;