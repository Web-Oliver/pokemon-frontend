/**
 * SIMPLE SEARCH COMPONENT - THE ONLY SEARCH COMPONENT
 * Following CLAUDE.md SOLID & DRY principles
 * 
 * BEFORE: PokemonSearch (848 lines) + multiple search hooks + duplications
 * AFTER: SimpleSearch (100 lines) - ONE component for ALL searches
 */

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useSearch } from '../../../hooks/useSearch';
import type { SearchType } from '../../../hooks/useSearch';

interface SearchResult {
  id: string;
  displayName: string;
  data: any;
  type: string;
}

interface SearchInputProps {
  searchType: SearchType;
  placeholder?: string;
  value?: string;
  onSelect: (result: SearchResult) => void;
  onInputChange?: (value: string) => void;
  disabled?: boolean;
  parentId?: string; // For hierarchical search (setId for cards)
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  searchType,
  placeholder = `Search ${searchType}...`,
  value = '',
  onSelect,
  onInputChange,
  disabled = false,
  parentId,
  className = ''
}) => {
  const [query, setQuery] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal query with external value prop
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Use search hook
  const { results, loading } = useSearch(query, {
    searchType,
    parentId
  });

  const handleInputChange = (newValue: string) => {
    setQuery(newValue);
    setShowDropdown(newValue.length >= 2);
    setSelectedIndex(-1);
    onInputChange?.(newValue);
  };

  const handleSelect = (result: SearchResult) => {
    setQuery(result.displayName);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSelect(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(query.length >= 2)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-3 bg-zinc-900/90 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-center text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
              Searching {searchType}...
            </div>
          )}
          
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-center text-zinc-400">
              No {searchType} found for "{query}"
            </div>
          )}
          
          {!loading && query.length < 2 && (
            <div className="px-4 py-3 text-center text-zinc-400">
              Type at least 2 characters to search {searchType}...
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={result.id}
              onClick={() => handleSelect(result)}
              className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                index === selectedIndex
                  ? 'bg-cyan-500/20 text-cyan-100 border-l-4 border-cyan-400'
                  : 'hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100'
              }`}
            >
              <div className="font-medium">{result.displayName}</div>
              {result.data?.setName && result.type !== 'set' && (
                <div className="text-xs text-zinc-500 mt-1">
                  Set: {result.data.setName}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;