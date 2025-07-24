/**
 * Collection Item Card Component
 *
 * Reusable card component for displaying collection items (PSA, Raw Cards, Sealed Products)
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles item card display
 * - Open/Closed: Extensible for different item types
 * - DRY: Reusable across all collection item types
 * - Layer 3: UI Building Block component
 */

import React, { useState, memo, useCallback, useMemo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Package, Star, Archive, CheckCircle, Eye, DollarSign } from 'lucide-react';
import { ImageSlideshow } from '../common/ImageSlideshow';
import { formatCardNameForDisplay } from '../../utils/formatting';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';

export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

export interface CollectionItemCardProps {
  item: CollectionItem;
  itemType: 'psa' | 'raw' | 'sealed';
  activeTab: 'psa-graded' | 'raw-cards' | 'sealed-products' | 'sold-items';
  showMarkAsSoldButton?: boolean;
  onViewDetails: (item: CollectionItem, itemType: 'psa' | 'raw' | 'sealed') => void;
  onMarkAsSold?: (item: CollectionItem, itemType: 'psa' | 'raw' | 'sealed') => void;
}

const CollectionItemCardComponent: React.FC<CollectionItemCardProps> = ({
  item,
  itemType,
  activeTab,
  showMarkAsSoldButton = true,
  onViewDetails,
  onMarkAsSold,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Memoize spring configuration to prevent recreation on every render
  const springConfig = useMemo(() => ({
    type: 'spring' as const,
    stiffness: 300,
    damping: 40,
    mass: 1,
  }), []);

  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  // Memoized mouse movement handlers for 3D effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  }, [mouseX, mouseY]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // Memoized item display name calculation
  const itemName = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;
    const cardName = ((itemRecord.cardId as Record<string, unknown>)?.cardName ||
      itemRecord.cardName ||
      itemRecord.name ||
      'Unknown Item') as string;

    // Format card name for display (remove hyphens and parentheses)
    return formatCardNameForDisplay(cardName);
  }, [item]);

  // Memoized set name calculation
  const setName = useMemo(() => {
    return (item as any).cardId?.setId?.setName ||
      (item as any).setName ||
      (item as any).cardId?.setName ||
      'Unknown Set';
  }, [item]);

  // Memoized badge content based on type and tab
  const badgeContent = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;
    switch (activeTab) {
      case 'psa-graded':
        return (
          <>
            <Star className='w-4 h-4 mr-1 text-yellow-500' />
            Grade {itemRecord.grade || 'N/A'}
          </>
        );
      case 'raw-cards':
        return (
          <>
            <Package className='w-4 h-4 mr-1 text-emerald-500' />
            {itemRecord.condition || 'N/A'}
          </>
        );
      case 'sealed-products':
        return (
          <>
            <Archive className='w-4 h-4 mr-1 text-purple-500' />
            {itemRecord.category || 'N/A'}
          </>
        );
      case 'sold-items':
        return (
          <>
            <CheckCircle className='w-4 h-4 mr-1 text-green-500' />
            {(item as any).saleDetails?.dateSold
              ? new Date((item as any).saleDetails.dateSold).toLocaleDateString()
              : 'N/A'}
          </>
        );
      default:
        return null;
    }
  }, [item, activeTab]);

  // Memoized click handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    onViewDetails(item, itemType);
  }, [onViewDetails, item, itemType]);

  const isUnsoldTab = activeTab !== 'sold-items';

  return (
    <motion.div
      className='group relative rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 overflow-hidden cursor-pointer'
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: 1.05,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 40,
        mass: 1,
      }}
    >
      {/* Futuristic glow effects */}
      <motion.div
        className='absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10 rounded-3xl pointer-events-none'
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />

      {/* Animated shimmer effect */}
      <motion.div
        className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-3xl'
        initial={{ x: '-100%' }}
        animate={{
          x: isHovered ? '100%' : '-100%',
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 2,
        }}
      />

      {/* Card Image */}
      <motion.div
        className='relative w-full h-full aspect-[3/5] min-h-[400px]'
        style={{ transformStyle: 'preserve-3d' }}
      >
        <motion.div
          className='w-full h-full rounded-xl overflow-hidden relative'
          style={{
            transform: 'translateZ(20px)',
          }}
        >
          <ImageSlideshow
            images={item.images || []}
            fallbackIcon={<Package className='w-8 h-8 text-indigo-600' />}
            autoplay={false}
            autoplayDelay={4000}
            className='w-full h-full object-cover rounded-xl'
            showThumbnails={false}
            adaptiveLayout={false}
            enableAspectRatioDetection={false}
          />
          {/* Image overlay shadow for text readability - works for both single and multiple images */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none'></div>
        </motion.div>

        {/* Enhanced shadow covering text area */}
        <div className='absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-30 rounded-b-xl pointer-events-none' />

        {/* Additional shadow overlay for better text readability */}
        <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent z-40 rounded-b-xl pointer-events-none' />

        {/* Corner accent */}
        <motion.div
          className='absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50'
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{
            scale: isHovered ? 1.5 : 1,
            opacity: isHovered ? 1 : 0.7,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          style={{ transform: 'translateZ(30px)' }}
        />
      </motion.div>

      {/* Text Layer - Completely separate and always on top */}
      <motion.div
        className='absolute inset-0 flex flex-col justify-end p-3 pointer-events-none z-50'
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Grade Badge */}
        <motion.div
          className='inline-flex items-center justify-center px-2 py-1 rounded-full text-[10px] font-bold mb-2 self-start pointer-events-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/50'
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{
            scale: 1.1,
            rotate: [0, -5, 5, 0],
            shadow: '0 25px 50px -12px rgba(234, 179, 8, 0.8)',
            transition: {
              rotate: { duration: 0.5, ease: 'easeInOut' },
              scale: { type: 'spring', stiffness: 400, damping: 10 },
            },
          }}
          transition={{
            delay: 0.5,
            type: 'spring',
            stiffness: 200,
            damping: 15,
          }}
        >
          {badgeContent}
        </motion.div>

        {/* Set Name */}
        <motion.p
          className='text-[10px] text-gray-300 font-medium mb-1 tracking-wide uppercase leading-tight break-words'
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {setName}
        </motion.p>

        {/* Card Name */}
        <motion.h3
          className='text-xs font-bold text-white leading-tight break-words'
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 25 },
          }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          {itemName}
        </motion.h3>
      </motion.div>

      {/* Price in Bottom Right Corner */}
      <motion.div
        className='absolute bottom-3 right-3 px-3 py-2 rounded-lg text-sm font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg pointer-events-auto z-50'
        initial={{ scale: 0, x: 20, y: 20 }}
        animate={{ scale: 1, x: 0, y: 0 }}
        whileHover={{
          scale: 1.1,
          transition: { type: 'spring', stiffness: 400, damping: 10 },
        }}
        transition={{
          delay: 0.8,
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        {item.myPrice || '0'} kr.
      </motion.div>

      {/* Hover Effect Overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl'></div>
    </motion.div>
  );
};

/**
 * Custom memo comparison function for CollectionItemCard
 * Optimizes re-rendering by performing shallow comparison on critical props
 * Following CLAUDE.md performance optimization principles
 */
const arePropsEqual = (
  prevProps: CollectionItemCardProps,
  nextProps: CollectionItemCardProps
): boolean => {
  // Check if the item itself has changed (by reference or critical properties)
  if (prevProps.item !== nextProps.item) {
    // Perform deeper comparison for item properties that affect rendering
    const prevItem = prevProps.item as Record<string, unknown>;
    const nextItem = nextProps.item as Record<string, unknown>;
    
    // Check critical properties that affect card display
    if (
      prevItem.id !== nextItem.id ||
      prevItem.myPrice !== nextItem.myPrice ||
      prevItem.images !== nextItem.images ||
      JSON.stringify(prevItem.cardId) !== JSON.stringify(nextItem.cardId) ||
      JSON.stringify(prevItem.saleDetails) !== JSON.stringify(nextItem.saleDetails)
    ) {
      return false;
    }
  }

  // Check other critical props
  return (
    prevProps.itemType === nextProps.itemType &&
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.showMarkAsSoldButton === nextProps.showMarkAsSoldButton &&
    prevProps.onViewDetails === nextProps.onViewDetails &&
    prevProps.onMarkAsSold === nextProps.onMarkAsSold
  );
};

/**
 * Memoized CollectionItemCard component
 * Prevents unnecessary re-renders when props haven't changed
 * Optimizes performance for large collection grids with hundreds of cards
 */
export const CollectionItemCard = memo(CollectionItemCardComponent, arePropsEqual);

export default CollectionItemCard;
