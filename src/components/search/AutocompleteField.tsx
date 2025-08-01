/**
 * Context7 Award-Winning Autocomplete Field Component
 * Ultra-premium search input with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating elements
 * - Premium gradients and color palettes
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, X, Sparkles, Zap } from 'lucide-react';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { SearchResult } from '../../hooks/useSearch';

export interface AutocompleteFieldProps {
  searchType: 'sets' | 'products' | 'cards';
  placeholder?: string;
  value?: string;
  onSelect: (result: SearchResult) => void;
  filters?: { setName?: string; category?: string };
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

/**
 * Autocomplete Field Component
 * Provides focused autocomplete functionality with clean UI
 */
export const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  searchType,
  placeholder = 'Search...',
  value = '',
  onSelect,
  filters,
  disabled = false,
  className = '',
  label,
  error,
  required = false,
  onFocusChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocomplete = useAutocomplete(searchType, onSelect, filters, disabled);

  // Sync external value with internal state - avoid infinite loops
  useEffect(() => {
    if (value !== autocomplete.value) {
      autocomplete.setValue(value);
    }
  }, [value]); // Only depend on external value prop

  // Handle keyboard navigation - memoized for performance
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!autocomplete.isOpen) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          autocomplete.moveDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          autocomplete.moveUp();
          break;
        case 'Enter':
          e.preventDefault();
          autocomplete.selectActive();
          break;
        case 'Escape':
          e.preventDefault();
          autocomplete.close();
          inputRef.current?.blur();
          break;
      }
    },
    [
      autocomplete.isOpen,
      autocomplete.moveDown,
      autocomplete.moveUp,
      autocomplete.selectActive,
      autocomplete.close,
    ]
  );

  return (
    <div className={`relative ${className}`}>
      {/* Context7 Premium Label */}
      {label && (
        <label className="block text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10">
            <Sparkles className="w-3 h-3 text-blue-400" />
          </div>
          <span>{label}</span>
          {required && <span className="text-red-400 ml-1 font-bold">*</span>}
        </label>
      )}

      {/* Context7 Premium Input Container */}
      <div className="relative">
        {/* Background Glass Effects */}
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-[1.5rem] blur-xl opacity-60"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-cyan-400/5 rounded-[1.2rem] blur-md"></div>

        <div className="relative bg-black/40 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden group">
          {/* Floating Orbs */}
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
          <div
            className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 rounded-full blur-lg animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"
            style={{ animationDelay: '0.5s' }}
          ></div>

          {/* Premium Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 shadow-lg group-focus-within:scale-110 group-focus-within:rotate-3 transition-all duration-300">
              <Search className="h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors duration-300" />
            </div>
          </div>

          {/* Premium Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={autocomplete.value}
            onChange={(e) => autocomplete.setValue(e.target.value)}
            onFocus={useCallback(
              (e) => {
                autocomplete.onFocus();
                onFocusChange?.(true);
              },
              [autocomplete.onFocus, onFocusChange]
            )}
            onBlur={useCallback(
              (e) => {
                autocomplete.onBlur();
                onFocusChange?.(false);
              },
              [autocomplete.onBlur, onFocusChange]
            )}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              relative z-10 block w-full pl-20 pr-20 py-4 bg-transparent border-none
              text-white placeholder-white/50 font-medium text-lg
              focus:ring-0 focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'placeholder-red-300' : ''}
            `}
          />

          {/* Premium Clear Button */}
          {autocomplete.value && !disabled && (
            <button
              type="button"
              onClick={useCallback(() => {
                autocomplete.clear();
                onSelect({
                  _id: '',
                  displayName: '',
                  type:
                    searchType === 'sets'
                      ? 'set'
                      : searchType === 'products'
                        ? 'product'
                        : 'card',
                  data: {},
                } as SearchResult);
              }, [autocomplete.clear, onSelect, searchType])}
              className="absolute inset-y-0 right-16 flex items-center group/clear z-10"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-white/10 shadow-lg hover:scale-110 hover:rotate-3 transition-all duration-300 opacity-70 group-hover/clear:opacity-100">
                <X className="h-4 w-4 text-red-400 group-hover/clear:text-red-300 transition-colors duration-300" />
              </div>
            </button>
          )}

          {/* Premium Loading Indicator */}
          {autocomplete.loading && (
            <div className="absolute inset-y-0 right-4 flex items-center z-10">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 bg-blue-500/10 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Premium Dropdown Indicator */}
          {!autocomplete.loading && autocomplete.results.length > 0 && (
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-10">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-600/20 backdrop-blur-xl border border-white/10 shadow-lg animate-bounce">
                <ChevronDown className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
          )}

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-focus-within:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>

          {/* Breathing Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl animate-pulse opacity-40 pointer-events-none group-focus-within:opacity-60 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Context7 Premium Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-gradient-to-r from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-lg flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-xl border border-white/10">
            <Sparkles className="w-3 h-3 text-red-400" />
          </div>
          <p className="text-sm text-red-300 font-medium">{error}</p>
        </div>
      )}

      {/* Context7 Premium Search Error */}
      {autocomplete.error && (
        <div className="mt-3 p-3 bg-gradient-to-r from-orange-500/20 to-red-600/20 backdrop-blur-xl border border-orange-500/30 rounded-xl shadow-lg flex items-center space-x-2">
          <div className="p-1 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl border border-white/10">
            <Zap className="w-3 h-3 text-orange-400" />
          </div>
          <p className="text-sm text-orange-300 font-medium">
            {autocomplete.error}
          </p>
        </div>
      )}

      {/* Context7 Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gradient-to-r from-slate-500/20 to-zinc-600/20 backdrop-blur-xl border border-slate-500/30 rounded-lg shadow-lg">
          <p className="text-xs text-slate-300 font-mono">
            Debug: isOpen={String(autocomplete.isOpen)}, results=
            {autocomplete.results.length}, loading=
            {String(autocomplete.loading)}, error={autocomplete.error || 'none'}
          </p>
        </div>
      )}

      {/* Context7 Premium Dropdown */}
      {autocomplete.isOpen && autocomplete.results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-3">
          {/* Background Glass Effects */}
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-[1.5rem] blur-xl opacity-60"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/5 via-blue-400/5 to-purple-400/5 rounded-[1.2rem] blur-md"></div>

          <div className="relative bg-black/40 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden max-h-80">
            {/* Floating Orbs */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse"></div>
            <div
              className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-lg animate-pulse"
              style={{ animationDelay: '1s' }}
            ></div>

            <div className="p-2 space-y-1 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent relative z-10">
              {autocomplete.results.map((result, index) => (
                <div
                  key={result._id}
                  onMouseDown={useCallback(
                    (e) => {
                      e.preventDefault();
                      autocomplete.selectResult(result);
                    },
                    [autocomplete.selectResult, result]
                  )}
                  className={`group cursor-pointer select-none relative p-4 rounded-xl transition-all duration-300 transform hover:scale-102 overflow-hidden ${
                    index === autocomplete.activeIndex
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg'
                      : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                  }`}
                >
                  {/* Premium Gradient Overlay for Active */}
                  {index === autocomplete.activeIndex && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
                  )}

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex-1 min-w-0 space-y-1">
                      <span
                        className={`block font-semibold text-lg truncate pr-4 ${
                          index === autocomplete.activeIndex
                            ? 'text-white'
                            : 'text-white/90'
                        }`}
                      >
                        {result.displayName}
                      </span>

                      {/* Premium Metadata */}
                      <div className="flex flex-wrap items-center gap-2">
                        {result.data?.setName && result.type !== 'set' && (
                          <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-semibold">
                            <Search className="w-3 h-3 mr-1" />
                            {result.data.setName}
                          </div>
                        )}
                        {result.data?.category && (
                          <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500/20 to-violet-600/20 backdrop-blur-xl border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {result.data.category}
                          </div>
                        )}
                        {result.data?.year && (
                          <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-slate-500/20 to-zinc-600/20 backdrop-blur-xl border border-slate-500/30 rounded-lg text-xs text-slate-300 font-semibold">
                            {result.data.year}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Premium Type Badge */}
                    <div
                      className={`flex-shrink-0 ml-4 px-3 py-1.5 rounded-xl font-bold text-xs shadow-lg backdrop-blur-xl border ${
                        result.type === 'set'
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border-blue-500/30 text-blue-300'
                          : result.type === 'product'
                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border-emerald-500/30 text-emerald-300'
                            : 'bg-gradient-to-r from-purple-500/20 to-violet-600/20 border-purple-500/30 text-purple-300'
                      }`}
                    >
                      {result.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Breathing Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl animate-pulse opacity-40 pointer-events-none"></div>
          </div>
        </div>
      )}

      {/* Context7 Premium No Results */}
      {autocomplete.isOpen &&
        autocomplete.value.trim().length >= 1 &&
        autocomplete.results.length === 0 &&
        !autocomplete.loading && (
          <div className="absolute top-full left-0 right-0 z-50 mt-3">
            {/* Background Glass Effects */}
            <div className="absolute -inset-2 bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-zinc-500/10 rounded-[1.5rem] blur-xl opacity-60"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-400/5 via-gray-400/5 to-zinc-400/5 rounded-[1.2rem] blur-md"></div>

            <div className="relative bg-black/40 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5 overflow-hidden">
              {/* Floating Orbs */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-full blur-xl animate-pulse"></div>
              <div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-zinc-500/10 to-slate-500/10 rounded-full blur-lg animate-pulse"
                style={{ animationDelay: '1s' }}
              ></div>

              <div className="p-8 text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-2xl flex items-center justify-center mx-auto border border-white/10 shadow-lg">
                    <Search className="w-8 h-8 text-white/60" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-3xl blur-xl opacity-50"></div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No results found
                </h3>
                <p className="text-white/60 text-sm font-medium">
                  Try adjusting your search terms or check spelling
                </p>
              </div>

              {/* Breathing Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 via-gray-500/5 to-zinc-500/5 rounded-2xl animate-pulse opacity-40 pointer-events-none"></div>
            </div>
          </div>
        )}
    </div>
  );
};
