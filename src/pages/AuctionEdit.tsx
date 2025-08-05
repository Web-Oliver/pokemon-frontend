/**
 * Auction Edit Page
 * Edit auction details, manage items, and update auction settings
 * Following CLAUDE.md Layer 4 (Views/Pages) principles
 */

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Edit3,
  Package,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageLayout } from '../components/layouts/PageLayout';
import CollectionItemCard, {
  CollectionItem,
} from '../components/lists/CollectionItemCard';
import AddItemToAuctionModal from '../components/modals/AddItemToAuctionModal';
import { useAuction } from '../hooks/useAuction';
import { showSuccessToast } from '../utils/errorHandler';
import { navigationHelper } from '../utils/navigation';

interface AuctionEditProps {
  auctionId?: string;
}

const AuctionEdit: React.FC<AuctionEditProps> = ({ auctionId }) => {
  const {
    currentAuction,
    loading,
    error,
    fetchAuctionById,
    updateAuction,
    addItemToAuction,
    removeItemFromAuction,
    clearError,
    clearCurrentAuction,
  } = useAuction();

  // Get auction ID from URL if not provided as prop
  const [currentAuctionId, setCurrentAuctionId] = useState<string>('');
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRemoveItemConfirmation, setShowRemoveItemConfirmation] =
    useState(false);
  const [removingItem, setRemovingItem] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<{
    id: string;
    name: string;
    category: string;
  } | null>(null);

  // Form state for editing auction details
  const [formData, setFormData] = useState({
    topText: '',
    bottomText: '',
    auctionDate: '',
    status: 'draft' as 'draft' | 'active' | 'sold' | 'expired',
  });

  useEffect(() => {
    // Extract auction ID from URL using navigationHelper
    const urlAuctionId = auctionId || navigationHelper.getAuctionIdFromUrl();

    if (urlAuctionId && urlAuctionId !== 'auctions') {
      setCurrentAuctionId(urlAuctionId);
      fetchAuctionById(urlAuctionId);
    }

    return () => {
      clearCurrentAuction();
    };
  }, [auctionId, fetchAuctionById, clearCurrentAuction]);

  // Update form data when auction is loaded
  useEffect(() => {
    if (currentAuction) {
      setFormData({
        topText: currentAuction.topText || '',
        bottomText: currentAuction.bottomText || '',
        auctionDate: currentAuction.auctionDate
          ? currentAuction.auctionDate.split('T')[0]
          : '',
        status: currentAuction.status || 'draft',
      });
    }
  }, [currentAuction]);

  // Navigation using navigationHelper
  const navigateToAuctionDetail = () => {
    if (currentAuctionId) {
      navigationHelper.navigateToAuctionDetail(currentAuctionId);
    }
  };

  const navigateToAuctions = () => {
    navigationHelper.navigateToAuctions();
  };

  const handleCancelEdit = () => {
    navigateToAuctionDetail();
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle save auction changes
  const handleSaveChanges = async () => {
    if (!currentAuctionId) {
      return;
    }

    try {
      setIsEditing(true);
      await updateAuction(currentAuctionId, {
        topText: formData.topText,
        bottomText: formData.bottomText,
        auctionDate: new Date(formData.auctionDate).toISOString(),
        status: formData.status,
      });
      showSuccessToast('Auction updated successfully!');
    } catch (_error) {
      // Error handled by hook
    } finally {
      setIsEditing(false);
    }
  };

  // Handle add items to auction
  const handleAddItems = async (
    items: { itemId: string; itemCategory: string }[]
  ) => {
    for (const item of items) {
      await addItemToAuction(currentAuctionId, item);
    }
    showSuccessToast(`Added ${items.length} item(s) to auction`);
  };

  // Handle remove item from auction - show confirmation modal
  const handleRemoveItem = (
    itemId: string,
    itemName: string,
    itemCategory: string
  ) => {
    setItemToRemove({ id: itemId, name: itemName, category: itemCategory });
    setShowRemoveItemConfirmation(true);
  };

  // Confirm remove item from auction
  const confirmRemoveItem = async () => {
    if (!itemToRemove) {
      return;
    }

    try {
      setRemovingItem(true);
      await removeItemFromAuction(
        currentAuctionId,
        itemToRemove.id,
        itemToRemove.category
      );
      showSuccessToast('Item removed from auction');
      setShowRemoveItemConfirmation(false);
      setItemToRemove(null);
    } catch {
      // Error handled by the hook
    } finally {
      setRemovingItem(false);
    }
  };

  const handleCancelRemoveItem = () => {
    setShowRemoveItemConfirmation(false);
    setItemToRemove(null);
  };

  // Convert auction item to CollectionItem format
  const convertAuctionItemToCollectionItem = (
    auctionItem: any
  ): CollectionItem => {
    const { itemData, itemCategory } = auctionItem;

    // Create a normalized item that matches CollectionItem interface
    const normalizedItem: CollectionItem = {
      id: auctionItem.itemId || itemData?._id || itemData?.id,
      images: itemData?.images || [],
      myPrice: itemData?.myPrice || 0,
      sold: auctionItem.sold || itemData?.sold || false,
      dateAdded: itemData?.dateAdded,
      priceHistory: itemData?.priceHistory || [],
      saleDetails: auctionItem.saleDetails || itemData?.saleDetails,
    };

    // Add category-specific fields
    if (itemCategory === 'PsaGradedCard') {
      (normalizedItem as any).grade = itemData?.grade;
      (normalizedItem as any).cardId = itemData?.cardId;
      (normalizedItem as any).cardName =
        itemData?.cardId?.cardName || itemData?.cardName;
    } else if (itemCategory === 'RawCard') {
      (normalizedItem as any).condition = itemData?.condition;
      (normalizedItem as any).cardId = itemData?.cardId;
      (normalizedItem as any).cardName =
        itemData?.cardId?.cardName || itemData?.cardName;
    } else if (itemCategory === 'SealedProduct') {
      (normalizedItem as any).name = itemData?.name;
      (normalizedItem as any).category = itemData?.category;
      (normalizedItem as any).setName = itemData?.setName;
    }

    return normalizedItem;
  };

  // Get item type from auction item category
  const getItemTypeFromCategory = (
    category: string
  ): 'psa' | 'raw' | 'sealed' => {
    switch (category) {
      case 'PsaGradedCard':
        return 'psa';
      case 'RawCard':
        return 'raw';
      case 'SealedProduct':
        return 'sealed';
      default:
        return 'sealed';
    }
  };

  // Handle viewing item details (navigate to collection detail)
  const handleViewItemDetail = (
    item: CollectionItem,
    type: 'psa' | 'raw' | 'sealed'
  ) => {
    navigationHelper.navigateToItemDetail(type, item.id);
  };

  // Handle mark item as sold (show remove from auction option)
  const handleMarkAsSold = (
    item: CollectionItem,
    type: 'psa' | 'raw' | 'sealed'
  ) => {
    // For auction edit, we'll provide an option to remove from auction instead
    const itemName =
      (item as any).cardName || (item as any).name || 'Unknown Item';
    const itemCategory =
      type === 'psa'
        ? 'PsaGradedCard'
        : type === 'raw'
          ? 'RawCard'
          : 'SealedProduct';
    handleRemoveItem(item.id, itemName, itemCategory);
  };

  // Get status color - Theme-aware design system
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]';
      case 'active':
        return 'bg-[var(--theme-accent-primary)]/20 text-[var(--theme-accent-primary)] border border-[var(--theme-accent-primary)]/50';
      case 'sold':
        return 'bg-[var(--theme-status-success)]/20 text-[var(--theme-status-success)] border border-[var(--theme-status-success)]/50';
      case 'expired':
        return 'bg-[var(--theme-status-error)]/20 text-[var(--theme-status-error)] border border-[var(--theme-status-error)]/50';
      default:
        return 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text-secondary)] border border-[var(--theme-border)]';
    }
  };

  const headerActions = (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleSaveChanges}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Save Changes
      </button>
      <button
        onClick={handleCancelEdit}
        className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Cancel
      </button>
    </div>
  );

  if (loading) {
    return (
      <PageLayout
        title="Edit Auction"
        subtitle="Modify your auction details"
        loading={true}
        error={error}
        actions={headerActions}
        variant="default"
      >
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-[var(--theme-status-error)]/5"></div>
              <div className="relative z-10">
                <LoadingSpinner text="Loading auction details..." />
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!currentAuction) {
    return (
      <PageLayout
        title="Auction Not Found"
        subtitle="The auction you're trying to edit doesn't exist or has been deleted"
        loading={false}
        error="Auction not found"
        actions={
          <button
            onClick={navigateToAuctions}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
          >
            Back to Auctions
          </button>
        }
        variant="default"
      />
    );
  }

  return (
    <PageLayout
      title="Edit Auction"
      subtitle="Modify your auction details and manage items"
      loading={loading}
      error={error}
      actions={headerActions}
      variant="default"
    >
      {/* Context7 Premium Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Context7 Premium Header */}
          <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-[var(--theme-status-error)]/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <Button
                  onClick={navigateToAuctionDetail}
                  variant="outline"
                  className="inline-flex items-center border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Auction
                </Button>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isEditing}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {isEditing ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <h1 className="text-4xl font-bold text-[var(--theme-text-primary)] tracking-wide bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Edit Auction
                    </h1>
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide ${getStatusColor(currentAuction.status)}`}
                    >
                      {currentAuction.status.charAt(0).toUpperCase() +
                        currentAuction.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-xl text-[var(--theme-text-secondary)] font-medium leading-relaxed mb-6">
                    Update auction details, manage items, and modify settings
                  </p>
                </div>
              </div>
            </div>
            {/* Premium shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--theme-text-primary)]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </div>

          {/* Context7 Premium Error Message */}
          {error && (
            <div className="bg-[var(--theme-status-error)]/10 backdrop-blur-sm border border-[var(--theme-status-error)]/30 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-status-error)] to-rose-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-[var(--theme-status-error)] font-medium">
                    {error}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={clearError}
                    className="inline-flex text-[var(--theme-status-error)]/70 hover:text-[var(--theme-status-error)] p-2 rounded-lg hover:bg-[var(--theme-status-error)]/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Context7 Premium Auction Details Form */}
          <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-accent-secondary)]/3 via-purple-500/3 to-pink-500/3"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide">
                  Auction Details
                </h2>
                <Edit3 className="w-6 h-6 text-[var(--theme-accent-secondary)]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Text */}
                <div className="space-y-2">
                  <label
                    htmlFor="topText"
                    className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
                  >
                    Auction Title
                  </label>
                  <input
                    type="text"
                    id="topText"
                    name="topText"
                    value={formData.topText}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-secondary)] focus:border-transparent bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)]"
                    placeholder="Enter auction title..."
                  />
                </div>

                {/* Auction Date */}
                <div className="space-y-2">
                  <label
                    htmlFor="auctionDate"
                    className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
                  >
                    Auction Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="auctionDate"
                      name="auctionDate"
                      value={formData.auctionDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-10 border border-slate-300 dark:border-zinc-600 dark:border-zinc-600 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label
                    htmlFor="status"
                    className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-secondary)] focus:border-transparent bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)]"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="sold">Sold</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                {/* Bottom Text - Full Width */}
                <div className="md:col-span-2 space-y-2">
                  <label
                    htmlFor="bottomText"
                    className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
                  >
                    Description
                  </label>
                  <textarea
                    id="bottomText"
                    name="bottomText"
                    value={formData.bottomText}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-600 dark:border-zinc-600 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Enter auction description..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Premium Auction Items Management */}
          <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-status-success)]/3 via-teal-500/3 to-[var(--theme-accent-primary)]/3"></div>
            <div className="relative z-10">
              <div className="px-8 py-6 border-b border-[var(--theme-border)] flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide">
                  Auction Items ({currentAuction.items.length})
                </h2>
                <Button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  Add Items
                </Button>
              </div>

              {currentAuction.items.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[var(--theme-text-secondary)] to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-[var(--theme-text-muted)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">
                    No items in auction
                  </h3>
                  <p className="text-[var(--theme-text-secondary)] font-medium max-w-md mx-auto leading-relaxed mb-8">
                    Add items from your collection to this auction.
                  </p>
                  <Button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {currentAuction.items.map(
                    (auctionItem: any, index: number) => {
                      const collectionItem =
                        convertAuctionItemToCollectionItem(auctionItem);
                      const itemType = getItemTypeFromCategory(
                        auctionItem.itemCategory
                      );

                      return (
                        <div
                          key={`${auctionItem.itemId || auctionItem.itemData?._id}-${index}`}
                          className="relative"
                        >
                          <CollectionItemCard
                            item={collectionItem}
                            itemType={itemType}
                            activeTab="psa-graded" // Not really used in this context
                            showMarkAsSoldButton={false} // Hide mark as sold, show remove instead
                            onViewDetails={handleViewItemDetail}
                            onMarkAsSold={handleMarkAsSold}
                          />

                          {/* Remove from Auction Button - Overlay */}
                          <div className="absolute top-4 right-4 z-20">
                            <Button
                              onClick={() => {
                                const itemName =
                                  auctionItem.itemData?.cardId?.cardName ||
                                  auctionItem.itemData?.cardName ||
                                  auctionItem.itemData?.name ||
                                  'Unknown Item';
                                handleRemoveItem(
                                  auctionItem.itemId ||
                                    auctionItem.itemData?._id,
                                  itemName,
                                  auctionItem.itemCategory
                                );
                              }}
                              variant="outline"
                              size="sm"
                              className="text-[var(--theme-status-error)] hover:text-[var(--theme-status-error)]/80 border-[var(--theme-status-error)]/40 hover:border-[var(--theme-status-error)]/60 bg-[var(--theme-surface)] backdrop-blur-sm shadow-lg"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>

                          {/* Auction Specific Badge */}
                          {auctionItem.sold && (
                            <div className="absolute top-4 left-4 z-20">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-[var(--theme-status-success)]/30 text-[var(--theme-status-success)] border border-[var(--theme-status-success)]/40 backdrop-blur-sm shadow-lg">
                                <Check className="w-3 h-3 mr-1" />
                                Sold in Auction
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Item to Auction Modal */}
          <AddItemToAuctionModal
            isOpen={isAddItemModalOpen}
            onClose={() => setIsAddItemModalOpen(false)}
            onAddItems={handleAddItems}
            currentAuctionItems={
              currentAuction?.items?.map((item) => ({
                itemId: item.itemId,
                itemCategory: item.itemCategory,
              })) || []
            }
          />

          {/* Remove Item Confirmation Modal */}
          <ConfirmModal
            isOpen={showRemoveItemConfirmation}
            onClose={handleCancelRemoveItem}
            onConfirm={confirmRemoveItem}
            title="Remove Item from Auction"
            description={`Are you sure you want to remove "${itemToRemove?.name || 'this item'}" from the auction? This will not delete the item from your collection, only remove it from this auction.`}
            confirmText="Remove Item"
            variant="warning"
            icon="trash"
            isLoading={removingItem}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default AuctionEdit;
