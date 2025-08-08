/**
 * Simple Sale Details Section Component
 * Provides the interface that AddEditCardForm expects for sale details
 */

import React from 'react';

interface SimpleSaleDetailsSectionProps {
  saleDetails: any;
  onSaleDetailsChange: (details: any) => void;
  sold: boolean;
  onSoldChange: (sold: boolean) => void;
}

export const SimpleSaleDetailsSection: React.FC<SimpleSaleDetailsSectionProps> = ({
  saleDetails,
  onSaleDetailsChange,
  sold,
  onSoldChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Sale Details</h3>
      
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={sold}
            onChange={(e) => onSoldChange(e.target.checked)}
            className="rounded border-white/20 bg-white/10 text-blue-500"
          />
          <span className="text-white/90">Mark as sold</span>
        </label>
      </div>

      {sold && (
        <div className="space-y-4 mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-600/50">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Sale Price
            </label>
            <input
              type="number"
              step="0.01"
              value={saleDetails?.actualSoldPrice || ''}
              onChange={(e) => onSaleDetailsChange({
                ...saleDetails,
                actualSoldPrice: e.target.value
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Sale Date
            </label>
            <input
              type="date"
              value={saleDetails?.dateSold ? new Date(saleDetails.dateSold).toISOString().split('T')[0] : ''}
              onChange={(e) => onSaleDetailsChange({
                ...saleDetails,
                dateSold: e.target.value
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Buyer Name
            </label>
            <input
              type="text"
              value={saleDetails?.buyerFullName || ''}
              onChange={(e) => onSaleDetailsChange({
                ...saleDetails,
                buyerFullName: e.target.value
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="Enter buyer name"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleSaleDetailsSection;