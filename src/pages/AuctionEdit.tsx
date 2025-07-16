/**
 * Auction Edit Page
 * Edit auction details, manage items, and update auction settings
 * Following CLAUDE.md Layer 4 (Views/Pages) principles
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Package,
  Save,
  Plus,
  Trash2,
  Edit3,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { useAuction } from '../hooks/useAuction';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import AddItemToAuctionModal from '../components/modals/AddItemToAuctionModal';
import { ImageSlideshow } from '../components/common/ImageSlideshow';
import { showSuccessToast, showWarningToast } from '../utils/errorHandler';

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

  // Form state for editing auction details
  const [formData, setFormData] = useState({
    topText: '',
    bottomText: '',
    auctionDate: '',
    status: 'draft' as 'draft' | 'active' | 'sold' | 'expired',
  });

  useEffect(() => {
    // Extract auction ID from URL
    const pathParts = window.location.pathname.split('/');
    const urlAuctionId = auctionId || pathParts[pathParts.length - 2]; // /auctions/{id}/edit

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
        auctionDate: currentAuction.auctionDate ? currentAuction.auctionDate.split('T')[0] : '',
        status: currentAuction.status || 'draft',
      });
    }
  }, [currentAuction]);

  // Navigation
  const navigateToAuctionDetail = () => {
    window.history.pushState({}, '', `/auctions/${currentAuctionId}`);
    window.location.reload();
  };

  const navigateToAuctions = () => {
    window.history.pushState({}, '', '/auctions');
    window.location.reload();
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle save auction changes
  const handleSaveChanges = async () => {
    if (!currentAuctionId) return;

    try {
      setIsEditing(true);
      await updateAuction(currentAuctionId, {
        topText: formData.topText,
        bottomText: formData.bottomText,
        auctionDate: new Date(formData.auctionDate).toISOString(),
        status: formData.status,
      });
      showSuccessToast('Auction updated successfully!');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsEditing(false);
    }
  };

  // Handle add items to auction
  const handleAddItems = async (items: { itemId: string; itemCategory: string }[]) => {
    for (const item of items) {
      await addItemToAuction(currentAuctionId, item);
    }
    showSuccessToast(`Added ${items.length} item(s) to auction`);
  };

  // Handle remove item from auction
  const handleRemoveItem = async (itemId: string) => {
    showWarningToast('Are you sure you want to remove this item from the auction?', {
      duration: 0,
      action: {
        label: 'Remove',
        onClick: async () => {
          try {
            await removeItemFromAuction(currentAuctionId, itemId);
            showSuccessToast('Item removed from auction');
          } catch (err) {
            // Error handled by the hook
          }
        },
      },
    });
  };

  // Extract item display data from populated structure
  const getItemDisplayData = (item: any) => {
    const defaultData = {
      itemName: 'Unknown Item',
      itemImage: undefined,
      setName: undefined,
      grade: undefined,
      condition: undefined,
      price: undefined
    };

    if (!item.itemData) {
      return defaultData;
    }

    const { itemData, itemCategory } = item;

    // Helper function to get full image URL
    const getImageUrl = (imagePath: string | undefined) => {
      if (!imagePath) return undefined;
      // If it's already a full URL, return as is
      if (imagePath.startsWith('http')) return imagePath;
      // If it's a relative path, prepend the backend server URL
      return `http://localhost:3000${imagePath}`;
    };

    switch (itemCategory) {
      case 'PsaGradedCard':
      case 'RawCard':
        return {
          itemName: itemData.cardId?.cardName || itemData.cardId?.baseName || 'Unknown Item',
          itemImage: getImageUrl(itemData.images?.[0]),
          setName: itemData.cardId?.setId?.setName,
          grade: itemCategory === 'PsaGradedCard' ? itemData.grade : undefined,
          condition: itemCategory === 'RawCard' ? itemData.condition : undefined,
          price: itemData.myPrice
        };
      case 'SealedProduct':
        return {
          itemName: itemData.name || 'Unknown Item',
          itemImage: getImageUrl(itemData.images?.[0]),
          setName: itemData.setName,
          grade: undefined,
          condition: undefined,
          price: itemData.myPrice
        };
      default:
        return defaultData;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'sold':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  // Get item category color
  const getItemCategoryColor = (category: string) => {
    switch (category) {
      case 'PsaGradedCard':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'RawCard':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'SealedProduct':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
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

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-30'>
          <div
            className='w-full h-full'
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className='relative z-10 p-8'>
          <div className='max-w-7xl mx-auto'>
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5'></div>
              <div className='relative z-10'>
                <LoadingSpinner text='Loading auction details...' />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAuction) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
        <div className='absolute inset-0 opacity-30'>
          <div
            className='w-full h-full'
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className='relative z-10 p-8'>
          <div className='max-w-7xl mx-auto'>
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-16 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-red-500/5 via-rose-500/5 to-pink-500/5'></div>
              <div className='relative z-10 text-center'>
                <div className='w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6'>
                  <Package className='w-10 h-10 text-slate-500' />
                </div>
                <h3 className='text-xl font-bold text-slate-900 mb-3'>Auction not found</h3>
                <p className='text-slate-600 font-medium max-w-md mx-auto leading-relaxed mb-8'>
                  The auction you're trying to edit doesn't exist or has been deleted.
                </p>
                <Button onClick={navigateToAuctions}>Back to Auctions</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
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
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden group'>
            <div className='absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5'></div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-6'>
                <Button
                  onClick={navigateToAuctionDetail}
                  variant='outline'
                  className='inline-flex items-center border-slate-300 hover:border-slate-400 text-slate-600 hover:text-slate-800'
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back to Auction
                </Button>

                <div className='flex items-center space-x-3'>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isEditing}
                    className='bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105'
                  >
                    {isEditing ? (
                      <LoadingSpinner size='sm' className='mr-2' />
                    ) : (
                      <Save className='w-4 h-4 mr-2' />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <h1 className='text-4xl font-bold text-slate-900 tracking-wide bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent'>
                      Edit Auction
                    </h1>
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide ${getStatusColor(currentAuction.status)}`}
                    >
                      {currentAuction.status.charAt(0).toUpperCase() + currentAuction.status.slice(1)}
                    </span>
                  </div>

                  <p className='text-xl text-slate-600 font-medium leading-relaxed mb-6'>
                    Update auction details, manage items, and modify settings
                  </p>
                </div>
              </div>
            </div>
            {/* Premium shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
          </div>

          {/* Context7 Premium Error Message */}
          {error && (
            <div className='bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-3xl p-6 shadow-lg'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg flex items-center justify-center'>
                    <AlertCircle className='h-5 w-5 text-white' />
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

          {/* Context7 Premium Auction Details Form */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/3 via-purple-500/3 to-pink-500/3'></div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-slate-900 tracking-wide'>Auction Details</h2>
                <Edit3 className='w-6 h-6 text-indigo-600' />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* Top Text */}
                <div className='space-y-2'>
                  <label htmlFor='topText' className='block text-sm font-bold text-slate-700 tracking-wide uppercase'>
                    Auction Title
                  </label>
                  <input
                    type='text'
                    id='topText'
                    name='topText'
                    value={formData.topText}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    placeholder='Enter auction title...'
                  />
                </div>

                {/* Auction Date */}
                <div className='space-y-2'>
                  <label htmlFor='auctionDate' className='block text-sm font-bold text-slate-700 tracking-wide uppercase'>
                    Auction Date
                  </label>
                  <div className='relative'>
                    <input
                      type='date'
                      id='auctionDate'
                      name='auctionDate'
                      value={formData.auctionDate}
                      onChange={handleInputChange}
                      className='w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                    />
                    <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400' />
                  </div>
                </div>

                {/* Status */}
                <div className='space-y-2'>
                  <label htmlFor='status' className='block text-sm font-bold text-slate-700 tracking-wide uppercase'>
                    Status
                  </label>
                  <select
                    id='status'
                    name='status'
                    value={formData.status}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  >
                    <option value='draft'>Draft</option>
                    <option value='active'>Active</option>
                    <option value='sold'>Sold</option>
                    <option value='expired'>Expired</option>
                  </select>
                </div>

                {/* Bottom Text - Full Width */}
                <div className='md:col-span-2 space-y-2'>
                  <label htmlFor='bottomText' className='block text-sm font-bold text-slate-700 tracking-wide uppercase'>
                    Description
                  </label>
                  <textarea
                    id='bottomText'
                    name='bottomText'
                    value={formData.bottomText}
                    onChange={handleInputChange}
                    rows={4}
                    className='w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none'
                    placeholder='Enter auction description...'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Premium Auction Items Management */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-r from-emerald-500/3 via-teal-500/3 to-cyan-500/3'></div>
            <div className='relative z-10'>
              <div className='px-8 py-6 border-b border-slate-200/50 flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-slate-900 tracking-wide'>
                  Auction Items ({currentAuction.items.length})
                </h2>
                <Button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className='bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20'
                >
                  <Plus className='w-5 h-5 mr-3' />
                  Add Items
                </Button>
              </div>

              {currentAuction.items.length === 0 ? (
                <div className='p-16 text-center'>
                  <div className='w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6'>
                    <Package className='w-10 h-10 text-slate-500' />
                  </div>
                  <h3 className='text-xl font-bold text-slate-900 mb-3'>No items in auction</h3>
                  <p className='text-slate-600 font-medium max-w-md mx-auto leading-relaxed mb-8'>Add items from your collection to this auction.</p>
                  <Button
                    onClick={() => setIsAddItemModalOpen(true)}
                    className='bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105'
                  >
                    <Plus className='w-5 h-5 mr-3' />
                    Add First Item
                  </Button>
                </div>
              ) : (
                <div className='p-8 space-y-6'>
                  {currentAuction.items.map((item: any, index: number) => {
                    const displayData = getItemDisplayData(item);
                    return (
                      <div key={`${item.itemId || item.itemData?._id}-${index}`} className='group bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-6 hover:bg-white/80 hover:shadow-xl hover:scale-102 transition-all duration-300 relative overflow-hidden'>
                        <div className='absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                        <div className='relative z-10'>
                          <div className='flex items-start space-x-6'>
                            
                            {/* Item Image */}
                            <div className='flex-shrink-0'>
                              {displayData.itemImage ? (
                                <ImageSlideshow
                                  images={[displayData.itemImage]}
                                  fallbackIcon={<Package className='w-6 h-6 text-slate-400' />}
                                  autoplay={false}
                                  className="w-32 h-44 rounded-xl shadow-lg"
                                  showThumbnails={false}
                                />
                              ) : (
                                <div className='w-32 h-44 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-lg'>
                                  <Package className='w-12 h-12 text-slate-400' />
                                </div>
                              )}
                            </div>

                            {/* Item Details */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center space-x-3'>
                                  <h3 className='text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300'>
                                    {displayData.itemName}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide ${getItemCategoryColor(item.itemCategory)}`}
                                  >
                                    {formatItemCategory(item.itemCategory)}
                                  </span>
                                  {item.sold && (
                                    <span className='inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200'>
                                      <Check className='w-3 h-3 mr-1' />
                                      Sold
                                    </span>
                                  )}
                                </div>

                                <div className='flex items-center space-x-2'>
                                  <Button
                                    onClick={() => handleRemoveItem(item.itemId || item.itemData?._id)}
                                    variant='outline'
                                    size='sm'
                                    className='text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'
                                  >
                                    <Trash2 className='w-4 h-4 mr-1' />
                                    Remove
                                  </Button>
                                </div>
                              </div>

                              {/* Item Information Grid */}
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                <div className='space-y-2'>
                                  {displayData.setName && (
                                    <div className='flex items-center space-x-2 text-sm'>
                                      <span className='font-medium text-slate-600'>Set:</span>
                                      <span className='text-slate-800 font-medium'>{displayData.setName}</span>
                                    </div>
                                  )}
                                  {item.itemCategory === 'PsaGradedCard' && displayData.grade && (
                                    <div className='flex items-center space-x-2 text-sm'>
                                      <span className='font-medium text-slate-600'>PSA Grade:</span>
                                      <span className='text-slate-800 font-bold text-blue-600'>Grade {displayData.grade}</span>
                                    </div>
                                  )}
                                  {item.itemCategory === 'RawCard' && displayData.condition && (
                                    <div className='flex items-center space-x-2 text-sm'>
                                      <span className='font-medium text-slate-600'>Condition:</span>
                                      <span className='text-slate-800 font-medium'>{displayData.condition}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className='space-y-2'>
                                  {displayData.price && (
                                    <div className='flex items-center space-x-2 text-sm'>
                                      <span className='font-medium text-slate-600'>Listed Price:</span>
                                      <span className='text-slate-800 font-bold text-green-600'>{formatCurrency(displayData.price)}</span>
                                    </div>
                                  )}
                                  {item.salePrice && (
                                    <div className='flex items-center space-x-2 text-sm'>
                                      <span className='font-medium text-slate-600'>Sale Price:</span>
                                      <span className='text-emerald-600 font-bold'>{formatCurrency(item.salePrice)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Add Item to Auction Modal */}
          <AddItemToAuctionModal
            isOpen={isAddItemModalOpen}
            onClose={() => setIsAddItemModalOpen(false)}
            onAddItems={handleAddItems}
          />
        </div>
      </div>
    </div>
  );
};

export default AuctionEdit;