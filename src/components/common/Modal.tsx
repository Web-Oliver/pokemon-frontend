/**
 * Context7 Award-Winning Modal Component
 * Ultra-premium modal with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 * 
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and premium backdrop effects
 * - Context7 design system compliance
 * - Stunning animations and focus management
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Context7 Premium Backdrop with Glass-morphism */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-indigo-900/60 to-purple-900/80 backdrop-blur-xl transition-all duration-500 ease-out"
          onClick={onClose}
        />
        
        {/* Enhanced gradient overlay for depth */}
        <div className="fixed inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

        {/* Premium Animated Particles Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-indigo-300/30 rounded-full animate-bounce delay-100"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-300/25 rounded-full animate-pulse delay-200"></div>
        </div>

        {/* Centering span */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Context7 Premium Modal Panel */}
        <div
          className={`inline-block align-bottom bg-white/95 backdrop-blur-2xl rounded-3xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all duration-500 ease-out scale-95 hover:scale-100 sm:my-8 sm:align-middle ${maxWidthClass} sm:w-full sm:p-8 border border-white/20 relative group shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.25)]`}
        >
          {/* Premium Gradient Border Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          
          {/* Enhanced glow effect */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10 pointer-events-none"></div>
          
          {/* Content Container */}
          <div className="relative z-10">
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 group/close backdrop-blur-sm hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <X className="w-6 h-6 group-hover/close:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            )}

            {/* Premium Content Area */}
            <div className="relative">
              {children}
            </div>
          </div>
          
          {/* Context7 Premium Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
          
          {/* Premium sparkle effect */}
          <div className="absolute top-4 right-4 w-1 h-1 bg-indigo-400 rounded-full animate-pulse opacity-60"></div>
          <div className="absolute bottom-8 left-8 w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse opacity-40 delay-500"></div>
        </div>
      </div>
    </div>
  );
};

export default Modal;