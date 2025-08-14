import React, { forwardRef, useEffect } from 'react';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '../../../ui/primitives/Modal';
import { ComponentSize, StandardModalProps } from '../../types/themeTypes';
import { cn } from '../../../utils/ui/classNameUtils';
import { useTheme } from '../../../../hooks/use-theme';
import { PokemonButton } from './PokemonButton';
import { pokemonModalVariants } from './unifiedVariants';

export interface PokemonModalProps extends Omit<StandardModalProps, 'size'> {
  // Base modal props
  isOpen?: boolean; // Legacy support
  open?: boolean; // Theme system support
  onClose: () => void;
  title?: string;
  children: React.ReactNode;

  // Size and layout
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  maxWidth?: ComponentSize | 'fullscreen';
  variant?: 'default' | 'glass' | 'solid' | 'center';
  centered?: boolean;

  // Behavior
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean; // Legacy support
  closeOnBackdrop?: boolean; // Theme system support
  closeOnEscape?: boolean;
  loading?: boolean;

  // Enhanced features
  footer?: React.ReactNode;
  theme?: string;
  _colorScheme?: string;
  density?: 'compact' | 'normal' | 'spacious';
  animationIntensity?: 'none' | 'reduced' | 'normal' | 'enhanced';
  testId?: string;
  className?: string;

  // Confirmation modal features (from ConfirmModal)
  confirmVariant?: 'confirm' | 'warning' | 'danger' | 'info';
  confirmTitle?: string;
  confirmMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;

  // Item selector features (from ItemSelectorModal)
  searchable?: boolean;
  multiSelect?: boolean;
  items?: any[];
  onItemSelect?: (item: any) => void;
  renderItem?: (item: any) => React.ReactNode;
}

export const PokemonModal = forwardRef<HTMLDivElement, PokemonModalProps>(
  (
    {
      // Base props
      isOpen, // Legacy support
      open, // Theme system support
      onClose,
      title,
      children,

      // Size and layout
      size = 'md',
      maxWidth,
      variant = 'glass',
      centered = true,

      // Behavior
      showCloseButton = true,
      closeOnOverlayClick, // Legacy support
      closeOnBackdrop, // Theme system support
      closeOnEscape = true,
      loading = false,

      // Enhanced features
      footer,
      theme,
      _colorScheme,
      density,
      animationIntensity,
      testId,
      className = '',

      // Confirmation modal features
      confirmVariant,
      confirmTitle,
      confirmMessage,
      confirmButtonText = 'Confirm',
      cancelButtonText = 'Cancel',
      onConfirm,
      onCancel,

      // Item selector features
      searchable,
      multiSelect,
      items,
      onItemSelect,
      renderItem,

      ...domProps
    },
    ref
  ) => {
    // Theme context integration
    const themeContext = useTheme();

    // Resolve open state (legacy vs theme system)
    const modalOpen = open !== undefined ? open : isOpen || false;

    // Size mapping
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-[95vw]',
      fullscreen: 'w-screen h-screen max-w-none max-h-none',
    };

    // Confirmation modal content
    const renderConfirmationContent = () => {
      if (!confirmVariant) return null;

      const iconMap = {
        confirm: Check,
        warning: AlertTriangle,
        danger: AlertTriangle,
        info: Info,
      };

      const colorMap = {
        confirm: 'text-emerald-500',
        warning: 'text-amber-500',
        danger: 'text-red-500',
        info: 'text-blue-500',
      };

      const Icon = iconMap[confirmVariant];

      return (
        <div className="text-center space-y-4">
          {Icon && (
            <div className={cn('mx-auto w-16 h-16 rounded-full flex items-center justify-center', colorMap[confirmVariant])}>
              <Icon className="w-8 h-8" />
            </div>
          )}
          <DialogHeader>
            <DialogTitle>{confirmTitle || title}</DialogTitle>
            {confirmMessage && <DialogDescription>{confirmMessage}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <PokemonButton variant="outline" onClick={() => { onCancel?.(); onClose(); }}>
              {cancelButtonText}
            </PokemonButton>
            <PokemonButton 
              variant={confirmVariant === 'danger' ? 'danger' : 'primary'} 
              onClick={() => { onConfirm?.(); onClose(); }}
            >
              {confirmButtonText}
            </PokemonButton>
          </DialogFooter>
        </div>
      );
    };

    // Item selector content
    const renderItemSelectorContent = () => {
      if (!items) return null;

      return (
        <div className="space-y-4">
          {searchable && (
            <div className="border-b border-slate-700 pb-4">
              <input
                type="text"
                placeholder="Search items..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              />
            </div>
          )}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                onClick={() => onItemSelect?.(item)}
              >
                {renderItem ? renderItem(item) : JSON.stringify(item)}
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <Dialog open={modalOpen} onOpenChange={() => onClose()}>
        <DialogContent 
          ref={ref}
          className={cn(
            // Pokemon theming on top of shadcn
            'bg-gradient-to-br from-zinc-900/95 to-slate-900/95',
            'backdrop-blur-xl border border-cyan-500/20',
            'shadow-2xl shadow-cyan-500/10',
            'text-zinc-100',
            sizeClasses[size || 'md'],
            className
          )}
          data-testid={testId}
          {...domProps}
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {confirmVariant ? (
                renderConfirmationContent()
              ) : items ? (
                renderItemSelectorContent()
              ) : (
                <>
                  {title && !confirmVariant && (
                    <DialogHeader>
                      <DialogTitle className="text-white">{title}</DialogTitle>
                    </DialogHeader>
                  )}
                  {children}
                  {footer && <DialogFooter>{footer}</DialogFooter>}
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }
);

PokemonModal.displayName = 'PokemonModal';

// Convenience components for common patterns
export const PokemonConfirmModal: React.FC<
  Omit<PokemonModalProps, 'confirmVariant'> & {
    variant?: 'confirm' | 'warning' | 'danger' | 'info';
  }
> = ({ variant = 'confirm', ...props }) => (
  <PokemonModal {...props} confirmVariant={variant} />
);

export const PokemonItemSelectorModal = <T extends any>({
  items,
  onItemSelect,
  renderItem,
  searchable = true,
  ...props
}: Omit<PokemonModalProps, 'items' | 'onItemSelect' | 'renderItem'> & {
  items: T[];
  onItemSelect: (item: T) => void;
  renderItem?: (item: T) => React.ReactNode;
  searchable?: boolean;
}) => (
  <PokemonModal
    {...props}
    items={items}
    onItemSelect={onItemSelect}
    renderItem={renderItem}
    searchable={searchable}
  />
);