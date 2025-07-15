/**
 * Auctions Page
 * Displays list of auctions with filtering and navigation to detail pages
 * Phase 9.1 - Auction List & Detail Pages implementation
 */

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Package, Filter, X } from 'lucide-react';
import { useAuction } from '../hooks/useAuction';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Select from '../components/common/Select';

const Auctions: React.FC = () => {
  const {
    auctions,
    loading,
    error,
    fetchAuctions,
    clearError
  } = useAuction();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Navigation state (using simple URL management for now)
  const navigateToAuctionDetail = (auctionId: string) => {
    window.history.pushState({}, '', `/auctions/${auctionId}`);
    window.location.reload();
  };

  const navigateToCreateAuction = () => {
    window.history.pushState({}, '', '/auctions/create');
    window.location.reload();
  };

  // Filter auctions based on status
  const filteredAuctions = auctions.filter(auction => {
    if (!statusFilter) return true;
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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'sold':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status priority for sorting
  const getStatusPriority = (status: string) => {
    switch (status) {
      case 'active': return 1;
      case 'draft': return 2;
      case 'sold': return 3;
      case 'expired': return 4;
      default: return 5;
    }
  };

  // Sort auctions by status priority and date
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.auctionDate).getTime() - new Date(a.auctionDate).getTime();
  });

  // Calculate stats for display
  const activeAuctions = auctions.filter(a => a.status === 'active').length;
  const draftAuctions = auctions.filter(a => a.status === 'draft').length;
  const completedAuctions = auctions.filter(a => a.status === 'sold').length;

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
              <p className="text-gray-600 mt-1">Manage your Pokemon card auctions</p>
            </div>
            <Button
              onClick={navigateToCreateAuction}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Auction
            </Button>
          </div>
        </div>

        {/* Auction Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                <p className="text-2xl font-bold text-gray-900">{activeAuctions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft Auctions</p>
                <p className="text-2xl font-bold text-gray-900">{draftAuctions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedAuctions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h2>
            {statusFilter && (
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                placeholder="All Statuses"
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'active', label: 'Active' },
                  { value: 'sold', label: 'Sold' },
                  { value: 'expired', label: 'Expired' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={clearError}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-6">
            <LoadingSpinner text="Loading auctions..." />
          </div>
        )}

        {/* Auctions List */}
        {!loading && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Auctions ({sortedAuctions.length})
              </h2>
            </div>

            {sortedAuctions.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
                <p className="text-gray-600 mb-6">
                  {statusFilter ? 
                    `No auctions found with status "${statusFilter}". Try adjusting your filters.` :
                    'Get started by creating your first auction.'
                  }
                </p>
                <Button
                  onClick={navigateToCreateAuction}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Auction
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sortedAuctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigateToAuctionDetail(auction.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {auction.topText || 'Untitled Auction'}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}
                          >
                            {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {auction.bottomText || 'No description available'}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(auction.auctionDate)}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <Package className="w-4 h-4 mr-2" />
                            <span>{auction.items.length} item{auction.items.length !== 1 ? 's' : ''}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>Total: {formatCurrency(auction.totalValue)}</span>
                          </div>
                          
                          {auction.soldValue > 0 && (
                            <div className="flex items-center text-green-600">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Sold: {formatCurrency(auction.soldValue)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Last updated</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(auction.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Auctions;