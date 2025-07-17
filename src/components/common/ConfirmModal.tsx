/**
 * Context7 Award-Winning Confirm Modal Component
 * Ultra-premium confirmation dialog with stunning visual hierarchy and micro-interactions
 * Specialized for delete operations with built-in danger styling
 * 
 * Following CLAUDE.md + Context7 + Catalyst UI principles:
 * - Alert-style confirmation pattern from Catalyst UI
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and premium backdrop effects
 * - Danger state with red accent for delete operations
 * - Context7 design system compliance
 */

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: 'trash' | 'warning' | 'none';
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'trash',
  isLoading = false,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) {
    return null;
  }

  // Variant-specific styling
  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      confirmDisabled: 'bg-red-400 cursor-not-allowed',
      gradient: 'from-red-500/20 via-red-500/10 to-red-500/20',
      glowColor: 'hover:shadow-[0_25px_50px_-12px_rgba(239,68,68,0.25)]',
    },
    warning: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      confirmDisabled: 'bg-yellow-400 cursor-not-allowed',
      gradient: 'from-yellow-500/20 via-yellow-500/10 to-yellow-500/20',
      glowColor: 'hover:shadow-[0_25px_50px_-12px_rgba(245,158,11,0.25)]',
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      confirmDisabled: 'bg-blue-400 cursor-not-allowed',
      gradient: 'from-blue-500/20 via-blue-500/10 to-blue-500/20',
      glowColor: 'hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.25)]',
    },
  };

  const currentVariant = variantStyles[variant];

  const IconComponent = icon === 'trash' ? Trash2 : icon === 'warning' ? AlertTriangle : null;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Context7 Premium Backdrop with Glass-morphism */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl transition-all duration-500 ease-out"
          onClick={handleCancel}
        />

        {/* Enhanced gradient overlay for depth */}
        <div className="fixed inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

        {/* Premium Animated Particles Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-slate-300/30 rounded-full animate-bounce delay-100"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-slate-300/25 rounded-full animate-pulse delay-200"></div>
        </div>

        {/* Centering span */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Context7 Premium Confirm Modal Panel */}
        <div
          className={`inline-block align-bottom bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl rounded-3xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all duration-500 ease-out scale-95 hover:scale-100 sm:my-8 sm:align-middle max-w-lg sm:w-full sm:p-8 border border-white/20 dark:border-slate-700/20 relative group shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] ${currentVariant.glowColor}`}
        >
          {/* Premium Gradient Border Effect */}
          <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${currentVariant.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>

          {/* Enhanced glow effect */}
          <div className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-r ${currentVariant.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10 pointer-events-none`}></div>

          {/* Content Container */}
          <div className="relative z-10">
            {/* Header with Icon */}
            <div className="flex items-start space-x-4 mb-6">
              {/* Icon */}
              {IconComponent && (
                <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 ${currentVariant.iconBg} rounded-2xl ring-2 ring-white/20 dark:ring-slate-700/20`}>
                  <IconComponent className={`w-6 h-6 ${currentVariant.iconColor}`} />
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-300 group/close backdrop-blur-sm hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-300/50 dark:border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-6 py-2.5 text-sm font-medium text-white rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:scale-105 active:scale-95 disabled:scale-100 ${
                  isLoading ? currentVariant.confirmDisabled : `${currentVariant.confirmBg} focus:ring-offset-2`
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>

          {/* Context7 Premium Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>

          {/* Premium sparkle effect */}
          <div className="absolute top-4 right-4 w-1 h-1 bg-slate-400 dark:bg-slate-300 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute bottom-8 left-8 w-0.5 h-0.5 bg-slate-400 dark:bg-slate-300 rounded-full animate-pulse opacity-40 delay-500"></div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;