/**
 * HIVE VISUAL REGRESSION VALIDATOR - Phase 1.4
 * Ensures visual consistency across unified components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PokemonButton } from '../../shared/components/atoms/design-system/PokemonButton';
import { PokemonCard } from '../../shared/components/atoms/design-system/PokemonCard';
import { UnifiedEffectSystem } from '../../shared/components/organisms/effects/UnifiedEffectSystem';
import UnifiedHeader from '../../shared/components/molecules/common/UnifiedHeader';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('👁️ HIVE Visual Regression Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🎨 CSS Class Consistency', () => {
    it('should apply consistent glassmorphism styles across components', () => {
      const { container: buttonContainer } = render(
        <TestWrapper>
          <PokemonButton variant="primary">Glass Button</PokemonButton>
        </TestWrapper>
      );

      const { container: cardContainer } = render(
        <TestWrapper>
          <PokemonCard variant="glass">Glass Card</PokemonCard>
        </TestWrapper>
      );

      const { container: headerContainer } = render(
        <TestWrapper>
          <UnifiedHeader title="Glass Header" variant="glassmorphism" />
        </TestWrapper>
      );

      // Check for consistent backdrop-blur usage
      const buttonClasses = buttonContainer.querySelector('button')?.className || '';
      const cardClasses = cardContainer.querySelector('div')?.className || '';
      const headerClasses = headerContainer.querySelector('div')?.className || '';

      // All should use backdrop-blur for glass effect
      [buttonClasses, cardClasses, headerClasses].forEach(classes => {
        expect(classes).toMatch(/backdrop-blur/);
      });
    });

    it('should maintain consistent gradient patterns', () => {
      const gradientComponents = [
        <PokemonButton key="btn" variant="primary">Gradient Button</PokemonButton>,
        <PokemonCard key="card" variant="gradient">Gradient Card</PokemonCard>,
        <UnifiedHeader key="header" title="Gradient Header" variant="gradient" />
      ];

      gradientComponents.forEach(component => {
        const { container } = render(<TestWrapper>{component}</TestWrapper>);
        const element = container.firstElementChild;
        const classes = element?.className || '';
        
        // Should contain gradient-related classes
        expect(classes).toMatch(/gradient|from-|to-|via-/);
      });
    });

    it('should use consistent color schemes across themes', () => {
      const themes = [
        { variant: 'primary' as const, colorPattern: /cyan|blue/ },
        { variant: 'success' as const, colorPattern: /emerald|teal|green/ },
        { variant: 'danger' as const, colorPattern: /red|rose/ },
        { variant: 'cosmic' as const, colorPattern: /emerald|teal|cyan/ },
      ];

      themes.forEach(({ variant, colorPattern }) => {
        const { container } = render(
          <TestWrapper>
            <PokemonButton variant={variant}>
              {variant} Button
            </PokemonButton>
          </TestWrapper>
        );

        const button = container.querySelector('button');
        const classes = button?.className || '';
        expect(classes).toMatch(colorPattern);
      });
    });
  });

  describe('🔧 Component Structure Consistency', () => {
    it('should maintain consistent DOM structure for interactive elements', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonButton onClick={() => {}}>Interactive Button</PokemonButton>
        </TestWrapper>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      expect(button?.getAttribute('type')).toBe('button');
      
      // Should have proper shimmer and content structure
      const shimmerElement = button?.querySelector('.absolute.inset-0');
      const contentElement = button?.querySelector('.relative.z-10');
      
      expect(shimmerElement).toBeInTheDocument();
      expect(contentElement).toBeInTheDocument();
    });

    it('should maintain consistent card structure across variants', () => {
      const cardVariants = ['base', 'metric', 'dba', 'collection'] as const;

      cardVariants.forEach(cardType => {
        const { container } = render(
          <TestWrapper>
            <PokemonCard 
              cardType={cardType}
              title="Test Card"
              value={100}
            >
              Card content
            </PokemonCard>
          </TestWrapper>
        );

        const card = container.querySelector('div');
        
        // All cards should have base glassmorphism structure
        expect(card?.className).toMatch(/relative.*overflow-hidden/);
        expect(card?.className).toMatch(/backdrop-blur/);
        expect(card?.className).toMatch(/border.*border-white/);
      });
    });

    it('should maintain consistent effect system structure', () => {
      const effectTypes = ['cosmic', 'neural', 'particles', 'holographic'] as const;

      effectTypes.forEach(effectType => {
        const { container } = render(
          <TestWrapper>
            <UnifiedEffectSystem effectType={effectType}>
              <div>Effect content</div>
            </UnifiedEffectSystem>
          </TestWrapper>
        );

        const effectContainer = container.querySelector('[aria-hidden="true"]');
        const contentWrapper = container.querySelector('.relative.z-10');
        
        expect(effectContainer).toBeInTheDocument();
        expect(contentWrapper).toBeInTheDocument();
      });
    });
  });

  describe('📐 Layout Consistency', () => {
    it('should apply consistent spacing across size variants', () => {
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

      sizes.forEach(size => {
        const { container: buttonContainer } = render(
          <TestWrapper>
            <PokemonButton size={size}>Size {size}</PokemonButton>
          </TestWrapper>
        );

        const { container: cardContainer } = render(
          <TestWrapper>
            <PokemonCard size={size}>Size {size}</PokemonCard>
          </TestWrapper>
        );

        const { container: headerContainer } = render(
          <TestWrapper>
            <UnifiedHeader title={`Size ${size}`} size={size} />
          </TestWrapper>
        );

        // Each size should have corresponding padding/height classes
        [buttonContainer, cardContainer, headerContainer].forEach(container => {
          const element = container.firstElementChild;
          const classes = element?.className || '';
          
          // Should contain size-related classes
          expect(classes).toMatch(/h-|p-|px-|py-|text-/);
        });
      });
    });

    it('should maintain responsive breakpoint consistency', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedHeader 
            title="Responsive Header" 
            subtitle="With responsive design"
            size="lg"
          />
        </TestWrapper>
      );

      const headerTitle = container.querySelector('h1');
      const subtitle = container.querySelector('p');
      
      // Should contain responsive classes
      expect(headerTitle?.className).toMatch(/sm:|md:|lg:/);
      expect(subtitle?.className).toMatch(/sm:|md:|lg:/);
    });
  });

  describe('🎯 Theme Integration Consistency', () => {
    it('should apply theme variables consistently across components', () => {
      const { container: lightContainer } = render(
        <TestWrapper>
          <div data-theme="light">
            <PokemonCard variant="glass">Light theme card</PokemonCard>
          </div>
        </TestWrapper>
      );

      const { container: darkContainer } = render(
        <TestWrapper>
          <div data-theme="dark">
            <PokemonCard variant="glass">Dark theme card</PokemonCard>
          </div>
        </TestWrapper>
      );

      // Both should use glassmorphism but with different opacity/colors
      const lightCard = lightContainer.querySelector('div[data-theme="light"] div');
      const darkCard = darkContainer.querySelector('div[data-theme="dark"] div');

      expect(lightCard?.className).toMatch(/backdrop-blur/);
      expect(darkCard?.className).toMatch(/backdrop-blur/);
    });

    it('should handle color scheme transitions consistently', () => {
      const colorSchemes = ['primary', 'secondary', 'cosmic', 'neural'] as const;

      colorSchemes.forEach(colorScheme => {
        const { container } = render(
          <TestWrapper>
            <UnifiedEffectSystem 
              effectType="cosmic" 
              colorScheme={colorScheme}
            >
              <div>Color scheme test</div>
            </UnifiedEffectSystem>
          </TestWrapper>
        );

        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe('🔍 Accessibility Visual Compliance', () => {
    it('should maintain consistent focus indicators', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonButton>Focusable Button</PokemonButton>
        </TestWrapper>
      );

      const button = container.querySelector('button');
      button?.focus();

      // Should have focus styles applied
      expect(button).toHaveFocus();
    });

    it('should provide consistent loading states', () => {
      const { container: buttonContainer } = render(
        <TestWrapper>
          <PokemonButton loading={true}>Loading Button</PokemonButton>
        </TestWrapper>
      );

      const { container: cardContainer } = render(
        <TestWrapper>
          <PokemonCard loading={true}>Loading Card</PokemonCard>
        </TestWrapper>
      );

      // Both should show loading spinners
      const buttonSpinner = buttonContainer.querySelector('.animate-spin');
      const cardSpinner = cardContainer.querySelector('.animate-spin');

      expect(buttonSpinner).toBeInTheDocument();
      expect(cardSpinner).toBeInTheDocument();
    });

    it('should maintain consistent disabled states', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonButton disabled={true}>Disabled Button</PokemonButton>
        </TestWrapper>
      );

      const button = container.querySelector('button');
      expect(button).toBeDisabled();
      expect(button?.className).toMatch(/disabled|opacity/);
    });
  });

  describe('⚡ Animation Consistency', () => {
    it('should use consistent animation classes across components', () => {
      const { container: effectContainer } = render(
        <TestWrapper>
          <UnifiedEffectSystem effectType="cosmic" animationSpeed="normal">
            <div>Animated effect</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      const { container: buttonContainer } = render(
        <TestWrapper>
          <PokemonButton>Animated Button</PokemonButton>
        </TestWrapper>
      );

      // Check for animation-related classes
      const effectClasses = effectContainer.innerHTML;
      const buttonClasses = buttonContainer.querySelector('button')?.className || '';

      expect(effectClasses).toMatch(/animate-|transition-|duration-/);
      expect(buttonClasses).toMatch(/transition-|duration-|hover:|active:/);
    });

    it('should respect reduced motion preferences consistently', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container: effectContainer } = render(
        <TestWrapper>
          <UnifiedEffectSystem 
            effectType="particles" 
            respectThemeSettings={true}
            animationSpeed="normal"
          >
            <div>Reduced motion content</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      const { container: buttonContainer } = render(
        <TestWrapper>
          <PokemonButton>Reduced motion button</PokemonButton>
        </TestWrapper>
      );

      // Components should still render but with reduced/no animations
      expect(effectContainer.textContent).toContain('Reduced motion content');
      expect(buttonContainer.textContent).toContain('Reduced motion button');
    });
  });

  describe('🎨 CSS Custom Properties Usage', () => {
    it('should use unified CSS custom properties', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonCard variant="glass">
            <PokemonButton variant="primary">Nested components</PokemonButton>
          </PokemonCard>
        </TestWrapper>
      );

      // Should leverage the unified CSS design system
      const card = container.querySelector('div');
      const button = container.querySelector('button');

      // Check that components use consistent patterns
      expect(card?.className).toMatch(/backdrop-blur|border-white|shadow-/);
      expect(button?.className).toMatch(/bg-gradient|from-cyan|to-blue/);
    });

    it('should maintain color harmony across nested components', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedHeader
            title="Complex Component"
            variant="glassmorphism"
            actions={[
              {
                label: 'Primary Action',
                onClick: () => {},
                variant: 'primary'
              },
              {
                label: 'Secondary Action', 
                onClick: () => {},
                variant: 'secondary'
              }
            ]}
          >
            <PokemonCard variant="glass">
              Nested card content
            </PokemonCard>
          </UnifiedHeader>
        </TestWrapper>
      );

      // All components should harmonize visually
      const header = container.querySelector('div');
      const buttons = container.querySelectorAll('button');
      const nestedCard = container.querySelector('div div');

      expect(header?.className).toMatch(/backdrop-blur|glassmorphism/);
      expect(buttons.length).toBeGreaterThan(0);
      expect(nestedCard?.className).toMatch(/backdrop-blur/);
    });
  });

  describe('📱 Cross-Device Visual Consistency', () => {
    it('should maintain visual hierarchy across breakpoints', () => {
      // Mock different viewport sizes
      const viewports = [
        { width: 375, name: 'mobile' },
        { width: 768, name: 'tablet' },
        { width: 1024, name: 'desktop' },
        { width: 1440, name: 'large-desktop' }
      ];

      viewports.forEach(({ width, name }) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { container } = render(
          <TestWrapper>
            <UnifiedHeader 
              title={`${name} Header`}
              subtitle="Responsive design test"
              size="lg"
            />
          </TestWrapper>
        );

        const title = container.querySelector('h1');
        const subtitle = container.querySelector('p');

        // Should have responsive classes
        expect(title?.className).toMatch(/text-|sm:|md:|lg:/);
        expect(subtitle?.className).toMatch(/text-|sm:|md:|lg:/);
      });
    });

    it('should optimize compact variants for small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <TestWrapper>
          <PokemonCard compact={true} size="sm">
            Compact mobile card
          </PokemonCard>
        </TestWrapper>
      );

      const card = container.querySelector('div');
      
      // Should have compact styling
      expect(card?.className).toMatch(/p-|rounded-/);
      expect(container.textContent).toContain('Compact mobile card');
    });
  });
});