/**
 * Context7 Award-Winning Price History Display Component
 * Ultra-premium price tracking with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating elements
 * - Premium gradients and color palettes
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus } from 'lucide-react';
import { IPriceHistoryEntry } from '../domain/models/common';
import Button from './common/Button';
import Input from './common/Input';
import { log } from '../utils/logger';
import { showWarningToast } from '../utils/errorHandler';

export interface PriceHistoryDisplayProps {
  priceHistory: IPriceHistoryEntry[];
  currentPrice?: number;
  onPriceUpdate?: (newPrice: number, date: string) => void;
}

export const PriceHistoryDisplay: React.FC<PriceHistoryDisplayProps> = ({
  priceHistory,
  currentPrice,
  onPriceUpdate,
}) => {
  const [newPrice, setNewPrice] = useState<string>('');

  const handlePriceUpdate = () => {
    if (!onPriceUpdate) return;
    
    const price = parseFloat(newPrice);

    if (isNaN(price) || price <= 0) {
      showWarningToast('Please enter a valid price greater than 0');
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

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) {
      return '0 kr.';
    }
    return `${price} kr.`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate price trend
  const calculateTrend = () => {
    if (priceHistory.length < 2) {
      return { trend: 'neutral', percentage: 0 };
    }

    const sortedHistory = [...priceHistory].sort(
      (a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime()
    );

    const latest = sortedHistory[0]?.price || currentPrice;
    const previous = sortedHistory[1]?.price || currentPrice;

    if (latest > previous) {
      const percentage = ((latest - previous) / previous) * 100;
      return { trend: 'up', percentage };
    } else if (latest < previous) {
      const percentage = ((previous - latest) / previous) * 100;
      return { trend: 'down', percentage };
    }

    return { trend: 'neutral', percentage: 0 };
  };

  const { trend, percentage } = calculateTrend();

  return (
    <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden group'>
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Premium gradient border */}
      <div className='absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>

      <div className='p-8 relative z-10'>
        {/* Context7 Premium Header */}
        <div className='flex items-center justify-between mb-8'>
          <h3 className='text-2xl font-bold text-slate-800 tracking-wide flex items-center'>
            <div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
              <DollarSign className='w-6 h-6 text-white' />
            </div>
            Price History
          </h3>

          {/* Trend Indicator */}
          {trend !== 'neutral' && (
            <div
              className={`flex items-center px-4 py-2 rounded-2xl shadow-lg ${
                trend === 'up'
                  ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200'
                  : 'bg-gradient-to-r from-red-100 to-rose-100 border border-red-200'
              }`}
            >
              {trend === 'up' ? (
                <TrendingUp className='w-4 h-4 text-emerald-600 mr-2' />
              ) : (
                <TrendingDown className='w-4 h-4 text-red-600 mr-2' />
              )}
              <span
                className={`text-sm font-bold ${
                  trend === 'up' ? 'text-emerald-700' : 'text-red-700'
                }`}
              >
                {percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Context7 Premium Current Price Display */}
        <div className='mb-8 p-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-3xl border border-indigo-200/50 shadow-xl relative overflow-hidden group/price'>
          <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5'></div>
          <div className='relative z-10'>
            <div className='text-sm font-bold text-indigo-600 tracking-wide uppercase mb-2 flex items-center'>
              <Calendar className='w-4 h-4 mr-2' />
              Current Market Price
            </div>
            <div className='text-4xl font-bold text-indigo-900 group-hover/price:text-purple-900 transition-colors duration-300'>
              {formatPrice(currentPrice)}
            </div>
          </div>
          {/* Premium shimmer effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/price:translate-x-full transition-transform duration-1000 ease-out'></div>
        </div>

        {/* Context7 Premium Price History List */}
        <div className='space-y-3 mb-8 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent'>
          {priceHistory.length > 0 ? (
            priceHistory
              .sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime())
              .map((entry, index) => (
                <div
                  key={index}
                  className='flex justify-between items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg hover:shadow-xl hover:scale-102 transition-all duration-300 group/item'
                >
                  <div className='flex items-center'>
                    <div className='w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mr-3 animate-pulse'></div>
                    <span className='font-bold text-slate-900 text-lg'>
                      {formatPrice(entry.price)}
                    </span>
                  </div>
                  <div className='flex items-center text-slate-500 group-hover/item:text-slate-700 transition-colors duration-300'>
                    <Calendar className='w-4 h-4 mr-2' />
                    <span className='text-sm font-medium'>{formatDate(entry.dateUpdated)}</span>
                  </div>
                </div>
              ))
          ) : (
            <div className='text-center py-12'>
              <div className='w-20 h-20 bg-gradient-to-br from-slate-100 to-white rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-200/50 shadow-lg'>
                <TrendingUp className='w-8 h-8 text-slate-400' />
              </div>
              <div className='text-lg font-semibold text-slate-600 mb-2'>No Price History</div>
              <div className='text-sm text-slate-500'>
                Start tracking by adding your first price update
              </div>
            </div>
          )}
        </div>

        {/* Context7 Premium Update Price Section */}
        {onPriceUpdate && (
        <div className='border-t border-slate-200/50 pt-8'>
          <div className='flex items-center mb-6'>
            <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg flex items-center justify-center mr-3'>
              <Plus className='w-5 h-5 text-white' />
            </div>
            <div className='text-lg font-bold text-slate-700 tracking-wide'>
              Update Market Price
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                type='text'
                placeholder='Enter new price (e.g., 150.00)'
                value={newPrice}
                onChange={handleInputChange}
                className='w-full'
                startIcon={<DollarSign className='w-4 h-4' />}
              />
            </div>
            <Button
              onClick={handlePriceUpdate}
              disabled={
                !newPrice.trim() || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) <= 0
              }
              className='whitespace-nowrap px-8'
              variant='primary'
            >
              Update Price
            </Button>
          </div>

          <div className='mt-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200/50 shadow-sm'>
            <div className='text-xs text-slate-600 font-medium'>
              💡 <span className='font-bold'>Pro Tip:</span> Regular price updates help track your
              collection's market value over time
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
