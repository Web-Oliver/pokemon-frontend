/**
 * Auctions Page
 * Displays list of auctions with filtering and navigation to detail pages
 * Phase 9.1 - Auction List & Detail Pages implementation
 */

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Package, Filter, X } from 'lucide-react';
import { useAuction } from '../hooks/useAuction';
import { PageLayout } from '../components/layouts/PageLayout';
import { usePageLayout } from '../hooks/usePageLayout';
import { navigationHelper } from '../utils/navigation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { formatDateWithTime } from '../utils/formatting';
import { getStatusColor, getStatusPriority } from '../utils/constants';

const Auctions: React.FC = () => {
  const { auctions, loading, error, fetchAuctions, clearError } = useAuction();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Navigation state (using simple URL management for now)
  const navigateToAuctionDetail = (auctionId: string) => {
    navigationHelper.navigateToAuctionDetail(auctionId);
  };

  const navigateToCreateAuction = () => {
    navigationHelper.navigateToCreate.auction();
  };

  // Filter auctions based on status
  const filteredAuctions = auctions.filter(auction => {
    if (!statusFilter) {
      return true;
    }
    return auction.status === statusFilter;
  });

  // Handle status filter change
  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setStatusFilter(value);
    if (value) {
      fetchAuctions({ status: value });
    } else {
      fetchAuctions();
    }
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('');
    fetchAuctions();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} kr.`;
  };

  // Sort auctions by status priority and date
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return new Date(b.auctionDate).getTime() - new Date(a.auctionDate).getTime();
  });

  // Calculate stats for display
  const activeAuctions = auctions.filter(a => a.status === 'active').length;
  const draftAuctions = auctions.filter(a => a.status === 'draft').length;
  const completedAuctions = auctions.filter(a => a.status === 'sold').length;

  // Auto-refresh auctions when the page becomes visible (for better UX)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAuctions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAuctions]);

  // Debug current auctions state
  useEffect(() => {
    console.log('[Auctions] Current auctions count:', auctions.length);
    console.log(
      '[Auctions] Current auctions:',
      auctions.map(a => ({
        id: a.id || a._id,
        topText: a.topText,
        status: a.status,
      }))
    );
  }, [auctions]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const headerActions = (
    <button
      onClick={navigateToCreateAuction}
      className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-indigo-500/20'
    >
      <Plus className='w-5 h-5 mr-2' />
      Create Auction
    </button>
  );

  return (
    <PageLayout
      title='Auctions'
      subtitle='Manage and track your Pokémon card auctions'
      loading={loading}
      error={error}
      actions={headerActions}
      variant='default'
    >
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-10'>
          {/* Context7 Premium Header */}
          <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-10 relative overflow-hidden group'>
            <div className='absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5'></div>
            <div className='relative z-10 flex items-center justify-between'>
              <div>
                <h1 className='text-4xl font-bold text-zinc-100 tracking-wide mb-3 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'>
                  Auction Management
                </h1>
                <p className='text-xl text-slate-600 font-medium leading-relaxed'>
                  Manage your Pokémon card auctions with award-winning style
                </p>
              </div>
              <div className='flex items-center space-x-3'>
                <Button
                  onClick={() => {
                    console.log('[Auctions] Manual refresh triggered');
                    fetchAuctions();
                  }}
                  variant='outline'
                  className='text-gray-700 border-gray-300 hover:border-gray-400'
                >
                  🔄 Refresh
                </Button>
                <Button
                  onClick={navigateToCreateAuction}
                  className='bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-amber-500/20'
                >
                  <Plus className='w-5 h-5 mr-3' />
                  Create Auction
                </Button>
              </div>
            </div>
            {/* Premium shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
          </div>

          {/* Context7 Premium Auction Stats */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-500 hover:shadow-blue-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <Package className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-blue-600 tracking-wide uppercase mb-1'>
                    Active Auctions
                  </p>
                  <p className='text-3xl font-bold text-zinc-100 group-hover:text-blue-300 transition-colors duration-300'>
                    {activeAuctions}
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-500 hover:shadow-slate-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <Calendar className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-slate-600 tracking-wide uppercase mb-1'>
                    Draft Auctions
                  </p>
                  <p className='text-3xl font-bold text-zinc-100 group-hover:text-zinc-300 transition-colors duration-300'>
                    {draftAuctions}
                  </p>
                </div>
              </div>
            </div>

            <div className='group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-500 hover:shadow-emerald-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <DollarSign className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6'>
                  <p className='text-sm font-bold text-emerald-600 tracking-wide uppercase mb-1'>
                    Completed
                  </p>
                  <p className='text-3xl font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors duration-300'>
                    {completedAuctions}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Premium Filters */}
          <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-8 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-purple-500/3 via-indigo-500/3 to-blue-500/3'></div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-zinc-100 flex items-center tracking-wide'>
                  <div className='w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg flex items-center justify-center mr-4'>
                    <Filter className='w-5 h-5 text-white' />
                  </div>
                  Filters
                </h2>
                {statusFilter && (
                  <Button
                    onClick={clearFilters}
                    variant='outline'
                    size='sm'
                    className='text-slate-600 hover:text-slate-800 border-slate-300 hover:border-slate-400'
                  >
                    <X className='w-4 h-4 mr-1' />
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div>
                  <label className='block text-sm font-bold text-slate-700 mb-3 tracking-wide'>
                    Status
                  </label>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    placeholder='All Statuses'
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: 'draft', label: 'Draft' },
                      { value: 'active', label: 'Active' },
                      { value: 'sold', label: 'Sold' },
                      { value: 'expired', label: 'Expired' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Premium Error Message */}
          {error && (
            <div className='bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 shadow-lg'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg flex items-center justify-center'>
                    <X className='h-5 w-5 text-white' />
                  </div>
                </div>
                <div className='ml-4'>
                  <p className='text-sm text-red-600 font-medium'>{error}</p>
                </div>
                <div className='ml-auto pl-3'>
                  <button
                    onClick={clearError}
                    className='inline-flex text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors'
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Context7 Premium Loading State */}
          {loading && (
            <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-12 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5'></div>
              <div className='relative z-10'>
                <LoadingSpinner text='Loading auctions...' />
              </div>
            </div>
          )}

          {/* Context7 Premium Auctions List */}
          {!loading && (
            <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-amber-500/3 via-orange-500/3 to-red-500/3'></div>
              <div className='relative z-10'>
                <div className='px-8 py-6 border-b border-slate-200/50'>
                  <h2 className='text-2xl font-bold text-zinc-100 tracking-wide'>
                    Auctions ({sortedAuctions.length})
                  </h2>
                </div>

                {sortedAuctions.length === 0 ? (
                  <div className='p-16 text-center'>
                    <div className='w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6'>
                      <Package className='w-10 h-10 text-slate-500' />
                    </div>
                    <h3 className='text-xl font-bold text-zinc-100 mb-3'>No auctions found</h3>
                    <p className='text-slate-600 font-medium max-w-md mx-auto leading-relaxed mb-8'>
                      {statusFilter
                        ? `No auctions found with status "${statusFilter}". Try adjusting your filters.`
                        : 'Get started by creating your first auction.'}
                    </p>
                    <Button
                      onClick={navigateToCreateAuction}
                      className='bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105'
                    >
                      <Plus className='w-5 h-5 mr-3' />
                      Create First Auction
                    </Button>
                  </div>
                ) : (
                  <div className='p-8 space-y-6'>
                    {sortedAuctions.map((auction, index) => (
                      <div
                        key={auction.id || auction._id || `auction-${index}`}
                        className='group bg-zinc-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-zinc-600/40 p-6 hover:bg-zinc-800/80 hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer relative overflow-hidden'
                        onClick={() => navigateToAuctionDetail(auction.id || auction._id)}
                      >
                        <div className='absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                        <div className='relative z-10'>
                          <div className='flex items-center justify-between'>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center space-x-3 mb-3'>
                                <h3 className='text-xl font-bold text-zinc-100 truncate group-hover:text-amber-300 transition-colors duration-300'>
                                  {auction.topText || 'Untitled Auction'}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide ${getStatusColor(auction.status)}`}
                                >
                                  {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                                </span>
                              </div>

                              <p className='text-sm text-slate-600 mb-4 line-clamp-2 font-medium'>
                                {auction.bottomText || 'No description available'}
                              </p>

                              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                                <div className='flex items-center text-slate-600'>
                                  <div className='w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3'>
                                    <Calendar className='w-3 h-3 text-white' />
                                  </div>
                                  <span className='font-medium'>
                                    {formatDateWithTime(auction.auctionDate)}
                                  </span>
                                </div>

                                <div className='flex items-center text-slate-600'>
                                  <div className='w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3'>
                                    <Package className='w-3 h-3 text-white' />
                                  </div>
                                  <span className='font-medium'>
                                    {auction.items.length} item
                                    {auction.items.length !== 1 ? 's' : ''}
                                  </span>
                                </div>

                                <div className='flex items-center text-slate-600'>
                                  <div className='w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3'>
                                    <DollarSign className='w-3 h-3 text-white' />
                                  </div>
                                  <span className='font-medium'>
                                    Total: {formatCurrency(auction.totalValue)}
                                  </span>
                                </div>

                                {auction.soldValue > 0 && (
                                  <div className='flex items-center text-emerald-600'>
                                    <div className='w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3'>
                                      <DollarSign className='w-3 h-3 text-white' />
                                    </div>
                                    <span className='font-bold'>
                                      Sold: {formatCurrency(auction.soldValue)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className='ml-4'>
                              <div className='text-right'>
                                <p className='text-sm text-slate-500 font-medium'>Last updated</p>
                                <p className='text-sm font-bold text-zinc-100'>
                                  {formatDateWithTime(auction.updatedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Auctions;
