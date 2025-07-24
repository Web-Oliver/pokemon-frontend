/**
 * Context7 Award-Winning Confirm Modal Component
 * Ultra-premium confirmation dialog with stunning visual hierarchy and micro-interactions
 * Specialized for delete operations with built-in danger styling
 * 
 * Following CLAUDE.md + Context7 + Catalyst UI principles:
 * - DRY: Now uses base Modal component to eliminate duplication
 * - Alert-style confirmation pattern from Catalyst UI
 * - Award-winning visual design with micro-interactions
 * - Danger state with red accent for delete operations
 * - Context7 design system compliance
 */

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';

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
  // Variant-specific styling
  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      confirmDisabled: 'bg-red-400 cursor-not-allowed',
    },
    warning: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      confirmDisabled: 'bg-yellow-400 cursor-not-allowed',
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      confirmBg: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      confirmDisabled: 'bg-blue-400 cursor-not-allowed',
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
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      title={title}
      maxWidth="lg"
    >
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
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>
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
    </Modal>
  );
};

export default ConfirmModal;