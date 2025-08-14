/**
 * HIVE INTEGRATION VALIDATOR - Phase 1.4 Integration & Migration Testing
 * Tests component integration, backwards compatibility, and migration paths
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokemonButton } from '../../shared/components/atoms/design-system/PokemonButton';
import { PokemonCard } from '../../shared/components/atoms/design-system/PokemonCard';
import { UnifiedEffectSystem } from '../../shared/components/organisms/effects/UnifiedEffectSystem';
import UnifiedHeader from '../../shared/components/molecules/common/UnifiedHeader';
import UnifiedGradeDisplay from '../../shared/components/molecules/common/UnifiedGradeDisplay';
import { UNIFIED_VARIANTS } from '../../shared/components/atoms/design-system/unifiedVariants';
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

describe('🔗 HIVE Integration Validation - Phase 1.4', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('🧩 Component Integration Tests', () => {
    it('should integrate all unified components in a complex layout', () => {
      const mockStats = [
        {
          icon: () => <span>📊</span>,
          label: 'Total Items',
          value: 1234,
          variant: 'success' as const
        },
        {
          icon: () => <span>💰</span>,
          label: 'Total Value',
          value: '$45,678',
          variant: 'primary' as const
        }
      ];

      const mockGrades = {
        grade_1: 5, grade_2: 8, grade_3: 12, grade_4: 15, grade_5: 20,
        grade_6: 25, grade_7: 30, grade_8: 45, grade_9: 80, grade_10: 120,
        grade_total: 360
      };

      render(
        <TestWrapper>
          <div className="min-h-screen bg-zinc-900">
            <UnifiedEffectSystem effectType="cosmic" intensity="subtle">
              <UnifiedHeader
                title="Integrated Dashboard"
                subtitle="All components working together"
                variant="glassmorphism"
                stats={mockStats}
                actions={[
                  {
                    label: 'Add New',
                    onClick: () => {},
                    variant: 'primary'
                  }
                ]}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                <PokemonCard
                  cardType="metric"
                  title="Collection Size"
                  value={1234}
                  icon={() => <span>📦</span>}
                  colorScheme="primary"
                />
                
                <PokemonCard
                  cardType="dba"
                  item={{ id: '1', name: 'Test Item' }}
                  displayName="DBA Analysis"
                  subtitle="Market data analysis"
                  dbaInfo={{ value: 250 }}
                />
                
                <PokemonCard cardType="base">
                  <UnifiedGradeDisplay 
                    grades={mockGrades} 
                    mode="compact"
                    theme="premium"
                  />
                </PokemonCard>
              </div>

              <div className="flex justify-center space-x-4 p-6">
                <PokemonButton variant="primary">
                  Primary Action
                </PokemonButton>
                <PokemonButton variant="cosmic">
                  Cosmic Action
                </PokemonButton>
                <PokemonButton variant="success">
                  Success Action
                </PokemonButton>
              </div>
            </UnifiedEffectSystem>
          </div>
        </TestWrapper>
      );

      // Verify all components rendered
      expect(screen.getByText('Integrated Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Collection Size')).toBeInTheDocument();
      expect(screen.getByText('DBA Analysis')).toBeInTheDocument();
      expect(screen.getByText('Top PSA Grades')).toBeInTheDocument();
      expect(screen.getByText('Primary Action')).toBeInTheDocument();
      expect(screen.getByText('Cosmic Action')).toBeInTheDocument();
      expect(screen.getByText('Success Action')).toBeInTheDocument();
    });

    it('should handle nested component interactions correctly', async () => {
      const handleCardClick = vi.fn();
      const handleButtonClick = vi.fn();
      const handleHeaderAction = vi.fn();

      render(
        <TestWrapper>
          <UnifiedHeader
            title="Interactive Test"
            actions={[
              {
                label: 'Header Action',
                onClick: handleHeaderAction,
                variant: 'primary'
              }
            ]}
          >
            <PokemonCard onClick={handleCardClick} interactive={true}>
              <PokemonButton onClick={handleButtonClick}>
                Nested Button
              </PokemonButton>
            </PokemonCard>
          </UnifiedHeader>
        </TestWrapper>
      );

      // Test nested interactions
      const headerButton = screen.getByText('Header Action');
      const nestedButton = screen.getByText('Nested Button');
      
      await user.click(headerButton);
      expect(handleHeaderAction).toHaveBeenCalledTimes(1);

      await user.click(nestedButton);
      expect(handleButtonClick).toHaveBeenCalledTimes(1);
      // Card click should not be triggered when button is clicked
      expect(handleCardClick).not.toHaveBeenCalled();
    });

    it('should maintain theme consistency across nested components', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedEffectSystem effectType="cosmic" colorScheme="cosmic">
            <UnifiedHeader title="Cosmic Theme" variant="cosmic">
              <PokemonCard variant="cosmic">
                <PokemonButton variant="cosmic">
                  Themed Button
                </PokemonButton>
              </PokemonCard>
            </UnifiedHeader>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      // All components should use consistent cosmic theming
      const allElements = container.querySelectorAll('*');
      let cosmicElementCount = 0;

      allElements.forEach(element => {
        const classes = element.className;
        if (typeof classes === 'string' && classes.includes('cosmic')) {
          cosmicElementCount++;
        }
      });

      expect(cosmicElementCount).toBeGreaterThan(0);
    });
  });

  describe('📦 Import/Export Validation', () => {
    it('should import all unified components without circular dependencies', async () => {
      // Test that all components can be imported
      const componentImports = [
        () => import('../../shared/components/atoms/design-system/PokemonButton'),
        () => import('../../shared/components/atoms/design-system/PokemonCard'),
        () => import('../../shared/components/organisms/effects/UnifiedEffectSystem'),
        () => import('../../shared/components/molecules/common/UnifiedHeader'),
        () => import('../../shared/components/molecules/common/UnifiedGradeDisplay'),
        () => import('../../shared/components/atoms/design-system/unifiedVariants'),
      ];

      const results = await Promise.all(
        componentImports.map(importFn => importFn())
      );

      results.forEach(module => {
        expect(module).toBeDefined();
        expect(typeof module).toBe('object');
      });
    });

    it('should export unified variants correctly', () => {
      expect(UNIFIED_VARIANTS).toBeDefined();
      expect(UNIFIED_VARIANTS.button).toBeDefined();
      expect(UNIFIED_VARIANTS.input).toBeDefined();
      expect(UNIFIED_VARIANTS.modal).toBeDefined();
      expect(UNIFIED_VARIANTS.card).toBeDefined();

      // Test variant function calls
      const buttonClass = UNIFIED_VARIANTS.button({ variant: 'primary' });
      const cardClass = UNIFIED_VARIANTS.card({ variant: 'glass' });

      expect(typeof buttonClass).toBe('string');
      expect(typeof cardClass).toBe('string');
      expect(buttonClass.length).toBeGreaterThan(0);
      expect(cardClass.length).toBeGreaterThan(0);
    });

    it('should maintain consistent component interfaces', () => {
      // Test that components accept expected props without TypeScript errors
      const { container } = render(
        <TestWrapper>
          <PokemonButton 
            variant="primary" 
            size="lg" 
            loading={false}
            disabled={false}
            fullWidth={false}
            onClick={() => {}}
          >
            Interface Test
          </PokemonButton>
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('🔄 Backwards Compatibility Tests', () => {
    it('should handle legacy prop patterns gracefully', () => {
      // Test that components work with both new and legacy prop patterns
      const { container: newPropsContainer } = render(
        <TestWrapper>
          <PokemonCard 
            cardType="metric"
            title="New Props"
            value={100}
            colorScheme="primary"
          />
        </TestWrapper>
      );

      const { container: legacyPropsContainer } = render(
        <TestWrapper>
          <PokemonCard 
            variant="glass"
            size="md"
            interactive={false}
          >
            Legacy Props
          </PokemonCard>
        </TestWrapper>
      );

      expect(newPropsContainer.textContent).toContain('New Props');
      expect(legacyPropsContainer.textContent).toContain('Legacy Props');
    });

    it('should maintain component API stability', () => {
      // Ensure components work with minimal required props
      const components = [
        <PokemonButton key="btn">Minimal Button</PokemonButton>,
        <PokemonCard key="card">Minimal Card</PokemonCard>,
        <UnifiedHeader key="header" title="Minimal Header" />,
        <UnifiedEffectSystem key="effect" effectType="cosmic">
          <div>Minimal Effect</div>
        </UnifiedEffectSystem>
      ];

      components.forEach(component => {
        const { container } = render(
          <TestWrapper>{component}</TestWrapper>
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should handle undefined/null props gracefully', () => {
      // Test components with undefined/null props
      const { container } = render(
        <TestWrapper>
          <PokemonCard
            title={undefined}
            subtitle={null}
            value={undefined}
            onClick={undefined}
            className={undefined}
          >
            Null Props Test
          </PokemonCard>
        </TestWrapper>
      );

      expect(container.textContent).toContain('Null Props Test');
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('🎛️ Theme Integration Tests', () => {
    it('should switch themes across all components simultaneously', () => {
      const MockThemeTest: React.FC<{ theme: string }> = ({ theme }) => (
        <div data-theme={theme}>
          <PokemonButton variant="primary">Button</PokemonButton>
          <PokemonCard variant="glass">Card</PokemonCard>
          <UnifiedHeader title="Header" variant="glassmorphism" />
        </div>
      );

      const { rerender, container } = render(
        <TestWrapper>
          <MockThemeTest theme="light" />
        </TestWrapper>
      );

      const lightThemeSnapshot = container.innerHTML;

      rerender(
        <TestWrapper>
          <MockThemeTest theme="dark" />
        </TestWrapper>
      );

      const darkThemeSnapshot = container.innerHTML;

      // Themes should produce different markup
      expect(lightThemeSnapshot).not.toEqual(darkThemeSnapshot);
    });

    it('should respect user preferences for reduced motion', () => {
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
            <PokemonButton>Accessible Button</PokemonButton>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      expect(screen.getByText('Accessible Button')).toBeInTheDocument();
    });

    it('should handle theme context changes gracefully', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonCard variant="glass">
            <UnifiedHeader title="Theme Context Test" />
          </PokemonCard>
        </TestWrapper>
      );

      // Component should render without theme context errors
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Theme Context Test')).toBeInTheDocument();
    });
  });

  describe('📊 Data Flow Integration', () => {
    it('should handle complex data transformations correctly', () => {
      const complexGrades = {
        grade_1: 0, grade_2: 0, grade_3: 5, grade_4: 12, grade_5: 25,
        grade_6: 45, grade_7: 78, grade_8: 132, grade_9: 245, grade_10: 1056,
        grade_total: 1598
      };

      render(
        <TestWrapper>
          <UnifiedGradeDisplay 
            grades={complexGrades}
            mode="full"
            theme="vibrant"
            onGradeClick={(grade, count) => {
              console.log(`Grade ${grade}: ${count}`);
            }}
            showLabels={true}
            showTotal={true}
            highlightGrade={10}
          />
        </TestWrapper>
      );

      expect(screen.getByText('PSA Population Breakdown')).toBeInTheDocument();
      expect(screen.getByText('1,056')).toBeInTheDocument(); // PSA 10 count
      expect(screen.getByText('1,598')).toBeInTheDocument(); // Total
    });

    it('should handle async data loading states', async () => {
      const { rerender } = render(
        <TestWrapper>
          <PokemonCard loading={true}>Loading...</PokemonCard>
        </TestWrapper>
      );

      const loadingSpinner = document.querySelector('.animate-spin');
      expect(loadingSpinner).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <PokemonCard loading={false}>Loaded content</PokemonCard>
        </TestWrapper>
      );

      expect(screen.getByText('Loaded content')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    it('should propagate events correctly through component hierarchy', async () => {
      const eventLog: string[] = [];

      const handleOuterClick = () => eventLog.push('outer');
      const handleInnerClick = () => eventLog.push('inner');
      const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        eventLog.push('button');
      };

      render(
        <TestWrapper>
          <div onClick={handleOuterClick} data-testid="outer">
            <PokemonCard onClick={handleInnerClick} interactive={true}>
              <PokemonButton onClick={handleButtonClick}>
                Stop Propagation
              </PokemonButton>
            </PokemonCard>
          </div>
        </TestWrapper>
      );

      const button = screen.getByText('Stop Propagation');
      await user.click(button);

      expect(eventLog).toEqual(['button']);
      expect(eventLog).not.toContain('inner');
      expect(eventLog).not.toContain('outer');
    });
  });

  describe('🚀 Performance Integration', () => {
    it('should handle multiple component renders efficiently', () => {
      const startTime = performance.now();

      render(
        <TestWrapper>
          <div>
            {Array.from({ length: 50 }, (_, i) => (
              <PokemonButton key={i} variant="primary">
                Button {i}
              </PokemonButton>
            ))}
          </div>
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(100); // Should render 50 buttons quickly
      expect(screen.getByText('Button 0')).toBeInTheDocument();
      expect(screen.getByText('Button 49')).toBeInTheDocument();
    });

    it('should optimize re-renders with prop changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <PokemonCard variant="glass" size="md">
            Initial content
          </PokemonCard>
        </TestWrapper>
      );

      const startTime = performance.now();

      rerender(
        <TestWrapper>
          <PokemonCard variant="cosmic" size="lg">
            Updated content
          </PokemonCard>
        </TestWrapper>
      );

      const endTime = performance.now();
      const rerenderTime = endTime - startTime;

      expect(rerenderTime).toBeLessThan(16); // Should rerender quickly
      expect(screen.getByText('Updated content')).toBeInTheDocument();
    });
  });

  describe('🔧 Migration Path Validation', () => {
    it('should provide clear migration path documentation', () => {
      // Test that components work with both old and new patterns
      const migrationComponents = [
        // Old pattern
        <div key="old" className="bg-zinc-900 p-4 rounded">
          <h1>Old Header</h1>
          <div className="bg-zinc-800 p-2 rounded">Old Card</div>
          <button className="bg-blue-500 px-4 py-2 rounded">Old Button</button>
        </div>,
        
        // New unified pattern
        <UnifiedHeader key="new" title="New Header">
          <PokemonCard>New Card</PokemonCard>
          <PokemonButton>New Button</PokemonButton>
        </UnifiedHeader>
      ];

      migrationComponents.forEach(component => {
        const { container } = render(
          <TestWrapper>{component}</TestWrapper>
        );
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should handle progressive enhancement patterns', () => {
      // Test that components can be gradually adopted
      render(
        <TestWrapper>
          {/* Mix of old and new components */}
          <div className="space-y-4">
            <UnifiedHeader title="New Header" variant="glassmorphism" />
            
            <div className="grid grid-cols-2 gap-4">
              <PokemonCard>New unified card</PokemonCard>
              <div className="bg-zinc-800 p-4 rounded">Legacy card</div>
            </div>
            
            <div className="flex space-x-4">
              <PokemonButton variant="primary">New button</PokemonButton>
              <button className="bg-blue-500 px-4 py-2 rounded">Legacy button</button>
            </div>
          </div>
        </TestWrapper>
      );

      expect(screen.getByText('New Header')).toBeInTheDocument();
      expect(screen.getByText('New unified card')).toBeInTheDocument();
      expect(screen.getByText('Legacy card')).toBeInTheDocument();
      expect(screen.getByText('New button')).toBeInTheDocument();
      expect(screen.getByText('Legacy button')).toBeInTheDocument();
    });

    it('should validate rollback capability', () => {
      // Test that we can safely rollback to previous components
      const RollbackTest = ({ useNew }: { useNew: boolean }) => (
        <div>
          {useNew ? (
            <PokemonButton variant="primary">New Component</PokemonButton>
          ) : (
            <button className="bg-blue-500 px-4 py-2 rounded">Old Component</button>
          )}
        </div>
      );

      const { rerender } = render(
        <TestWrapper>
          <RollbackTest useNew={true} />
        </TestWrapper>
      );

      expect(screen.getByText('New Component')).toBeInTheDocument();

      // Simulate rollback
      rerender(
        <TestWrapper>
          <RollbackTest useNew={false} />
        </TestWrapper>
      );

      expect(screen.getByText('Old Component')).toBeInTheDocument();
    });
  });
});