import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Star, ArrowRight, Search, Plus, Heart } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Components/Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Button Component

The unified Button component consolidates 12+ button variants into a single comprehensive component with full theme support and backwards compatibility.

## Features
- **12 Variants**: From standard shadcn/ui variants to Pokemon-themed and premium effects
- **7 Sizes**: Including icon-specific sizes and responsive options  
- **Loading States**: Built-in loading spinner and custom loading text
- **Icon Support**: Start and end icon positioning
- **Density Awareness**: Automatic spacing adjustment based on theme density
- **Motion Levels**: Respects user motion preferences and theme settings
- **Full Theme Support**: Works with all 5 theme variants (pokemon, glass, cosmic, neural, minimal)

## Usage
\`\`\`tsx
import { Button } from '@/shared/ui';

<Button variant="pokemon" size="lg" motion="enhanced" startIcon={<Star />}>
  Pokemon Action
</Button>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive', 
        'outline',
        'secondary',
        'ghost',
        'link',
        'pokemon',
        'pokemonOutline',
        'success',
        'warning', 
        'danger',
        'glass',
        'glassShimmer',
        'cosmic',
        'quantum'
      ],
      description: 'Visual variant of the button'
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', 'icon', 'iconSm', 'iconLg'],
      description: 'Size variant of the button'
    },
    density: {
      control: 'select', 
      options: ['compact', 'comfortable', 'spacious'],
      description: 'Layout density - affects spacing and padding'
    },
    motion: {
      control: 'select',
      options: ['none', 'reduced', 'normal', 'enhanced'],
      description: 'Animation level - respects user preferences'
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state with spinner'
    },
    loadingText: {
      control: 'text',
      description: 'Custom text to show when loading'
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button'
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (for composition)'
    }
  },
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
    density: 'comfortable',
    motion: 'normal',
    loading: false,
    disabled: false,
    asChild: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants showcase
export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const Pokemon: Story = {
  args: {
    variant: 'pokemon',
    children: 'Pokemon Button',
    startIcon: <Star className="w-4 h-4" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pokemon-themed button with official brand colors and gradient effects. Perfect for primary actions in the Pokemon collection interface.',
      },
    },
  },
};

export const PokemonOutline: Story = {
  args: {
    variant: 'pokemonOutline', 
    children: 'Pokemon Outline',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outlined version of the Pokemon button. Great for secondary actions that need Pokemon branding.',
      },
    },
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: 'Glass Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Glassmorphism effect button with backdrop blur. Works best with the glass theme.',
      },
    },
    backgrounds: { default: 'glass' },
  },
};

export const Cosmic: Story = {
  args: {
    variant: 'cosmic',
    children: 'Cosmic Button',
    motion: 'enhanced',
  },
  parameters: {
    docs: {
      description: {
        story: 'Premium cosmic effect button with enhanced animations and gradients.',
      },
    },
    backgrounds: { default: 'cosmic' },
  },
};

export const Quantum: Story = {
  args: {
    variant: 'quantum',
    children: 'Quantum Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ultra-premium quantum effect button with advanced visual effects.',
      },
    },
    backgrounds: { default: 'cosmic' },
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button size="sm" variant="pokemon">Small</Button>
      <Button size="default" variant="pokemon">Default</Button>
      <Button size="lg" variant="pokemon">Large</Button>
      <Button size="xl" variant="pokemon">Extra Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes from small to extra large.',
      },
    },
  },
};

export const IconSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="iconSm" variant="pokemon">
        <Search className="w-3 h-3" />
      </Button>
      <Button size="icon" variant="pokemon">
        <Search className="w-4 h-4" />
      </Button>
      <Button size="iconLg" variant="pokemon">
        <Search className="w-5 h-5" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-specific button sizes for perfect icon-only buttons.',
      },
    },
  },
};

// State variations
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="pokemon" startIcon={<Star className="w-4 h-4" />}>
          Start Icon
        </Button>
        <Button variant="pokemon" endIcon={<ArrowRight className="w-4 h-4" />}>
          End Icon
        </Button>
        <Button variant="pokemon" 
               startIcon={<Heart className="w-4 h-4" />}
               endIcon={<Plus className="w-4 h-4" />}>
          Both Icons
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with start icons, end icons, or both for enhanced visual communication.',
      },
    },
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="pokemon" loading>
        Loading Button
      </Button>
      <Button variant="pokemon" loading loadingText="Saving...">
        Custom Loading
      </Button>
      <Button variant="glass" loading>
        Glass Loading
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading states with built-in spinner and optional custom loading text.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="pokemon" disabled>
        Disabled Pokemon
      </Button>
      <Button variant="glass" disabled>
        Disabled Glass  
      </Button>
      <Button variant="cosmic" disabled>
        Disabled Cosmic
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled state maintains visual hierarchy while indicating unavailability.',
      },
    },
  },
};

// Density variations
export const DensityVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <span className="text-sm font-medium w-20">Compact:</span>
        <Button variant="pokemon" density="compact">Compact Button</Button>
        <Button variant="pokemon" density="compact" size="sm">Small Compact</Button>
      </div>
      <div className="flex gap-4 items-center">
        <span className="text-sm font-medium w-20">Comfortable:</span>
        <Button variant="pokemon" density="comfortable">Comfortable Button</Button>
        <Button variant="pokemon" density="comfortable" size="lg">Large Comfortable</Button>
      </div>
      <div className="flex gap-4 items-center">
        <span className="text-sm font-medium w-20">Spacious:</span>
        <Button variant="pokemon" density="spacious">Spacious Button</Button>
        <Button variant="pokemon" density="spacious" size="xl">XL Spacious</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Density variations adjust spacing and padding for different layout needs.',
      },
    },
  },
};

// Motion levels
export const MotionLevels: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Button variant="cosmic" motion="none">
        No Motion
      </Button>
      <Button variant="cosmic" motion="reduced">
        Reduced Motion
      </Button>
      <Button variant="cosmic" motion="normal">
        Normal Motion
      </Button>
      <Button variant="cosmic" motion="enhanced">
        Enhanced Motion
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Motion levels from none to enhanced, respecting user accessibility preferences.',
      },
    },
    backgrounds: { default: 'cosmic' },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="pokemon">Pokemon</Button>
      <Button variant="pokemonOutline">Pokemon Outline</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="glass">Glass</Button>
      <Button variant="glassShimmer">Glass Shimmer</Button>
      <Button variant="cosmic">Cosmic</Button>
      <Button variant="quantum">Quantum</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all 15 button variants available in the unified component.',
      },
    },
  },
};

// Theme integration examples
export const ThemeIntegration: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-[var(--theme-border-primary)] bg-[var(--theme-surface)]">
        <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">Pokemon Theme</h3>
        <div className="flex gap-3">
          <Button variant="pokemon">Primary</Button>
          <Button variant="pokemonOutline">Secondary</Button>
          <Button variant="success">Success</Button>
        </div>
      </div>
      
      <div className="p-4 rounded-lg border border-[var(--theme-border-primary)] bg-[var(--theme-surface)]" 
           style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">Glass Theme</h3>
        <div className="flex gap-3">
          <Button variant="glass">Glass</Button>
          <Button variant="glassShimmer">Glass Shimmer</Button>
          <Button variant="pokemon">Pokemon Glass</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons automatically adapt to the current theme context and CSS variables.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    variant: 'pokemon',
    size: 'lg',
    children: 'Playground Button',
    startIcon: <Star className="w-4 h-4" />,
    motion: 'enhanced',
    density: 'comfortable',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all button properties and combinations.',
      },
    },
  },
};