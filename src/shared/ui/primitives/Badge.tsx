/**
 * UNIFIED BADGE COMPONENT - Phase 1.4
 * Consolidates badge variants into single unified component
 * 
 * CRITICAL FEATURES:
 * - Uses CSS variables from unified-design-system.css
 * - Status colors with theme awareness
 * - Size variants for different contexts
 * - Pokemon-specific styling options
 * - Accessibility compliant
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const unifiedBadgeVariants = cva(
  [
    // Base styles using CSS variables
    "inline-flex items-center rounded-md border font-semibold",
    "transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)]",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "whitespace-nowrap"
  ],
  {
    variants: {
      variant: {
        // shadcn/ui compatible variants
        default: [
          "border-transparent bg-[var(--theme-primary)] text-white",
          "shadow-sm hover:bg-[var(--theme-primary-hover)]"
        ],
        secondary: [
          "border-transparent bg-[var(--theme-bg-secondary)] text-[var(--theme-text-secondary)]",
          "hover:bg-[var(--theme-bg-accent)]"
        ],
        destructive: [
          "border-transparent bg-red-600 text-white",
          "shadow-sm hover:bg-red-700"
        ],
        outline: [
          "border-[var(--theme-border-primary)] bg-transparent text-[var(--theme-text-primary)]",
          "hover:bg-[var(--theme-bg-secondary)]"
        ],

        // Status variants using Pokemon colors
        success: [
          "border-transparent bg-[var(--color-pokemon-green)] text-white",
          "shadow-sm hover:bg-[var(--color-pokemon-green)]/90"
        ],
        warning: [
          "border-transparent bg-[var(--color-pokemon-yellow)] text-gray-900",
          "shadow-sm hover:bg-[var(--color-pokemon-yellow)]/90"
        ],
        error: [
          "border-transparent bg-red-500 text-white",
          "shadow-sm hover:bg-red-600"
        ],
        info: [
          "border-transparent bg-[var(--color-pokemon-blue)] text-white",
          "shadow-sm hover:bg-[var(--color-pokemon-blue)]/90"
        ],

        // Pokemon-specific variants
        pokemon: [
          "border-transparent bg-gradient-to-r from-[var(--color-pokemon-blue)] to-[var(--color-pokemon-red)]",
          "text-white shadow-sm",
          "hover:shadow-md hover:scale-105"
        ],
        pokemonOutline: [
          "border-[var(--color-pokemon-blue)] bg-transparent text-[var(--color-pokemon-blue)]",
          "hover:bg-[var(--color-pokemon-blue)] hover:text-white"
        ],

        // Grade-specific variants (for PSA cards, etc.)
        grade1to3: [
          "border-transparent bg-red-500 text-white",
          "shadow-sm"
        ],
        grade4to6: [
          "border-transparent bg-orange-500 text-white",
          "shadow-sm"
        ],
        grade7to8: [
          "border-transparent bg-yellow-500 text-gray-900",
          "shadow-sm"
        ],
        grade9: [
          "border-transparent bg-blue-500 text-white",
          "shadow-sm"
        ],
        grade10: [
          "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white",
          "shadow-lg animate-pulse"
        ],

        // Glass variants
        glass: [
          "glass-morphism-subtle border-white/20 text-[var(--theme-text-primary)]",
          "hover:bg-white/10"
        ],
        glassAccent: [
          "glass-morphism border-[var(--theme-border-accent)]/30",
          "text-[var(--theme-text-accent)]",
          "hover:bg-[var(--theme-border-accent)]/10"
        ],

        // Context7 premium variants
        cosmic: [
          "border-transparent bg-gradient-to-r from-[var(--color-neural-purple)]/80 to-[var(--color-cyber-cyan)]/80",
          "text-white backdrop-blur-sm",
          "shadow-[0_0_20px_rgba(99,102,241,0.3)]",
          "hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105"
        ],
        quantum: [
          "border-[var(--color-quantum-pink)]/40 bg-[var(--color-quantum-pink)]/10",
          "text-[var(--color-quantum-pink)] backdrop-blur-sm",
          "hover:bg-[var(--color-quantum-pink)]/20"
        ]
      },

      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base"
      },

      density: {
        compact: "px-1.5 py-0.5 text-xs",
        comfortable: "", // Default
        spacious: "px-4 py-1 text-sm"
      },

      interactive: {
        false: "",
        true: [
          "cursor-pointer",
          "hover:scale-105 active:scale-95",
          "focus:ring-[var(--theme-border-accent)]"
        ]
      }
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      density: "comfortable",
      interactive: false
    }
  }
);

export interface UnifiedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof unifiedBadgeVariants> {
  icon?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  loading?: boolean;
}

const UnifiedBadge = React.forwardRef<HTMLDivElement, UnifiedBadgeProps>(
  ({ 
    className, 
    variant, 
    size, 
    density,
    interactive,
    icon, 
    closable = false,
    onClose,
    loading = false,
    children,
    onClick,
    ...props 
  }, ref) => {
    const isInteractive = interactive || onClick || closable;

    const LoadingSpinner = () => (
      <svg 
        className="w-3 h-3 animate-spin" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    const CloseButton = () => (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10 focus:outline-none focus:ring-1 focus:ring-black/20 transition-colors"
        aria-label="Remove badge"
      >
        <svg 
          className="w-3 h-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </button>
    );

    return (
      <div
        className={cn(
          unifiedBadgeVariants({ variant, size, density, interactive: isInteractive }),
          loading && "pointer-events-none",
          className
        )}
        ref={ref}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={onClick ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e as any);
          }
        } : undefined}
        {...props}
      >
        {/* Badge content */}
        <div className="flex items-center gap-1">
          {loading ? (
            <LoadingSpinner />
          ) : icon ? (
            <span className="flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          
          {children && <span>{children}</span>}
          
          {closable && !loading && <CloseButton />}
        </div>

        {/* Shimmer effect for premium variants */}
        {(variant === "cosmic" || variant === "quantum" || variant === "pokemon") && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-md" />
        )}
      </div>
    );
  }
);

UnifiedBadge.displayName = "UnifiedBadge";

// Convenience components for common badge types
const StatusBadge: React.FC<Omit<UnifiedBadgeProps, "variant"> & { status: "success" | "warning" | "error" | "info" }> = 
  ({ status, ...props }) => <UnifiedBadge variant={status} {...props} />;

const GradeBadge: React.FC<Omit<UnifiedBadgeProps, "variant"> & { grade: number }> = 
  ({ grade, ...props }) => {
    const getGradeVariant = (grade: number) => {
      if (grade <= 3) return "grade1to3";
      if (grade <= 6) return "grade4to6";
      if (grade <= 8) return "grade7to8";
      if (grade === 9) return "grade9";
      return "grade10";
    };

    return <UnifiedBadge variant={getGradeVariant(grade)} {...props} />;
  };

const PokemonBadge: React.FC<Omit<UnifiedBadgeProps, "variant"> & { outlined?: boolean }> = 
  ({ outlined = false, ...props }) => (
    <UnifiedBadge variant={outlined ? "pokemonOutline" : "pokemon"} {...props} />
  );

// Export components and variants for backwards compatibility
export { 
  UnifiedBadge as Badge, 
  StatusBadge,
  GradeBadge,
  PokemonBadge,
  unifiedBadgeVariants,
  unifiedBadgeVariants as badgeVariants 
};

export type { UnifiedBadgeProps as BadgeProps };