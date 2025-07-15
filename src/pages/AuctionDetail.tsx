/**
 * Auction Detail Page
 * Displays detailed view of a single auction with items and management options
 * Phase 9.1 - Auction List & Detail Pages implementation
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, DollarSign, Package, Edit, Trash2, Plus, Check, X, FileText, Download, Copy, Share } from 'lucide-react';
import { useAuction } from '../hooks/useAuction';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import AddItemToAuctionModal from '../components/modals/AddItemToAuctionModal';
import { IAuctionItem } from '../domain/models/auction';

interface AuctionDetailProps {
  auctionId?: string;
}

const AuctionDetail: React.FC<AuctionDetailProps> = ({ auctionId }) => {
  const {
    currentAuction,
    loading,
    error,
    fetchAuctionById,
    deleteAuction,
    addItemToAuction,
    removeItemFromAuction,
    generateFacebookPost,
    downloadAuctionTextFile,
    downloadAuctionImagesZip,
    clearError,
    clearCurrentAuction
  } = useAuction();

  // Get auction ID from URL if not provided as prop
  const [currentAuctionId, setCurrentAuctionId] = useState<string>('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [generatedFacebookPost, setGeneratedFacebookPost] = useState<string>('');
  const [showFacebookPost, setShowFacebookPost] = useState(false);

  useEffect(() => {
    // Extract auction ID from URL
    const pathParts = window.location.pathname.split('/');
    const urlAuctionId = auctionId || pathParts[pathParts.length - 1];
    
    if (urlAuctionId && urlAuctionId !== 'auctions') {
      setCurrentAuctionId(urlAuctionId);
      fetchAuctionById(urlAuctionId);
    }

    return () => {
      clearCurrentAuction();
    };
  }, [auctionId, fetchAuctionById, clearCurrentAuction]);

  // Navigation
  const navigateToAuctions = () => {
    window.history.pushState({}, '', '/auctions');
    window.location.reload();
  };

  const navigateToEditAuction = () => {
    window.history.pushState({}, '', `/auctions/${currentAuctionId}/edit`);
    window.location.reload();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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

  // Get item category color
  const getItemCategoryColor = (category: string) => {
    switch (category) {
      case 'PsaGradedCard':
        return 'bg-purple-100 text-purple-800';
      case 'RawCard':
        return 'bg-blue-100 text-blue-800';
      case 'SealedProduct':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format item category for display
  const formatItemCategory = (category: string) => {
    switch (category) {
      case 'PsaGradedCard':
        return 'PSA Graded Card';
      case 'RawCard':
        return 'Raw Card';
      case 'SealedProduct':
        return 'Sealed Product';
      default:
        return category;
    }
  };

  // Handle delete auction
  const handleDeleteAuction = async () => {
    if (window.confirm('Are you sure you want to delete this auction? This action cannot be undone.')) {
      try {
        await deleteAuction(currentAuctionId);
        navigateToAuctions();
      } catch (err) {
        // Error handled by the hook
      }
    }
  };

  // Handle add items to auction
  const handleAddItems = async (items: { itemId: string; itemCategory: string }[]) => {
    try {
      for (const item of items) {
        await addItemToAuction(currentAuctionId, item);
      }
    } catch (err) {
      // Error handled by the hook
      throw err;
    }
  };

  // Handle remove item from auction
  const handleRemoveItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to remove this item from the auction?')) {
      try {
        await removeItemFromAuction(currentAuctionId, itemId);
      } catch (err) {
        // Error handled by the hook
      }
    }
  };

  // Handle Facebook post generation
  const handleGenerateFacebookPost = async () => {
    try {
      const postText = await generateFacebookPost(currentAuctionId);
      setGeneratedFacebookPost(postText);
      setShowFacebookPost(true);
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedFacebookPost);
      alert('Facebook post copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = generatedFacebookPost;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Facebook post copied to clipboard!');
      } catch (fallbackErr) {
        alert('Failed to copy to clipboard. Please copy manually.');
      }
    }
  };

  // Handle download text file
  const handleDownloadTextFile = async () => {
    try {
      await downloadAuctionTextFile(currentAuctionId);
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Handle download images zip
  const handleDownloadImagesZip = async () => {
    try {
      await downloadAuctionImagesZip(currentAuctionId);
    } catch (err) {
      // Error handled by the hook
    }
  };

  // Calculate progress
  const soldItems = currentAuction?.items.filter(item => item.sold).length || 0;
  const totalItems = currentAuction?.items.length || 0;
  const progress = totalItems > 0 ? (soldItems / totalItems) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner text="Loading auction details..." />
        </div>
      </div>
    );
  }

  if (!currentAuction) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Auction not found</h3>
            <p className="text-gray-600 mb-6">
              The auction you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={navigateToAuctions}>
              Back to Auctions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={navigateToAuctions}
              variant="outline"
              className="inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Auctions
            </Button>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={navigateToEditAuction}
                variant="outline"
                className="inline-flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleDeleteAuction}
                variant="outline"
                className="inline-flex items-center text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentAuction.topText || 'Untitled Auction'}
                </h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentAuction.status)}`}
                >
                  {currentAuction.status.charAt(0).toUpperCase() + currentAuction.status.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">
                {currentAuction.bottomText || 'No description available'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(currentAuction.auctionDate)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Package className="w-4 h-4 mr-2" />
                  <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Total Value: {formatCurrency(currentAuction.totalValue)}</span>
                </div>
              </div>
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

        {/* Progress and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Sales Progress</h3>
              <span className="text-sm font-medium text-gray-900">
                {soldItems}/{totalItems}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {progress.toFixed(1)}% of items sold
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sold Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentAuction.soldValue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Remaining Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(currentAuction.totalValue - currentAuction.soldValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Export and Social Media Tools */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export & Social Media Tools</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Facebook Post Generation */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Facebook Post</h4>
              <div className="space-y-2">
                <Button
                  onClick={handleGenerateFacebookPost}
                  disabled={loading}
                  className="w-full flex items-center justify-center"
                  variant="outline"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Generate Post
                </Button>
                {showFacebookPost && generatedFacebookPost && (
                  <Button
                    onClick={handleCopyToClipboard}
                    className="w-full flex items-center justify-center"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                )}
              </div>
            </div>

            {/* Text File Export */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Text File Export</h4>
              <Button
                onClick={handleDownloadTextFile}
                disabled={loading}
                className="w-full flex items-center justify-center"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download Text File
              </Button>
            </div>

            {/* Images Zip Export */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Image Export</h4>
              <Button
                onClick={handleDownloadImagesZip}
                disabled={loading}
                className="w-full flex items-center justify-center"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Images Zip
              </Button>
            </div>
          </div>

          {/* Generated Facebook Post Display */}
          {showFacebookPost && generatedFacebookPost && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Generated Facebook Post</h4>
                <Button
                  onClick={() => setShowFacebookPost(false)}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <textarea
                  className="w-full h-32 p-3 border-0 bg-transparent resize-none focus:outline-none text-sm"
                  value={generatedFacebookPost}
                  readOnly
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleCopyToClipboard}
                    size="sm"
                    className="flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Auction Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Auction Items ({currentAuction.items.length})
            </h2>
            <Button
              onClick={() => setIsAddItemModalOpen(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Items
            </Button>
          </div>

          {currentAuction.items.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items in auction</h3>
              <p className="text-gray-600 mb-6">
                Add items from your collection to this auction.
              </p>
              <Button
                onClick={() => setIsAddItemModalOpen(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentAuction.items.map((item: IAuctionItem, index: number) => (
                <div key={`${item.itemId}-${index}`} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.itemName || 'Unknown Item'}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getItemCategoryColor(item.itemCategory)}`}
                        >
                          {formatItemCategory(item.itemCategory)}
                        </span>
                        {item.sold && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Sold
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Item ID: {item.itemId}</span>
                        {item.salePrice && (
                          <span>Sale Price: {formatCurrency(item.salePrice)}</span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                      {!item.sold && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                        >
                          Mark Sold
                        </Button>
                      )}
                      <Button
                        onClick={() => handleRemoveItem(item.itemId)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {item.itemImage && (
                    <div className="mt-4">
                      <img
                        src={item.itemImage}
                        alt={item.itemName || 'Item image'}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auction Metadata */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Auction Details</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-600">Created</dt>
              <dd className="text-gray-900">{formatDate(currentAuction.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Last Updated</dt>
              <dd className="text-gray-900">{formatDate(currentAuction.updatedAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">Active Status</dt>
              <dd className="text-gray-900">{currentAuction.isActive ? 'Yes' : 'No'}</dd>
            </div>
            {currentAuction.generatedFacebookPost && (
              <div className="md:col-span-2">
                <dt className="font-medium text-gray-600">Generated Facebook Post</dt>
                <dd className="text-gray-900 mt-1">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">
                      {currentAuction.generatedFacebookPost}
                    </p>
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Add Item to Auction Modal */}
        <AddItemToAuctionModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onAddItems={handleAddItems}
        />
      </div>
    </div>
  );
};

export default AuctionDetail;