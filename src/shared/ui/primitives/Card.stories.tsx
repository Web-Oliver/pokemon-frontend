import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Star, Heart, TrendingUp, Shield, Award } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'Components/Primitives/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Card Component

The unified Card component consolidates 6+ card variants into a single comprehensive component with full theme support, interactive states, and structured content organization.

## Features
- **10 Variants**: From standard shadcn/ui variants to Pokemon-themed and premium effects
- **Structured Content**: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **Interactive States**: Hover effects, click handlers, focus management
- **Status Indicators**: Visual status indicators with color coding
- **Loading States**: Built-in loading overlays with spinners
- **Density Awareness**: Automatic spacing adjustment based on theme settings
- **Full Theme Support**: Works with all 5 theme variants

## Usage
\`\`\`tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui';

<Card variant="pokemon" interactive status="success">
  <CardHeader>
    <CardTitle>Pokemon Collection</CardTitle>
  </CardHeader>
  <CardContent>
    Card content with Pokemon theme and success status.
  </CardContent>
</Card>
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
        'elevated',
        'outline',
        'pokemon',
        'pokemonGradient',
        'glass',
        'glassSubtle',
        'glassHeavy',
        'cosmic',
        'neural',
        'quantum'
      ],
      description: 'Visual variant of the card'
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
      description: 'Size variant affecting padding'
    },
    density: {
      control: 'select',
      options: ['compact', 'comfortable', 'spacious'],
      description: 'Layout density - affects spacing'
    },
    interactive: {
      control: 'boolean',
      description: 'Enables interactive hover and focus states'
    },
    status: {
      control: 'select',
      options: ['none', 'success', 'warning', 'danger', 'info'],
      description: 'Status indicator with color coding'
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading overlay with spinner'
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interactions and reduces opacity'
    }
  },
  args: {
    variant: 'default',
    size: 'default',
    density: 'comfortable',
    interactive: false,
    status: 'none',
    loading: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card examples
export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Default Card</CardTitle>
        <CardDescription>
          A simple card with basic styling and content structure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--theme-text-secondary)]">
          This is the default card variant with clean, minimal styling that works across all themes.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const Pokemon: Story = {
  render: (args) => (
    <Card {...args} variant="pokemon" className="w-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[var(--color-pokemon-yellow)]" />
          Pokemon Card Collection
        </CardTitle>
        <CardDescription>
          Manage your Pokemon card collection with official branding.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Cards</span>
            <Badge variant="pokemon">1,247</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Rare Cards</span>
            <Badge variant="grade10">23</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="pokemonOutline" size="sm">View Collection</Button>
        <Button variant="pokemon" size="sm" startIcon={<Heart className="w-4 h-4" />}>
          Add to Favorites
        </Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Pokemon-themed card with official brand colors and subtle shadow effects.',
      },
    },
  },
};

export const Glass: Story = {
  render: (args) => (
    <Card {...args} variant="glass" className="w-96">
      <CardHeader>
        <CardTitle>Glass Morphism Card</CardTitle>
        <CardDescription>
          Beautiful glassmorphism effects with backdrop blur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--theme-text-primary)]">
          This card uses glassmorphism effects with backdrop blur and transparent backgrounds 
          for a modern, floating appearance.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="glass" size="sm">Glass Action</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Glassmorphism card with backdrop blur and transparent styling.',
      },
    },
    backgrounds: { default: 'glass' },
  },
};

export const Cosmic: Story = {
  render: (args) => (
    <Card {...args} variant="cosmic" className="w-96">
      <CardHeader>
        <CardTitle className="text-white">Cosmic Premium Card</CardTitle>
        <CardDescription className="text-gray-200">
          Premium cosmic theme with advanced visual effects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-white">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm">Premium Features Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">Advanced Security</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="cosmic" size="sm" motion="enhanced">
          Explore Cosmic
        </Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Premium cosmic card with gradient backgrounds and enhanced visual effects.',
      },
    },
    backgrounds: { default: 'cosmic' },
  },
};

// Interactive states
export const Interactive: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      <Card {...args} variant="pokemon" interactive className="w-80">
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>Hover and click for effects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">
            This card responds to hover and focus states with smooth animations.
          </p>
        </CardContent>
      </Card>
      
      <Card {...args} variant="glass" interactive className="w-80">
        <CardHeader>
          <CardTitle>Glass Interactive</CardTitle>
          <CardDescription>Glassmorphism with interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-primary)]">
            Interactive glass card with enhanced hover effects.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
  args: {
    interactive: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive cards with hover, focus, and click states.',
      },
    },
  },
};

// Status indicators
export const StatusIndicators: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card variant="pokemon" status="success" className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Collection Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Success status with green accent indicator.
          </p>
        </CardContent>
      </Card>

      <Card variant="pokemon" status="warning" className="w-80">
        <CardHeader>
          <CardTitle>Attention Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Warning status with yellow accent indicator.
          </p>
        </CardContent>
      </Card>

      <Card variant="pokemon" status="danger" className="w-80">
        <CardHeader>
          <CardTitle>Action Needed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Danger status with red accent indicator.
          </p>
        </CardContent>
      </Card>

      <Card variant="pokemon" status="info" className="w-80">
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">
            Info status with blue accent indicator.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards with status indicators showing different states and contexts.',
      },
    },
  },
};

// Loading states
export const LoadingStates: Story = {
  render: () => (
    <div className="flex gap-4">
      <Card variant="pokemon" loading className="w-80">
        <CardHeader>
          <CardTitle>Loading Card</CardTitle>
          <CardDescription>Please wait while content loads</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">
            This content is currently loading...
          </p>
        </CardContent>
      </Card>

      <Card variant="glass" loading className="w-80">
        <CardHeader>
          <CardTitle>Glass Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Loading with glass effects...</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards with loading overlays and spinner indicators.',
      },
    },
  },
};

// Size variations
export const SizeVariations: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Card variant="pokemon" size="xs" className="w-60">
          <CardContent>
            <p className="text-xs">Extra Small Card</p>
          </CardContent>
        </Card>
        
        <Card variant="pokemon" size="sm" className="w-72">
          <CardContent>
            <p className="text-sm">Small Card</p>
          </CardContent>
        </Card>
      </div>
      
      <Card variant="pokemon" size="default" className="w-96">
        <CardHeader>
          <CardTitle>Default Size Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Default padding and spacing.</p>
        </CardContent>
      </Card>
      
      <Card variant="pokemon" size="lg" className="w-[28rem]">
        <CardHeader>
          <CardTitle>Large Card</CardTitle>
          <CardDescription>Increased padding for more spacious layout</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Large size with generous padding.</p>
        </CardContent>
        <CardFooter>
          <Button variant="pokemon">Large Action</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards in different sizes from extra small to large with appropriate padding.',
      },
    },
  },
};

// Density variations
export const DensityVariations: Story = {
  render: () => (
    <div className="space-y-4">
      <Card variant="pokemon" density="compact" className="w-96">
        <CardHeader density="compact">
          <CardTitle>Compact Density</CardTitle>
          <CardDescription>Reduced spacing for information-dense layouts</CardDescription>
        </CardHeader>
        <CardContent density="compact">
          <p className="text-sm">Compact spacing optimizes for more content in less space.</p>
        </CardContent>
        <CardFooter density="compact">
          <Button size="sm" variant="pokemon">Compact Action</Button>
        </CardFooter>
      </Card>

      <Card variant="pokemon" density="comfortable" className="w-96">
        <CardHeader density="comfortable">
          <CardTitle>Comfortable Density</CardTitle>
          <CardDescription>Balanced spacing for general use</CardDescription>
        </CardHeader>
        <CardContent density="comfortable">
          <p className="text-sm">Comfortable spacing provides good balance between content and whitespace.</p>
        </CardContent>
        <CardFooter density="comfortable">
          <Button variant="pokemon">Standard Action</Button>
        </CardFooter>
      </Card>

      <Card variant="pokemon" density="spacious" className="w-96">
        <CardHeader density="spacious">
          <CardTitle>Spacious Density</CardTitle>
          <CardDescription>Generous spacing for premium, breathable layouts</CardDescription>
        </CardHeader>
        <CardContent density="spacious">
          <p className="text-sm">Spacious density creates a premium feel with generous whitespace.</p>
        </CardContent>
        <CardFooter density="spacious">
          <Button variant="pokemon" size="lg">Premium Action</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards with different density settings affecting spacing and layout.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <Card variant="default" className="w-80">
        <CardHeader>
          <CardTitle>Default</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">Default card variant</p>
        </CardContent>
      </Card>

      <Card variant="elevated" className="w-80">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">Elevated with shadow</p>
        </CardContent>
      </Card>

      <Card variant="outline" className="w-80">
        <CardHeader>
          <CardTitle>Outline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">Outline variant</p>
        </CardContent>
      </Card>

      <Card variant="pokemon" className="w-80">
        <CardHeader>
          <CardTitle>Pokemon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">Pokemon themed</p>
        </CardContent>
      </Card>

      <Card variant="pokemonGradient" className="w-80">
        <CardHeader>
          <CardTitle>Pokemon Gradient</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">Pokemon with gradient</p>
        </CardContent>
      </Card>

      <Card variant="glass" className="w-80">
        <CardHeader>
          <CardTitle>Glass</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Glass morphism</p>
        </CardContent>
      </Card>

      <Card variant="neural" className="w-80">
        <CardHeader>
          <CardTitle>Neural</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">Neural tech theme</p>
        </CardContent>
      </Card>

      <Card variant="quantum" className="w-80">
        <CardHeader>
          <CardTitle>Quantum</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--theme-text-secondary)]">Quantum premium</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all available card variants.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Playground Card
        </CardTitle>
        <CardDescription>
          Experiment with different card properties and configurations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-[var(--theme-text-secondary)]">
            This is a playground card where you can test all the available properties 
            and see how they interact with different themes.
          </p>
          <div className="flex gap-2">
            <Badge variant="pokemon">Interactive</Badge>
            <Badge variant="success">Status</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">Secondary</Button>
        <Button variant="pokemon" size="sm">Primary Action</Button>
      </CardFooter>
    </Card>
  ),
  args: {
    variant: 'pokemon',
    interactive: true,
    status: 'success',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all card properties.',
      },
    },
  },
};