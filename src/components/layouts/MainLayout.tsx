/**
 * MainLayout Component - Context7 Award-Winning Modern Design
 *
 * Ultra-modern navigation with vibrant colors, perfect spacing, and premium animations.
 * This fixes all the 2009-era problems with proper Context7 design system.
 */

import React from 'react';
import {
  ChevronDown,
  Database,
  Facebook,
  Gavel,
  Home,
  Menu,
  Package,
  Package2,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  textColor: string;
  dropdown?: DropdownItem[];
}

interface DropdownItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState<string | null>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        const target = event.target as HTMLElement;
        const dropdown = target.closest('[data-dropdown]');
        if (!dropdown) {
          setDropdownOpen(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  // Dark Futuristic Navigation - Cursor.com Style
  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      color: 'from-cyan-400 to-blue-400',
      bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-600',
      textColor: 'text-cyan-400',
    },
    {
      name: 'Collection',
      href: '/collection',
      icon: Package,
      color: 'from-blue-400 to-purple-400',
      bgColor: 'bg-gradient-to-br from-blue-500 to-purple-600',
      textColor: 'text-blue-400',
    },
    {
      name: 'Add Item',
      href: '/add-item',
      icon: Plus,
      color: 'from-emerald-400 to-cyan-400',
      bgColor: 'bg-gradient-to-br from-emerald-500 to-cyan-500',
      textColor: 'text-emerald-400',
    },
    {
      name: 'Search References',
      icon: Search,
      color: 'from-indigo-400 to-purple-400',
      bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      textColor: 'text-indigo-400',
      dropdown: [
        {
          name: 'Set Search',
          href: '/set-search',
          icon: Database,
        },
        {
          name: 'Sealed Products',
          href: '/sealed-products-search',
          icon: Package2,
        },
      ],
    },
    {
      name: 'Auctions',
      href: '/auctions',
      icon: Gavel,
      color: 'from-orange-400 to-red-400',
      bgColor: 'bg-gradient-to-br from-orange-500 to-red-500',
      textColor: 'text-orange-400',
    },
    {
      name: 'DBA/Facebook',
      icon: Facebook,
      color: 'from-teal-400 to-cyan-400',
      bgColor: 'bg-gradient-to-br from-teal-500 to-cyan-500',
      textColor: 'text-teal-400',
      dropdown: [
        {
          name: 'Create DBA Posts',
          href: '/dba-export',
          icon: Plus,
        },
        {
          name: 'Create Auction',
          href: '/auctions/create',
          icon: Gavel,
        },
      ],
    },
    {
      name: 'Analytics',
      href: '/sales-analytics',
      icon: TrendingUp,
      color: 'from-violet-400 to-purple-400',
      bgColor: 'bg-gradient-to-br from-violet-500 to-purple-600',
      textColor: 'text-violet-400',
    },
  ];

  const currentPath = window.location.pathname;

  const handleNavigation = (href: string) => {
    window.history.pushState({}, '', href);
    setSidebarOpen(false);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Top Navigation Bar - Dark Futuristic */}
      <header className="bg-white/90 dark:bg-zinc-900/90 dark:bg-zinc-950/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-2xl border-b border-gray-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50 dark:border-zinc-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo - Stunning Modern Design */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 dark:shadow-cyan-500/25 shadow-blue-500/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-zinc-200 dark:text-zinc-100 dark:text-white">
                  PokéCollection
                </h1>
                <p className="text-xs text-gray-500 dark:text-zinc-500 dark:text-zinc-400 dark:text-zinc-400">
                  Professional Edition
                </p>
              </div>
            </div>

            {/* Desktop Navigation - Scrollable */}
            <nav className="hidden md:flex items-center space-x-1 overflow-visible flex-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                // Handle dropdown items
                if (item.dropdown) {
                  const isDropdownActive = item.dropdown.some(
                    (dropItem) => currentPath === dropItem.href
                  );
                  const isDropdownOpen = dropdownOpen === item.name;

                  return (
                    <div key={item.name} className="relative" data-dropdown>
                      <button
                        onClick={() =>
                          setDropdownOpen(isDropdownOpen ? null : item.name)
                        }
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-300 whitespace-nowrap ${
                          isDropdownActive
                            ? `${item.bgColor} text-white shadow-lg shadow-cyan-500/25 dark:shadow-cyan-500/25 shadow-blue-500/20 scale-105`
                            : `text-gray-600 dark:text-zinc-300 hover:bg-gray-100/80 dark:hover:bg-zinc-800/50 hover:${item.textColor} hover:shadow-lg backdrop-blur-sm`
                        }`}
                        aria-label={`Toggle ${item.name} menu`}
                      >
                        <Icon
                          className={`w-4 h-4 mr-2 ${isDropdownActive ? 'text-white' : 'text-gray-400 dark:text-zinc-400'}`}
                        />
                        <span className="text-xs">{item.name}</span>
                        <ChevronDown
                          className={`w-3 h-3 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''} ${isDropdownActive ? 'text-white/80' : 'text-zinc-400'}`}
                        />
                      </button>

                      {/* Dropdown Menu - Dark Futuristic */}
                      {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-1 w-48 bg-zinc-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-700/50 py-2 z-50">
                          {item.dropdown.map((dropItem) => {
                            const DropIcon = dropItem.icon;
                            const isActive = currentPath === dropItem.href;

                            return (
                              <button
                                key={dropItem.name}
                                onClick={() => {
                                  handleNavigation(dropItem.href);
                                  setDropdownOpen(null);
                                }}
                                className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg' : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-cyan-400'}`}
                              >
                                <DropIcon
                                  className={`w-4 h-4 mr-3 ${isActive ? 'text-cyan-400' : 'text-zinc-400'}`}
                                />
                                {dropItem.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Handle regular navigation items
                const isActive = currentPath === item.href;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href!)}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? `${item.bgColor} text-white shadow-lg shadow-cyan-500/25 scale-105`
                        : `text-zinc-300 hover:bg-zinc-800/50 hover:${item.textColor} hover:shadow-lg backdrop-blur-sm`
                    }`}
                    aria-label={`Navigate to ${item.name}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 mr-2 ${isActive ? 'text-white' : 'text-zinc-400'}`}
                    />
                    <span className="text-xs">{item.name}</span>
                    {isActive && <Zap className="w-3 h-3 ml-1 text-white/80" />}
                  </button>
                );
              })}
            </nav>

            {/* Right Side - Theme Toggle & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Menu Button - Dark */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 text-zinc-300 hover:text-cyan-400 hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                aria-label="Toggle mobile menu"
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Dark */}
          {sidebarOpen && (
            <div className="md:hidden py-4 border-t border-zinc-700/50 bg-zinc-950/95 backdrop-blur-xl">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  // Handle dropdown items for mobile
                  if (item.dropdown) {
                    const isDropdownActive = item.dropdown.some(
                      (dropItem) => currentPath === dropItem.href
                    );
                    const isMobileDropdownOpen = dropdownOpen === item.name;

                    return (
                      <div key={item.name} className="space-y-2">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              isMobileDropdownOpen ? null : item.name
                            )
                          }
                          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isDropdownActive
                              ? `${item.bgColor} text-white shadow-lg shadow-cyan-500/25`
                              : `text-zinc-300 hover:bg-zinc-800/50 hover:${item.textColor}`
                          }`}
                          aria-label={`Toggle ${item.name} menu`}
                        >
                          <Icon
                            className={`w-5 h-5 mr-3 ${isDropdownActive ? 'text-white' : 'text-zinc-400'}`}
                          />
                          <span>{item.name}</span>
                          <ChevronDown
                            className={`w-4 h-4 ml-auto transition-transform duration-200 ${isMobileDropdownOpen ? 'rotate-180' : ''} ${isDropdownActive ? 'text-white/80' : 'text-zinc-400'}`}
                          />
                        </button>

                        {/* Mobile Dropdown Items */}
                        {isMobileDropdownOpen && (
                          <div className="ml-6 space-y-1">
                            {item.dropdown.map((dropItem) => {
                              const DropIcon = dropItem.icon;
                              const isActive = currentPath === dropItem.href;

                              return (
                                <button
                                  key={dropItem.name}
                                  onClick={() => {
                                    handleNavigation(dropItem.href);
                                    setSidebarOpen(false);
                                    setDropdownOpen(null);
                                  }}
                                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-sm' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-cyan-400'}`}
                                >
                                  <DropIcon
                                    className={`w-4 h-4 mr-3 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`}
                                  />
                                  <span>{dropItem.name}</span>
                                  {isActive && (
                                    <Zap className="w-3 h-3 ml-auto text-cyan-400" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Handle regular navigation items for mobile
                  const isActive = currentPath === item.href;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        handleNavigation(item.href!);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? `${item.bgColor} text-white shadow-lg shadow-cyan-500/25`
                          : `text-zinc-300 hover:bg-zinc-800/50 hover:${item.textColor}`
                      }`}
                      aria-label={`Navigate to ${item.name}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-zinc-400'}`}
                      />
                      <span>{item.name}</span>
                      {isActive && (
                        <Zap className="w-4 h-4 ml-auto text-white/80" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Version Info - Dark */}
              <div className="mt-4 px-4 pt-4 border-t border-zinc-700/50">
                <div className="flex items-center justify-center space-x-2 text-sm text-zinc-400">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>v1.0.0 Futuristic</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
