/**
 * UNIFIED CARD COMPONENT - Phase 1.4
 * Consolidates 6+ card variants into single unified component
 * 
 * CRITICAL FEATURES:
 * - Uses CSS variables from unified-design-system.css
 * - Supports all themes (light/dark/pokemon/glass/cosmic)
 * - Class Variance Authority (CVA) patterns
 * - Backwards compatibility with existing components
 * - Density awareness for different layout needs
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/utils";

const unifiedCardVariants = cva(
  [
    // Base styles using CSS variables
    "rounded-lg text-[var(--theme-text-primary)]",
    "transition-all duration-[var(--duration-normal)] ease-[var(--ease-premium)]",
    "relative overflow-hidden"
  ],
  {
    variants: {
      variant: {
        // shadcn/ui compatible variants
        default: [
          "bg-[var(--theme-surface)] border border-[var(--theme-border-primary)]",
          "shadow-[var(--shadow-sm)]"
        ],
        elevated: [
          "bg-[var(--theme-surface)] border border-[var(--theme-border-primary)]",
          "shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
        ],
        outline: [
          "bg-transparent border-2 border-[var(--theme-border-primary)]"
        ],

        // Pokemon-specific variants
        pokemon: [
          "bg-[var(--theme-surface)]",
          "border border-[var(--color-pokemon-blue)]/20",
          "shadow-[0_4px_14px_0_rgba(0,117,190,0.1)]",
          "hover:shadow-[0_6px_20px_0_rgba(0,117,190,0.2)]",
          "hover:border-[var(--color-pokemon-blue)]/30"
        ],
        pokemonGradient: [
          "bg-gradient-to-br from-[var(--theme-surface)] to-[var(--color-pokemon-blue)]/5",
          "border border-[var(--color-pokemon-blue)]/20",
          "shadow-[0_4px_14px_0_rgba(0,117,190,0.1)]"
        ],

        // Glass variants using unified glassmorphism classes
        glass: [
          "glass-morphism",
          "text-[var(--theme-text-primary)]"
        ],
        glassSubtle: [
          "glass-morphism-subtle",
          "text-[var(--theme-text-primary)]"
        ],
        glassHeavy: [
          "glass-morphism-heavy",
          "text-[var(--theme-text-primary)]"
        ],

        // Context7 premium variants
        cosmic: [
          "glass-morphism-cosmic",
          "text-white",
          "hover:scale-[1.01]",
          "before:absolute before:inset-0",
          "before:bg-gradient-to-r before:from-[var(--color-neural-purple)]/10 before:to-[var(--color-cyber-cyan)]/10"
        ],
        neural: [
          "bg-gradient-to-br from-[var(--theme-bg-primary)] to-[var(--theme-bg-secondary)]",
          "border border-[var(--color-neural-purple)]/20",
          "shadow-[0_0_20px_rgba(99,102,241,0.1)]",
          "hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]",
          "relative",
          "before:absolute before:inset-0 before:bg-[var(--gradient-neural-radial)] before:pointer-events-none"
        ],
        quantum: [
          "bg-gradient-to-br from-[var(--theme-bg-primary)] to-[var(--color-quantum-pink)]/10",
          "border border-[var(--color-quantum-pink)]/20",
          "backdrop-blur-xl",
          "shadow-[0_0_25px_rgba(168,85,247,0.15)]",
          "hover:shadow-[0_0_35px_rgba(168,85,247,0.25)]"
        ]
      },

      size: {
        xs: "p-2",
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
        xl: "p-12"
      },

      density: {
        compact: "p-2 space-y-1",
        comfortable: "", // Default
        spacious: "p-8 space-y-4"
      },

      interactive: {
        false: "",
        true: [
          "cursor-pointer",
          "hover:scale-[1.01] hover:-translate-y-0.5",
          "active:scale-[0.99] active:translate-y-0",
          "focus-within:ring-2 focus-within:ring-[var(--theme-border-accent)] focus-within:ring-offset-2"
        ]
      },

      status: {
        none: "",
        success: [
          "border-l-4 border-l-[var(--color-pokemon-green)]",
          "bg-gradient-to-r from-[var(--color-pokemon-green)]/5 to-transparent"
        ],
        warning: [
          "border-l-4 border-l-[var(--color-pokemon-yellow)]",
          "bg-gradient-to-r from-[var(--color-pokemon-yellow)]/5 to-transparent"
        ],
        danger: [
          "border-l-4 border-l-red-500",
          "bg-gradient-to-r from-red-500/5 to-transparent"
        ],
        info: [
          "border-l-4 border-l-[var(--color-pokemon-blue)]",
          "bg-gradient-to-r from-[var(--color-pokemon-blue)]/5 to-transparent"
        ]
      }
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      density: "comfortable",
      interactive: false,
      status: "none"
    }
  }
);

export interface UnifiedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof unifiedCardVariants> {
  loading?: boolean;
  disabled?: boolean;
}

const UnifiedCard = React.forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({ 
    className, 
    variant, 
    size, 
    density,
    interactive,
    status,
    loading = false,
    disabled = false,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          unifiedCardVariants({ variant, size, density, interactive, status }),
          loading && "animate-pulse pointer-events-none",
          disabled && "opacity-50 pointer-events-none cursor-not-allowed",
          className
        )}
        aria-busy={loading}
        aria-disabled={disabled}
        {...props}
      >
        {/* Holographic border effect for premium variants */}
        {(variant === "cosmic" || variant === "neural" || variant === "quantum") && (
          <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-[var(--color-cyber-cyan)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[var(--theme-bg-primary)]/50 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="w-8 h-8 border-2 border-[var(--theme-border-accent)]/30 border-t-[var(--theme-border-accent)] rounded-full animate-spin" />
          </div>
        )}

        {/* Card content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

UnifiedCard.displayName = "UnifiedCard";

// Card sub-components for structured content
const UnifiedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { density?: "compact" | "comfortable" | "spacious" }
>(({ className, density = "comfortable", ...props }, ref) => {
  const densityClasses = {
    compact: "space-y-1 pb-2",
    comfortable: "space-y-1.5 pb-4",
    spacious: "space-y-2 pb-6"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col",
        densityClasses[density],
        className
      )}
      {...props}
    />
  );
});
UnifiedCardHeader.displayName = "UnifiedCardHeader";

const UnifiedCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight text-[var(--theme-text-primary)]",
      className
    )}
    {...props}
  />
));
UnifiedCardTitle.displayName = "UnifiedCardTitle";

const UnifiedCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm text-[var(--theme-text-secondary)]",
      className
    )}
    {...props}
  />
));
UnifiedCardDescription.displayName = "UnifiedCardDescription";

const UnifiedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { density?: "compact" | "comfortable" | "spacious" }
>(({ className, density = "comfortable", ...props }, ref) => {
  const densityClasses = {
    compact: "pt-1",
    comfortable: "pt-0",
    spacious: "pt-2"
  };

  return (
    <div 
      ref={ref} 
      className={cn(densityClasses[density], className)} 
      {...props} 
    />
  );
});
UnifiedCardContent.displayName = "UnifiedCardContent";

const UnifiedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { density?: "compact" | "comfortable" | "spacious" }
>(({ className, density = "comfortable", ...props }, ref) => {
  const densityClasses = {
    compact: "flex items-center pt-2",
    comfortable: "flex items-center pt-4",
    spacious: "flex items-center pt-6"
  };

  return (
    <div
      ref={ref}
      className={cn(densityClasses[density], className)}
      {...props}
    />
  );
});
UnifiedCardFooter.displayName = "UnifiedCardFooter";

// Export components and variants for backwards compatibility
export {
  UnifiedCard as Card,
  UnifiedCardHeader as CardHeader,
  UnifiedCardTitle as CardTitle,
  UnifiedCardDescription as CardDescription,
  UnifiedCardContent as CardContent,
  UnifiedCardFooter as CardFooter,
  unifiedCardVariants,
  unifiedCardVariants as cardVariants
};

export type { UnifiedCardProps as CardProps };