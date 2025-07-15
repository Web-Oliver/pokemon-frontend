/**
 * MainLayout Component - Context7 Award-Winning Modern Design
 *
 * Ultra-modern navigation with vibrant colors, perfect spacing, and premium animations.
 * This fixes all the 2009-era problems with proper Context7 design system.
 */

import React from 'react';
import { Home, Package, Search, TrendingUp, Gavel, Menu, X, Zap, Sparkles } from 'lucide-react';
import { useSearch } from '../../hooks/useSearch';
import SearchDropdown from '../search/SearchDropdown';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  textColor: string;
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
    activeField,
  } = useSearch();

  // Context7 Modern Navigation with Vibrant Colors
  const navigation: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      color: 'from-emerald-400 to-cyan-400',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-cyan-500',
      textColor: 'text-emerald-600'
    },
    { 
      name: 'Collection', 
      href: '/collection', 
      icon: Package, 
      color: 'from-blue-400 to-indigo-400',
      bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-500',
      textColor: 'text-blue-600'
    },
    { 
      name: 'Search', 
      href: '/search', 
      icon: Search, 
      color: 'from-purple-400 to-pink-400',
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
      textColor: 'text-purple-600'
    },
    { 
      name: 'Auctions', 
      href: '/auctions', 
      icon: Gavel, 
      color: 'from-orange-400 to-red-400',
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      textColor: 'text-orange-600'
    },
    { 
      name: 'Analytics', 
      href: '/sales-analytics', 
      icon: TrendingUp, 
      color: 'from-violet-400 to-purple-400',
      bgColor: 'bg-gradient-to-br from-violet-500 to-purple-500',
      textColor: 'text-violet-600'
    },
  ];

  const currentPath = window.location.pathname;

  const handleNavigation = (href: string) => {
    window.history.pushState({}, '', href);
    setSidebarOpen(false);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardProductName.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(cardProductName.trim())}`;
      handleNavigation(searchUrl);
    }
  };

  const handleSearchSelect = (
    suggestion: { cardName?: string; name?: string } | string,
    fieldType: 'set' | 'category' | 'cardProduct'
  ) => {
    const searchTerm = suggestion.cardName || suggestion.name || suggestion;
    handleSuggestionSelect(suggestion, fieldType);
    setShowGlobalSearch(false);
    setActiveField(null);
    const searchUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
    handleNavigation(searchUrl);
  };

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

  const handleGlobalSearchFocus = () => {
    setActiveField('cardProduct');
    if (cardProductName.length > 0) {
      setShowGlobalSearch(true);
    }
  };

  const handleGlobalSearchBlur = () => {
    setTimeout(() => {
      setShowGlobalSearch(false);
      setActiveField(null);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Context7 Modern Sidebar - Fixed Width, No Overflow */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl border-r border-gray-200">
          
          {/* Modern Header with Proper Spacing */}
          <div className="relative h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10" />
            <div className="relative z-10 flex items-center justify-between h-full px-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">PokéCollection</h1>
                  <p className="text-xs text-indigo-200">Premium Edition</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modern Navigation with Proper Spacing */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = currentPath === item.href;
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? `${item.bgColor} text-white shadow-lg scale-105`
                      : `text-gray-700 hover:bg-gray-50 hover:${item.textColor}`
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  <span className="truncate">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto">
                      <Zap className="w-4 h-4 text-white/80" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Modern Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>v1.0.0 Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Proper Spacing, No Overflow */}
      <div className="lg:pl-64">
        {/* Modern Header Bar */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex h-16 items-center justify-between px-6">
            
            {/* Mobile Menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page Title */}
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.href === currentPath)?.name || 'Dashboard'}
              </h1>
            </div>

            {/* Modern Search Bar */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cards, sets, products..."
                    value={cardProductName}
                    onChange={handleGlobalSearchChange}
                    onFocus={handleGlobalSearchFocus}
                    onBlur={handleGlobalSearchBlur}
                    className="w-72 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </form>

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
        </header>

        {/* Main Content - Proper Spacing */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;