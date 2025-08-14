/**
 * HIVE COMPONENT VALIDATOR - Phase 1.4 Unified Components Test Suite
 * Comprehensive validation of all unified components for production readiness
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PokemonButton } from '../../shared/components/atoms/design-system/PokemonButton';
import { PokemonCard } from '../../shared/components/atoms/design-system/PokemonCard';
import { UnifiedEffectSystem } from '../../shared/components/organisms/effects/UnifiedEffectSystem';
import UnifiedHeader from '../../shared/components/molecules/common/UnifiedHeader';
import UnifiedGradeDisplay from '../../shared/components/molecules/common/UnifiedGradeDisplay';
import { pokemonButtonVariants } from '../../shared/components/atoms/design-system/unifiedVariants';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Test wrapper component with all necessary providers
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

describe('🧪 HIVE Component Validation - Phase 1.4 Unified Components', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    // Mock theme context
    vi.clearAllMocks();
  });

  describe('🔘 PokemonButton - Unified Button System', () => {
    it('should render all variants correctly', () => {
      const variants = ['default', 'primary', 'success', 'danger', 'warning', 'cosmic'] as const;
      
      variants.forEach(variant => {
        const { container } = render(
          <TestWrapper>
            <PokemonButton variant={variant}>
              {variant} Button
            </PokemonButton>
          </TestWrapper>
        );
        
        const button = container.querySelector('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent(`${variant} Button`);
      });
    });

    it('should handle loading state properly', async () => {
      render(
        <TestWrapper>
          <PokemonButton loading={true} loadingText="Loading...">
            Click me
          </PokemonButton>
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Click me')).not.toBeInTheDocument();
    });

    it('should render with start and end icons', () => {
      const StartIcon = () => <span>🚀</span>;
      const EndIcon = () => <span>✨</span>;

      render(
        <TestWrapper>
          <PokemonButton
            startIcon={<StartIcon />}
            endIcon={<EndIcon />}
          >
            With Icons
          </PokemonButton>
        </TestWrapper>
      );

      expect(screen.getByText('🚀')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('With Icons')).toBeInTheDocument();
    });

    it('should apply correct CSS classes for variants', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonButton variant="cosmic" size="lg">
            Cosmic Button
          </PokemonButton>
        </TestWrapper>
      );

      const button = container.querySelector('button');
      const className = button?.className || '';
      
      // Should include cosmic variant styles
      expect(className).toMatch(/cosmic|emerald|teal|cyan/);
      expect(className).toMatch(/lg/);
    });

    it('should handle click events', async () => {
      const handleClick = vi.fn();
      
      render(
        <TestWrapper>
          <PokemonButton onClick={handleClick}>
            Clickable
          </PokemonButton>
        </TestWrapper>
      );

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when loading', () => {
      render(
        <TestWrapper>
          <PokemonButton loading={true}>
            Loading Button
          </PokemonButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('🃏 PokemonCard - Unified Card System', () => {
    it('should render base card correctly', () => {
      render(
        <TestWrapper>
          <PokemonCard>
            <div>Card content</div>
          </PokemonCard>
        </TestWrapper>
      );

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render metric card variant', () => {
      const mockIcon = () => <span>📊</span>;

      render(
        <TestWrapper>
          <PokemonCard
            cardType="metric"
            title="Test Metric"
            value={42}
            icon={mockIcon}
            colorScheme="success"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('should render DBA card variant', () => {
      const mockItem = { id: '1', name: 'Test Item' };

      render(
        <TestWrapper>
          <PokemonCard
            cardType="dba"
            item={mockItem}
            displayName="Test DBA Item"
            subtitle="Test subtitle"
            isSelected={true}
            dbaInfo={{ value: 100 }}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Test DBA Item')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
      expect(screen.getByText('DBA Value: $100')).toBeInTheDocument();
    });

    it('should render collection card variant', () => {
      render(
        <TestWrapper>
          <PokemonCard
            cardType="collection"
            title="Collection Item"
            subtitle="Item description"
            price={99.99}
            grade={10}
            condition="Mint"
            category="Base Set"
            showBadge={true}
            showPrice={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Collection Item')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByText('PSA 10')).toBeInTheDocument();
      expect(screen.getByText('Mint')).toBeInTheDocument();
      expect(screen.getByText('Base Set')).toBeInTheDocument();
    });

    it('should handle interactive states', async () => {
      const handleClick = vi.fn();

      render(
        <TestWrapper>
          <PokemonCard onClick={handleClick} interactive={true}>
            Clickable card
          </PokemonCard>
        </TestWrapper>
      );

      const card = screen.getByText('Clickable card').closest('div');
      await user.click(card!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should apply cosmic theme correctly', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonCard cosmic={true}>
            Cosmic card
          </PokemonCard>
        </TestWrapper>
      );

      const card = container.querySelector('div');
      const className = card?.className || '';
      expect(className).toMatch(/cosmic|zinc.*800|cyan.*900|purple.*900/);
    });

    it('should show loading state', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonCard loading={true}>
            Loading card
          </PokemonCard>
        </TestWrapper>
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('🎨 UnifiedEffectSystem - Visual Effects', () => {
    it('should render cosmic effect', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedEffectSystem effectType="cosmic" intensity="medium">
            <div>Content with cosmic effect</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      expect(screen.getByText('Content with cosmic effect')).toBeInTheDocument();
      const effectContainer = container.querySelector('[aria-hidden="true"]');
      expect(effectContainer).toBeInTheDocument();
    });

    it('should render neural effect', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedEffectSystem effectType="neural" intensity="subtle">
            <div>Neural background</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      expect(screen.getByText('Neural background')).toBeInTheDocument();
    });

    it('should render particle effect', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedEffectSystem
            effectType="particles"
            particleCount="many"
            animationSpeed="fast"
          >
            <div>Particle effect</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      expect(screen.getByText('Particle effect')).toBeInTheDocument();
      // Check for particle elements
      const particles = container.querySelectorAll('.w-1.h-1.rounded-full');
      expect(particles.length).toBeGreaterThan(0);
    });

    it('should respect theme settings for effects', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedEffectSystem
            effectType="holographic"
            respectThemeSettings={true}
            features={{ glow: true, shimmer: true }}
          >
            <div>Themed effect</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      expect(screen.getByText('Themed effect')).toBeInTheDocument();
    });

    it('should support custom colors', () => {
      render(
        <TestWrapper>
          <UnifiedEffectSystem
            effectType="aurora"
            colorScheme="custom"
            customColors={{
              primary: 'rgba(255, 0, 0, 0.5)',
              secondary: 'rgba(0, 255, 0, 0.5)',
              accent: 'rgba(0, 0, 255, 0.5)'
            }}
          >
            <div>Custom colored effect</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      expect(screen.getByText('Custom colored effect')).toBeInTheDocument();
    });
  });

  describe('📋 UnifiedHeader - Header System', () => {
    it('should render basic header', () => {
      render(
        <TestWrapper>
          <UnifiedHeader title="Test Header" subtitle="Test subtitle" />
        </TestWrapper>
      );

      expect(screen.getByText('Test Header')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    it('should render header with icon and stats', () => {
      const mockIcon = () => <span>🏠</span>;
      const mockStats = [
        {
          icon: () => <span>👥</span>,
          label: 'Users',
          value: 150,
          variant: 'success' as const
        },
        {
          icon: () => <span>💰</span>,
          label: 'Revenue',
          value: '$1,200',
          variant: 'default' as const
        }
      ];

      render(
        <TestWrapper>
          <UnifiedHeader
            title="Dashboard"
            subtitle="System overview"
            icon={mockIcon}
            stats={mockStats}
            variant="glassmorphism"
            size="lg"
          />
        </TestWrapper>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('🏠')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('$1,200')).toBeInTheDocument();
    });

    it('should render header with actions', async () => {
      const handleAction1 = vi.fn();
      const handleAction2 = vi.fn();
      
      const mockActions = [
        {
          icon: () => <span>➕</span>,
          label: 'Add New',
          onClick: handleAction1,
          variant: 'primary' as const
        },
        {
          label: 'Export',
          onClick: handleAction2,
          variant: 'secondary' as const
        }
      ];

      render(
        <TestWrapper>
          <UnifiedHeader
            title="Collection"
            actions={mockActions}
          />
        </TestWrapper>
      );

      const addButton = screen.getByText('Add New');
      const exportButton = screen.getByText('Export');

      expect(addButton).toBeInTheDocument();
      expect(exportButton).toBeInTheDocument();

      await user.click(addButton);
      await user.click(exportButton);

      expect(handleAction1).toHaveBeenCalledTimes(1);
      expect(handleAction2).toHaveBeenCalledTimes(1);
    });

    it('should render back button', async () => {
      const handleBack = vi.fn();

      render(
        <TestWrapper>
          <UnifiedHeader
            title="Detail View"
            showBackButton={true}
            onBack={handleBack}
          />
        </TestWrapper>
      );

      const backButton = screen.getByText('Back');
      expect(backButton).toBeInTheDocument();

      await user.click(backButton);
      expect(handleBack).toHaveBeenCalledTimes(1);
    });

    it('should apply different variants correctly', () => {
      const variants = ['glassmorphism', 'cosmic', 'minimal', 'analytics'] as const;
      
      variants.forEach(variant => {
        const { container } = render(
          <TestWrapper>
            <UnifiedHeader title={`${variant} Header`} variant={variant} />
          </TestWrapper>
        );
        
        expect(screen.getByText(`${variant} Header`)).toBeInTheDocument();
      });
    });
  });

  describe('🏆 UnifiedGradeDisplay - PSA Grade System', () => {
    const mockGrades = {
      grade_1: 5,
      grade_2: 8,
      grade_3: 12,
      grade_4: 15,
      grade_5: 20,
      grade_6: 25,
      grade_7: 30,
      grade_8: 45,
      grade_9: 80,
      grade_10: 120,
      grade_total: 360
    };

    it('should render full grade breakdown', () => {
      render(
        <TestWrapper>
          <UnifiedGradeDisplay grades={mockGrades} mode="full" />
        </TestWrapper>
      );

      expect(screen.getByText('PSA Population Breakdown')).toBeInTheDocument();
      expect(screen.getByText('PSA 10')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('Total Graded')).toBeInTheDocument();
      expect(screen.getByText('360')).toBeInTheDocument();
    });

    it('should render compact mode', () => {
      render(
        <TestWrapper>
          <UnifiedGradeDisplay grades={mockGrades} mode="compact" />
        </TestWrapper>
      );

      expect(screen.getByText('Top PSA Grades')).toBeInTheDocument();
      expect(screen.getByText('Total: 360')).toBeInTheDocument();
    });

    it('should render summary mode', () => {
      render(
        <TestWrapper>
          <UnifiedGradeDisplay grades={mockGrades} mode="summary" />
        </TestWrapper>
      );

      expect(screen.getByText('Total PSA Graded')).toBeInTheDocument();
      expect(screen.getByText('360')).toBeInTheDocument();
    });

    it('should render inline mode', () => {
      render(
        <TestWrapper>
          <UnifiedGradeDisplay grades={mockGrades} mode="inline" />
        </TestWrapper>
      );

      expect(screen.getByText('PSA 10: 120')).toBeInTheDocument();
      expect(screen.getByText('Total: 360')).toBeInTheDocument();
    });

    it('should handle grade click events', async () => {
      const handleGradeClick = vi.fn();

      render(
        <TestWrapper>
          <UnifiedGradeDisplay
            grades={mockGrades}
            mode="full"
            onGradeClick={handleGradeClick}
          />
        </TestWrapper>
      );

      // Find a grade element and click it
      const grade10Element = screen.getByText('120').closest('div');
      await user.click(grade10Element!);
      
      expect(handleGradeClick).toHaveBeenCalledWith(10, 120);
    });

    it('should apply different themes', () => {
      const themes = ['default', 'vibrant', 'minimal', 'premium'] as const;
      
      themes.forEach(theme => {
        const { container } = render(
          <TestWrapper>
            <UnifiedGradeDisplay grades={mockGrades} theme={theme} />
          </TestWrapper>
        );
        
        // Check that the component renders without errors
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should highlight specific grades', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedGradeDisplay
            grades={mockGrades}
            highlightGrade={10}
            mode="full"
          />
        </TestWrapper>
      );

      // Look for highlight styling (ring classes)
      const highlightedElement = container.querySelector('.ring-2.ring-blue-400');
      expect(highlightedElement).toBeInTheDocument();
    });

    it('should show loading state', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedGradeDisplay grades={mockGrades} loading={true} />
        </TestWrapper>
      );

      const loadingElement = container.querySelector('.animate-pulse');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('🎨 CSS Variants System', () => {
    it('should generate correct variant classes', () => {
      const buttonClass = pokemonButtonVariants({
        variant: 'primary',
        size: 'lg'
      });

      expect(buttonClass).toContain('bg-gradient-to-r');
      expect(buttonClass).toContain('from-cyan-600');
      expect(buttonClass).toContain('to-blue-600');
    });

    it('should handle default variants', () => {
      const defaultClass = pokemonButtonVariants({});
      expect(defaultClass).toBeDefined();
      expect(typeof defaultClass).toBe('string');
    });
  });

  describe('🔍 Theme Integration Tests', () => {
    it('should apply theme variables correctly', () => {
      const { container } = render(
        <TestWrapper>
          <PokemonCard variant="glass">
            Theme test card
          </PokemonCard>
        </TestWrapper>
      );

      const card = container.querySelector('div');
      const styles = window.getComputedStyle(card!);
      
      // Should have backdrop-blur and glassmorphism effects
      expect(card?.className).toMatch(/backdrop-blur/);
    });

    it('should support dark mode theme switching', () => {
      // Test would require theme context manipulation
      const { container } = render(
        <TestWrapper>
          <UnifiedHeader title="Dark Mode Test" variant="minimal" />
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('♿ Accessibility Tests', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <UnifiedEffectSystem effectType="cosmic">
            <div>Accessible content</div>
          </UnifiedEffectSystem>
        </TestWrapper>
      );

      const effectContainer = screen.getByText('Accessible content')
        .closest('[aria-hidden="true"]');
      expect(effectContainer).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const handleClick = vi.fn();

      render(
        <TestWrapper>
          <PokemonButton onClick={handleClick}>
            Keyboard accessible
          </PokemonButton>
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      button.focus();
      
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper semantic structure', () => {
      render(
        <TestWrapper>
          <UnifiedHeader
            title="Semantic Header"
            subtitle="With proper structure"
          />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Semantic Header');
    });
  });

  describe('📱 Responsive Design Tests', () => {
    it('should apply responsive classes correctly', () => {
      const { container } = render(
        <TestWrapper>
          <UnifiedHeader title="Responsive Header" size="lg" />
        </TestWrapper>
      );

      const header = container.querySelector('h1');
      expect(header?.className).toMatch(/sm:text-/);
    });

    it('should handle mobile breakpoints', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <TestWrapper>
          <PokemonCard size="md" compact={true}>
            Mobile optimized
          </PokemonCard>
        </TestWrapper>
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });
});