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

  // Use search hook - search with empty query when parentId exists to show all items
  const { results, loading } = useSearch(query, {
    searchType,
    parentId,
    minLength: parentId ? 0 : 2, // Allow empty search when parentId exists
  });

  const handleInputChange = (newValue: string) => {
    setQuery(newValue);
    setShowDropdown(newValue.length >= 2 || (parentId && newValue.length >= 0));
    setSelectedIndex(-1);
    onInputChange?.(newValue);
  };

  const handleFocus = () => {
    // If parentId exists (set/setproduct selected), show all items immediately
    if (parentId) {
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else if (query.length >= 2) {
      // Normal case: show dropdown if query is long enough
      setShowDropdown(true);
    }
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
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-300 group-hover:text-cyan-400 transition-colors duration-300" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-cyan-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 hover:bg-white/15 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-center text-cyan-200">
              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2 text-cyan-400" />
              Searching {searchType}...
            </div>
          )}
          
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-center text-cyan-200">
              No {searchType} found for "{query}"
            </div>
          )}
          
          {!loading && results.length === 0 && query.length === 0 && parentId && (
            <div className="px-4 py-3 text-center text-cyan-200">
              No {searchType} found in selected {searchType === 'cards' ? 'set' : 'set product'}
            </div>
          )}
          
          {!loading && query.length < 2 && !parentId && (
            <div className="px-4 py-3 text-center text-cyan-200">
              Type at least 2 characters to search {searchType}...
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={result.id}
              onClick={() => handleSelect(result)}
              className={`px-4 py-3 cursor-pointer transition-all duration-300 ${
                index === selectedIndex
                  ? 'bg-cyan-400/20 text-white border-l-4 border-cyan-400 backdrop-blur-sm'
                  : 'hover:bg-white/10 text-white hover:backdrop-blur-sm'
              }`}
            >
              <div className="font-medium">{result.displayName}</div>
              {(() => {
                try {
                  // Safe property access to prevent circular references
                  let setName = '';
                  if (result.data?.setName) {
                    setName = String(result.data.setName);
                  } else if (result.data?.setId && typeof result.data.setId === 'object' && result.data.setId.setName) {
                    setName = String(result.data.setId.setName);
                  }
                  
                  if (setName && result.type !== 'set') {
                    return (
                      <div className="text-xs text-cyan-200/70 mt-1">
                        Set: {setName}
                      </div>
                    );
                  }
                  return null;
                } catch (error) {
                  console.warn('[SEARCH INPUT] Error accessing set name:', error);
                  return null;
                }
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;