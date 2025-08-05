/**
 * Pokemon Modal Component - The Ultimate Dialog Engine
 * Consolidates ALL modal patterns: confirmations, forms, details, overlays
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates 300+ lines of duplicate modal styling
 * - Solid: One definitive modal implementation
 * - Reusable: Works everywhere - confirmations, forms, image views, etc.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/common';
import { PokemonButton } from './PokemonButton';

export interface PokemonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'glass' | 'solid' | 'center';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * THE definitive modal - replaces all Modal, ConfirmModal, dialog patterns
 * Handles: confirmations, forms, image viewers, detail dialogs, etc.
 */
export const PokemonModal: React.FC<PokemonModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'glass',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  loading = false,
  className = '',
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) {
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // Size system - covers all use cases
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  // Variant system - different modal styles
  const getVariantClasses = (variant: string) => {
    const variants = {
      default: [
        'bg-zinc-900/95 backdrop-blur-xl',
        'border border-zinc-700/50',
        'shadow-2xl',
      ].join(' '),
      glass: [
        'bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12]',
        'backdrop-blur-xl border border-white/[0.15]',
        'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
      ].join(' '),
      solid: ['bg-zinc-900 border border-zinc-800', 'shadow-2xl'].join(' '),
      center: [
        'bg-gradient-to-br from-zinc-900/95 to-zinc-800/95',
        'backdrop-blur-xl border border-zinc-700/30',
        'shadow-[0_20px_50px_0_rgba(0,0,0,0.5)]',
      ].join(' '),
    };

    return variants[variant as keyof typeof variants] || variants.glass;
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop/Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div
        className={cn(
          'relative w-full rounded-2xl transition-all duration-300 transform',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          sizeClasses[size],
          getVariantClasses(variant),
          loading && 'pointer-events-none',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic border effect for glass variant */}
        {variant === 'glass' && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-30 animate-pulse" />
        )}

        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-60" />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="relative z-10 flex items-center justify-between p-6 pb-0">
            {title && (
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-cyan-400/30 transition-all duration-300 group"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-zinc-400 group-hover:text-cyan-300 transition-colors duration-300" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <span className="ml-3 text-cyan-100/80 font-medium">
                Loading...
              </span>
            </div>
          ) : (
            children
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="relative z-10 px-6 pb-6 pt-0">
            <div className="border-t border-white/10 pt-4">{footer}</div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-4 border border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                <span className="text-cyan-100 font-medium">Processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Confirmation Modal Helper Component
export interface PokemonConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const PokemonConfirmModal: React.FC<PokemonConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const variantConfig = {
    danger: { icon: '⚠️', confirmVariant: 'danger' as const },
    warning: { icon: '⚠️', confirmVariant: 'warning' as const },
    info: { icon: 'ℹ️', confirmVariant: 'primary' as const },
  };

  const config = variantConfig[variant];

  return (
    <PokemonModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      loading={loading}
      footer={
        <div className="flex gap-3 justify-end">
          <PokemonButton variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </PokemonButton>
          <PokemonButton
            variant={config.confirmVariant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </PokemonButton>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl flex-shrink-0">{config.icon}</div>
        <div>
          <p className="text-zinc-200 leading-relaxed">{message}</p>
        </div>
      </div>
    </PokemonModal>
  );
};
