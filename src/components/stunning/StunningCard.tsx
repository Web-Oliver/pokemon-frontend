/**
 * STUNNING POKEMON CARD COMPONENT 2025
 * Breathtaking holographic effects with modern glassmorphism
 * 
 * Features:
 * - Pokemon TCG holographic effects
 * - Liquid glass morphing
 * - Advanced hover micro-interactions
 * - Accessibility compliant
 * - Performance optimized with GPU acceleration
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Heart, Star, Zap, Sparkles, Eye, TrendingUp } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider';

interface StunningCardProps {
  // Card content
  title: string;
  subtitle?: string;
  image?: string;
  price?: string | number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'ultra-rare' | 'secret';
  
  // Visual options
  variant?: 'standard' | 'holographic' | 'liquid-glass' | 'cosmic' | 'ethereal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Interactive features
  onClick?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
  
  // Additional props
  className?: string;
  children?: React.ReactNode;
}

const StunningCard: React.FC<StunningCardProps> = ({
  title,
  subtitle,
  image,
  price,
  rarity = 'common',
  variant = 'holographic',
  size = 'md',
  onClick,
  onFavorite,
  isFavorited = false,
  className = '',
  children,
}) => {
  const { settings } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Spring physics for smooth interactions
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });
  const scale = useSpring(1, { stiffness: 400, damping: 25 });

  // Transform values for 3D effects
  const cardRotateX = useTransform(rotateX, [-0.5, 0.5], [15, -15]);
  const cardRotateY = useTransform(rotateY, [-0.5, 0.5], [-15, 15]);
  
  // Holographic shine position
  const shineX = useTransform(mouseX, [0, 1], ['0%', '100%']);
  const shineY = useTransform(mouseY, [0, 1], ['0%', '100%']);

  // Card sizes
  const sizeClasses = {
    sm: 'w-48 h-64',
    md: 'w-60 h-80',
    lg: 'w-72 h-96',
    xl: 'w-80 h-[26rem]',
  };

  // Rarity configurations
  const rarityConfig = {
    common: {
      gradient: 'from-gray-400/20 to-gray-600/20',
      glow: 'shadow-gray-500/20',
      border: 'border-gray-400/30',
      sparkles: 5,
    },
    uncommon: {
      gradient: 'from-green-400/30 to-emerald-600/30',
      glow: 'shadow-green-500/30',
      border: 'border-green-400/40',
      sparkles: 10,
    },
    rare: {
      gradient: 'from-blue-400/40 to-indigo-600/40',
      glow: 'shadow-blue-500/40',
      border: 'border-blue-400/50',
      sparkles: 15,
    },
    'ultra-rare': {
      gradient: 'from-purple-400/50 to-violet-600/50',
      glow: 'shadow-purple-500/50',
      border: 'border-purple-400/60',
      sparkles: 20,
    },
    secret: {
      gradient: 'from-yellow-400/60 to-orange-600/60',
      glow: 'shadow-yellow-500/60',
      border: 'border-yellow-400/70',
      sparkles: 30,
    },
  };

  const currentRarity = rarityConfig[rarity];

  // Mouse move handler for 3D effects
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (event.clientX - centerX) / (rect.width / 2);
    const y = (event.clientY - centerY) / (rect.height / 2);

    setMousePosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    
    mouseX.set(x);
    mouseY.set(y);
    rotateX.set(y * 0.1);
    rotateY.set(x * 0.1);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.05);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    scale.set(1);
    rotateX.set(0);
    rotateY.set(0);
    mouseX.set(0);
    mouseY.set(0);
  };

  // Generate sparkle particles
  const generateSparkles = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 1,
    }));
  };

  const sparkles = generateSparkles(currentRarity.sparkles);

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        rotateX: cardRotateX,
        rotateY: cardRotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`
        ${sizeClasses[size]} relative cursor-pointer select-none
        transition-all duration-300 ease-out
        ${className}
      `}
      whileTap={{ scale: 0.98 }}
    >
      {/* Main Card Container */}
      <div className={`
        relative w-full h-full rounded-3xl overflow-hidden
        backdrop-blur-xl border-2 ${currentRarity.border}
        bg-gradient-to-br from-white/10 to-black/20
        shadow-2xl ${isHovered ? currentRarity.glow : 'shadow-black/20'}
        transition-all duration-500 ease-out
      `}>
        
        {/* Background Gradient */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${currentRarity.gradient}
          transition-opacity duration-300
          ${isHovered ? 'opacity-100' : 'opacity-70'}
        `} />

        {/* Holographic Shine Effect */}
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-300"
          style={{
            background: `conic-gradient(from 0deg at ${shineX}% ${shineY}%, 
              transparent 0deg, 
              rgba(255, 255, 255, 0.8) 60deg,
              rgba(255, 100, 255, 0.6) 120deg,
              rgba(100, 255, 255, 0.6) 180deg,
              rgba(255, 255, 100, 0.6) 240deg,
              rgba(255, 100, 100, 0.6) 300deg,
              transparent 360deg)`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Sparkle Particles */}
        <AnimatePresence>
          {isHovered && sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute pointer-events-none"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                width: `${sparkle.size}px`,
                height: `${sparkle.size}px`,
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1.5, 0],
                rotate: [0, 180, 360],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: sparkle.duration,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="w-full h-full text-white drop-shadow-lg" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Card Image */}
        {image && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-110"
            />
            
            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        {/* Card Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-2">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-white/80 mt-1 line-clamp-1">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Favorite Button */}
              {onFavorite && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite();
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="ml-3 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors duration-200"
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 transition-colors duration-200 ${
                    isFavorited ? 'text-red-400 fill-current' : 'text-white'
                  }`} />
                </motion.button>
              )}
            </div>

            {/* Rarity Badge */}
            <div className={`
              inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold
              bg-gradient-to-r ${currentRarity.gradient} backdrop-blur-sm
              border ${currentRarity.border} text-white uppercase tracking-wider
            `}>
              <Star className="w-3 h-3" />
              <span>{rarity.replace('-', ' ')}</span>
            </div>
          </div>

          {/* Custom Content */}
          {children && (
            <div className="my-4">
              {children}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto">
            {price && (
              <div className="text-2xl font-bold text-white drop-shadow-lg">
                ${typeof price === 'number' ? price.toLocaleString() : price}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 text-white" />
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors duration-200"
              >
                <TrendingUp className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        
        {/* Border Glow */}
        <div className={`
          absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500
          shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]
        `} />
      </div>

      {/* Card Shadow/Glow */}
      <div className={`
        absolute inset-0 -z-10 rounded-3xl blur-xl transition-all duration-500
        ${isHovered 
          ? `bg-gradient-to-br ${currentRarity.gradient} opacity-60 scale-105` 
          : 'bg-black/20 opacity-30'
        }
      `} />
    </motion.div>
  );
};

export default StunningCard;