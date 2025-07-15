/**
 * MainLayout Component - Context7 Award-Winning Design
 * 
 * Ultra-premium application layout with stunning visual hierarchy and micro-interactions.
 * Features glass-morphism, premium gradients, and award-winning Context7 design patterns.
 * 
 * Following CLAUDE.md + Context7 principles:
 * - Stunning visual hierarchy with premium materials
 * - Glass-morphism and depth with floating elements
 * - Award-winning micro-interactions and animations
 * - Premium color palettes and gradients
 * - Context7 design system compliance
 */

import React from 'react';
import { 
  Home, 
  Package, 
  Search, 
  TrendingUp, 
  Gavel,
  Menu,
  X
} from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import SearchDropdown from '../search/SearchDropdown';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = React.useState(false);
  const { 
    cardProductName, 
    suggestions, 
    loading: searchLoading,
    updateCardProductName,
    handleSuggestionSelect,
    setActiveField,
    activeField 
  } = useSearch();

  // Navigation items for the main menu
  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Collection', href: '/collection', icon: Package },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Auctions', href: '/auctions', icon: Gavel },
    { name: 'Analytics', href: '/sales-analytics', icon: TrendingUp },
  ];

  // Get current path for active navigation highlighting
  const currentPath = window.location.pathname;

  const handleNavigation = (href: string) => {
    window.history.pushState({}, '', href);
    setSidebarOpen(false);
    // Trigger a custom event to notify App.tsx of navigation changes
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardProductName.trim()) {
      // Navigate to search page with query parameter
      const searchUrl = `/search?q=${encodeURIComponent(cardProductName.trim())}`;
      handleNavigation(searchUrl);
    }
  };

  const handleSearchSelect = (suggestion: any, fieldType: 'set' | 'category' | 'cardProduct') => {
    const searchTerm = suggestion.cardName || suggestion.name || suggestion;
    handleSuggestionSelect(suggestion, fieldType);
    setShowGlobalSearch(false);
    setActiveField(null);
    // Navigate to search page with the selected term
    const searchUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
    handleNavigation(searchUrl);
  };

  // Handle global search input changes
  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateCardProductName(value);
    if (value.length > 0) {
      setShowGlobalSearch(true);
      setActiveField('cardProduct');
    } else {
      setShowGlobalSearch(false);
      setActiveField(null);
    }
  };

  // Handle global search focus
  const handleGlobalSearchFocus = () => {
    setActiveField('cardProduct');
    if (cardProductName.length > 0) {
      setShowGlobalSearch(true);
    }
  };

  // Handle global search blur
  const handleGlobalSearchBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowGlobalSearch(false);
      setActiveField(null);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Context7 Premium Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      {/* Mobile sidebar overlay with premium blur */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Context7 Premium Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-xl shadow-2xl border-r border-slate-200/50 transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Context7 Premium Logo/Header */}
          <div className="relative flex items-center justify-between h-16 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 overflow-hidden">
            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            
            <div className="flex items-center relative z-10">
              <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center border border-white/20 group hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 text-indigo-600 group-hover:text-purple-600 transition-colors duration-300" />
              </div>
              <div className="ml-3">
                <span className="text-white font-bold text-lg tracking-wide drop-shadow-sm">
                  PokéCollection
                </span>
                <div className="text-white/70 text-xs font-medium">Premium Edition</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-gray-300"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Context7 Premium Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-3">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center px-4 py-4 text-left rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 text-indigo-700 shadow-xl border border-indigo-200/50 transform scale-105'
                      : 'text-slate-700 hover:bg-white/60 hover:text-slate-900 hover:shadow-lg hover:backdrop-blur-sm hover:border hover:border-white/30 hover:scale-102'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-purple-500/10 animate-pulse"></div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center relative z-10 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg' 
                      : 'bg-slate-100 group-hover:bg-white group-hover:shadow-md'
                  }`}>
                    <Icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                    }`} />
                  </div>
                  
                  <div className="ml-4 relative z-10">
                    <span className="font-semibold tracking-wide">{item.name}</span>
                    {isActive && (
                      <div className="text-xs text-indigo-500 font-medium">Active</div>
                    )}
                  </div>
                  
                  {isActive && (
                    <div className="ml-auto relative z-10">
                      <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg animate-pulse" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Context7 Premium Footer */}
          <div className="p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-white/50 backdrop-blur-sm">
            <div className="text-center space-y-2">
              <div className="text-xs font-semibold text-slate-600 tracking-wide">
                v1.0.0 Premium
              </div>
              <div className="text-xs text-slate-500">
                Pokémon Collection Manager
              </div>
              <div className="flex justify-center space-x-1">
                <div className="w-1 h-1 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Context7 Premium Top Header Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-slate-200/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent"></div>
          <div className="flex items-center justify-between h-16 px-6 relative z-10">
            {/* Context7 Premium Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-lg rounded-xl backdrop-blur-sm border border-transparent hover:border-white/30 transition-all duration-300 group"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            </button>

            {/* Context7 Premium Page Title */}
            <div className="flex items-center">
              <div className="relative">
                <h1 className="text-xl font-bold text-slate-900 tracking-wide">
                  {navigation.find(item => item.href === currentPath)?.name || 'Dashboard'}
                </h1>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 opacity-60"></div>
              </div>
            </div>

            {/* Context7 Premium Global Search Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                      <Search className="text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors duration-300" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search cards, sets, products..."
                      value={cardProductName}
                      onChange={handleGlobalSearchChange}
                      onFocus={handleGlobalSearchFocus}
                      onBlur={handleGlobalSearchBlur}
                      className="pl-12 pr-6 py-3 w-72 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white outline-none transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-2xl placeholder-slate-400 text-slate-700 font-medium"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    {searchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                </form>

                {/* Context7 Award-Winning Global Search Dropdown */}
                <SearchDropdown
                  suggestions={suggestions}
                  isVisible={showGlobalSearch}
                  activeField={activeField}
                  onSuggestionSelect={handleSearchSelect}
                  onClose={() => {
                    setShowGlobalSearch(false);
                    setActiveField(null);
                  }}
                  searchTerm={cardProductName}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;