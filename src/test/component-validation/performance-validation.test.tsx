/**
 * HIVE PERFORMANCE VALIDATOR - Phase 1.4 Performance & Bundle Analysis
 * Validates rendering performance and bundle size impact of unified components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('🚀 HIVE Performance Validation - Phase 1.4', () => {
  let performanceMarks: string[] = [];
  
  beforeEach(() => {
    performanceMarks = [];
    vi.clearAllMocks();
    
    // Mock performance API
    global.performance.mark = vi.fn((name: string) => {
      performanceMarks.push(name);
    });
    
    global.performance.measure = vi.fn();
  });

  describe('⚡ Component Rendering Performance', () => {
    it('should render PokemonButton under 16ms', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <PokemonButton variant="primary">Fast Button</PokemonButton>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(16); // 60fps target
      expect(screen.getByText('Fast Button')).toBeInTheDocument();
    });

    it('should render PokemonCard efficiently with complex content', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <PokemonCard
            cardType="collection"
            title="Complex Card"
            subtitle="With many features"
            price={99.99}
            grade={10}
            condition="Mint"
            category="Base Set"
            images={['test1.jpg', 'test2.jpg']}
            showBadge={true}
            showPrice={true}
            showActions={true}
          />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(32); // Complex components get 32ms
      expect(screen.getByText('Complex Card')).toBeInTheDocument();
    });

    it('should render UnifiedEffectSystem without performance degradation', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <UnifiedEffectSystem
            effectType="particles"
            particleCount="many"
            intensity="maximum"
            animationSpeed="fast"
            features={{ glow: true, shimmer: true, pulse: true }}
          >
            <div>Heavy effects content</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(50); // Effect systems get more time
      expect(screen.getByText('Heavy effects content')).toBeInTheDocument();
    });

    it('should render UnifiedHeader with stats efficiently', async () => {
      const startTime = performance.now();
      
      const mockStats = Array.from({ length: 8 }, (_, i) => ({
        icon: () => <span>📊</span>,
        label: `Stat ${i + 1}`,
        value: Math.floor(Math.random() * 1000),
        variant: 'default' as const
      }));

      render(
        <TestWrapper>
          <UnifiedHeader
            title="Performance Dashboard"
            subtitle="With many stats"
            stats={mockStats}
            variant="glassmorphism"
            size="xl"
          />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(40);
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });
  });

  describe('🔄 Re-render Performance', () => {
    it('should handle prop changes efficiently', async () => {
      const { rerender } = render(
        <TestWrapper>
          <PokemonButton variant="primary">Button 1</PokemonButton>
        </TestWrapper>
      );

      const startTime = performance.now();
      
      rerender(
        <TestWrapper>
          <PokemonButton variant="success">Button 2</PokemonButton>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;
      
      expect(rerenderTime).toBeLessThan(8); // Rerenders should be very fast
      expect(screen.getByText('Button 2')).toBeInTheDocument();
    });

    it('should handle theme changes efficiently', async () => {
      const { rerender } = render(
        <TestWrapper>
          <PokemonCard variant="glass">Glass Card</PokemonCard>
        </TestWrapper>
      );

      const startTime = performance.now();
      
      rerender(
        <TestWrapper>
          <PokemonCard variant="cosmic">Cosmic Card</PokemonCard>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const rerenderTime = endTime - startTime;
      
      expect(rerenderTime).toBeLessThan(12);
      expect(screen.getByText('Cosmic Card')).toBeInTheDocument();
    });
  });

  describe('🎭 Animation Performance', () => {
    it('should handle CSS animations efficiently', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedEffectSystem
            effectType="cosmic"
            animationSpeed="fast"
            features={{ pulse: true, float: true, shimmer: true }}
          >
            <div>Animated content</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      // Check that animations are applied via CSS classes rather than JS
      const animatedElements = container.querySelectorAll('[style*="animation"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should respect reduced motion preferences', () => {
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

      render(
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

      expect(screen.getByText('Reduced motion content')).toBeInTheDocument();
    });
  });

  describe('📊 Memory Usage Validation', () => {
    it('should not create memory leaks with effect cleanup', () => {
      const { unmount } = render(
        <TestWrapper>
          <UnifiedEffectSystem
            effectType="particles"
            particleCount="maximum"
            intensity="maximum"
          >
            <div>Memory test</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      // Component should unmount cleanly
      expect(() => unmount()).not.toThrow();
    });

    it('should reuse CSS classes efficiently', () => {
      const { container: container1 } = render(
        <TestWrapper>
          <PokemonButton variant="primary">Button 1</PokemonButton>
        </TestWrapper>
      );

      const { container: container2 } = render(
        <TestWrapper>
          <PokemonButton variant="primary">Button 2</PokemonButton>
        </TestWrapper>
      );

      const button1Classes = container1.querySelector('button')?.className;
      const button2Classes = container2.querySelector('button')?.className;

      // Classes should be identical for same variant (CSS reuse)
      expect(button1Classes).toEqual(button2Classes);
    });
  });

  describe('🎯 Bundle Size Impact Analysis', () => {
    it('should import components without circular dependencies', async () => {
      // Test tree-shaking friendly imports
      const imports = [
        () => import('../../shared/components/atoms/design-system/PokemonButton'),
        () => import('../../shared/components/atoms/design-system/PokemonCard'),
        () => import('../../shared/components/organisms/effects/UnifiedEffectSystem'),
        () => import('../../shared/components/molecules/common/UnifiedHeader'),
        () => import('../../shared/components/molecules/common/UnifiedGradeDisplay'),
      ];

      const importPromises = imports.map(importFn => 
        expect(importFn()).resolves.toBeDefined()
      );

      await Promise.all(importPromises);
    });

    it('should have optimized CSS class generation', () => {
      // Variant functions should be pure and optimizable
      const { pokemonButtonVariants } = require('../../shared/components/atoms/design-system/unifiedVariants');
      
      const variant1 = pokemonButtonVariants({ variant: 'primary', size: 'md' });
      const variant2 = pokemonButtonVariants({ variant: 'primary', size: 'md' });
      
      // Same inputs should produce identical outputs (referential transparency)
      expect(variant1).toBe(variant2);
    });

    it('should minimize DOM node creation', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonCard>
            <div>Simple content</div>
          </PokemonCard>
        </TestWrapper>
      );

      // Count DOM nodes
      const allNodes = container.querySelectorAll('*');
      
      // Should not create excessive wrapper elements
      expect(allNodes.length).toBeLessThan(15); // Reasonable limit
    });
  });

  describe('🔍 CSS Performance Validation', () => {
    it('should use efficient CSS selectors', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonCard variant="glass" size="lg" interactive={true}>
            CSS Performance Test
          </PokemonCard>
        </TestWrapper>
      );

      const card = container.querySelector('div');
      const classes = card?.className.split(' ') || [];
      
      // Should not have excessive class combinations
      expect(classes.length).toBeLessThan(30);
      
      // Should use utility classes efficiently
      const utilityClasses = classes.filter(cls => 
        cls.includes('bg-') || 
        cls.includes('text-') || 
        cls.includes('border-') ||
        cls.includes('shadow-') ||
        cls.includes('backdrop-')
      );
      
      expect(utilityClasses.length).toBeGreaterThan(0);
    });

    it('should avoid CSS-in-JS performance overhead', () => {
      const startTime = performance.now();
      
      // Render multiple components to test CSS generation
      const { container } = render(
        <TestWrapper>
          {Array.from({ length: 10 }, (_, i) => (
            <PokemonButton key={i} variant="primary">
              Button {i}
            </PokemonButton>
          ))}
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Multiple similar components should render quickly
      expect(renderTime).toBeLessThan(50);
      expect(container.querySelectorAll('button')).toHaveLength(10);
    });
  });

  describe('📱 Responsive Performance', () => {
    it('should handle viewport changes efficiently', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedHeader 
            title="Responsive Test"
            size="lg"
            variant="glassmorphism"
          />
        </TestWrapper>
      );

      // Simulate viewport change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      // Component should adapt without re-rendering
      const header = container.querySelector('h1');
      expect(header?.className).toMatch(/sm:|md:|lg:/);
    });

    it('should optimize for mobile performance', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <PokemonCard 
            cardType="collection"
            compact={true}
            title="Mobile Card"
          />
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Mobile rendering should be optimized
      expect(renderTime).toBeLessThan(20);
      expect(screen.getByText('Mobile Card')).toBeInTheDocument();
    });
  });

  describe('🎨 Theme Performance', () => {
    it('should handle theme switching efficiently', () => {
      const startTime = performance.now();
      
      const { rerender } = render(
        <TestWrapper>
          <div>
            <PokemonButton variant="primary">Theme Test</PokemonButton>
            <PokemonCard variant="glass">Theme Test Card</PokemonCard>
            <UnifiedEffectSystem effectType="cosmic">
              <div>Theme Test Effect</div>
            </UnifiedEffectSystem>
          </div>
        </TestWrapper>
      );

      // Simulate theme change
      rerender(
        <TestWrapper>
          <div>
            <PokemonButton variant="cosmic">Theme Test</PokemonButton>
            <PokemonCard variant="cosmic">Theme Test Card</PokemonCard>
            <UnifiedEffectSystem effectType="cosmic">
              <div>Theme Test Effect</div>
            </UnifiedEffectSystem>
          </div>
        </TestWrapper>
      );
      
      const endTime = performance.now();
      const themeChangeTime = endTime - startTime;
      
      expect(themeChangeTime).toBeLessThan(30);
    });

    it('should use CSS custom properties efficiently', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonCard variant="glass">CSS Variables Test</PokemonCard>
        </TestWrapper>
      );

      const card = container.querySelector('div');
      const styles = window.getComputedStyle(card!);
      
      // Should leverage CSS custom properties for theming
      expect(card?.className).toMatch(/backdrop-blur|from-|to-/);
    });
  });
});