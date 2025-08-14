import type { Meta, StoryObj } from '@storybook/react';
import { Badge, StatusBadge, GradeBadge, PokemonBadge } from './Badge';
import { Star, Shield, Award, X, Check, AlertTriangle, Info } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'Components/Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Badge Component

The unified Badge component consolidates 15+ badge variants including PSA grade-specific variants into a single comprehensive component with full theme support and interactive features.

## Features
- **15 Variants**: Including grade-specific variants for PSA grades 1-10
- **Interactive Modes**: Clickable badges with hover states
- **Closable Badges**: Built-in close functionality with callbacks
- **Icon Support**: Start and end icon positioning
- **Loading States**: Built-in loading spinner
- **Convenience Components**: StatusBadge, GradeBadge, PokemonBadge
- **Full Theme Support**: Works with all theme variants
- **Size Variations**: Multiple size options for different contexts

## Usage
\`\`\`tsx
import { Badge, StatusBadge, GradeBadge, PokemonBadge } from '@/shared/ui';

// PSA grade badge
<GradeBadge grade={10} />

// Status badge with icon
<StatusBadge status="success" icon={<Check />}>
  Verified
</StatusBadge>

// Closable Pokemon badge
<PokemonBadge closable onClose={() => console.log('Badge closed')}>
  Pokemon Master
</PokemonBadge>
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
        'secondary',
        'destructive',
        'outline',
        'pokemon',
        'pokemonOutline',
        'success',
        'warning',
        'error',
        'info',
        'grade1to3',
        'grade4to6', 
        'grade7to8',
        'grade9',
        'grade10',
        'cosmic',
        'glass'
      ],
      description: 'Visual variant of the badge'
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Size variant of the badge'
    },
    interactive: {
      control: 'boolean',
      description: 'Makes the badge clickable with hover effects'
    },
    closable: {
      control: 'boolean',
      description: 'Adds close button to the badge'
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state with spinner'
    }
  },
  args: {
    children: 'Badge',
    variant: 'default',
    size: 'default',
    interactive: false,
    closable: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    children: 'Default Badge',
  },
};

export const Pokemon: Story = {
  args: {
    variant: 'pokemon',
    children: 'Pokemon',
  },
  parameters: {
    docs: {
      description: {
        story: 'Pokemon-themed badge with official brand colors and styling.',
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
        story: 'Outlined Pokemon badge for subtle branding.',
      },
    },
  },
};

export const Cosmic: Story = {
  args: {
    variant: 'cosmic',
    children: 'Cosmic',
  },
  parameters: {
    docs: {
      description: {
        story: 'Premium cosmic badge with gradient effects.',
      },
    },
    backgrounds: { default: 'cosmic' },
  },
};

// PSA Grade badges
export const PSAGrades: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="grade1to3">Grade 1-3</Badge>
      <Badge variant="grade4to6">Grade 4-6</Badge>
      <Badge variant="grade7to8">Grade 7-8</Badge>
      <Badge variant="grade9">Grade 9</Badge>
      <Badge variant="grade10">Grade 10</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'PSA grade-specific badges with color coding based on condition quality.',
      },
    },
  },
};

export const GradeBadgeComponent: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <GradeBadge grade={1} />
      <GradeBadge grade={3} />
      <GradeBadge grade={5} />
      <GradeBadge grade={7} />
      <GradeBadge grade={9} />
      <GradeBadge grade={10} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'GradeBadge convenience component automatically selects appropriate styling based on grade.',
      },
    },
  },
};

// Status badges
export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <StatusBadge status="success" icon={<Check className="w-3 h-3" />}>
        Verified
      </StatusBadge>
      
      <StatusBadge status="warning" icon={<AlertTriangle className="w-3 h-3" />}>
        Pending
      </StatusBadge>
      
      <StatusBadge status="error" icon={<X className="w-3 h-3" />}>
        Failed
      </StatusBadge>
      
      <StatusBadge status="info" icon={<Info className="w-3 h-3" />}>
        Information
      </StatusBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'StatusBadge components with icons and semantic color coding.',
      },
    },
  },
};

// Pokemon badges
export const PokemonBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <PokemonBadge>
        Trainer
      </PokemonBadge>
      
      <PokemonBadge closable onClose={() => console.log('Gym Leader closed')}>
        Gym Leader
      </PokemonBadge>
      
      <PokemonBadge closable onClose={() => console.log('Elite Four closed')}>
        Elite Four
      </PokemonBadge>
      
      <PokemonBadge icon={<Star className="w-3 h-3" />}>
        Champion
      </PokemonBadge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'PokemonBadge convenience component with Pokemon theming and close functionality.',
      },
    },
  },
};

// Interactive badges
export const Interactive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="pokemon" interactive onClick={() => console.log('Pokemon clicked')}>
        Clickable Pokemon
      </Badge>
      
      <Badge variant="cosmic" interactive onClick={() => console.log('Cosmic clicked')}>
        Clickable Cosmic
      </Badge>
      
      <Badge variant="grade10" interactive onClick={() => console.log('Grade 10 clicked')}>
        Clickable Grade 10
      </Badge>
      
      <Badge variant="success" interactive startIcon={<Check className="w-3 h-3" />}>
        Interactive Success
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive badges with click handlers and hover effects.',
      },
    },
  },
};

// Closable badges
export const Closable: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="pokemon" closable onClose={() => console.log('Pokemon closed')}>
        Closable Pokemon
      </Badge>
      
      <Badge variant="success" closable onClose={() => console.log('Success closed')}>
        Closable Success
      </Badge>
      
      <Badge variant="grade10" closable onClose={() => console.log('Grade 10 closed')}>
        Closable Grade 10
      </Badge>
      
      <Badge variant="cosmic" closable onClose={() => console.log('Cosmic closed')}>
        Closable Cosmic
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Closable badges with close buttons and callback functions.',
      },
    },
  },
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Badge variant="pokemon" startIcon={<Star className="w-3 h-3" />}>
          Star Pokemon
        </Badge>
        
        <Badge variant="success" startIcon={<Shield className="w-3 h-3" />}>
          Protected
        </Badge>
        
        <Badge variant="grade10" startIcon={<Award className="w-3 h-3" />}>
          Perfect Grade
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Badge variant="pokemon" endIcon={<Star className="w-3 h-3" />}>
          Pokemon Star
        </Badge>
        
        <Badge variant="cosmic" 
               startIcon={<Star className="w-3 h-3" />}
               endIcon={<Award className="w-3 h-3" />}>
          Premium Cosmic
        </Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges with start icons, end icons, or both for enhanced visual communication.',
      },
    },
  },
};

// Size variations
export const SizeVariations: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge size="sm" variant="pokemon">Small</Badge>
        <Badge size="default" variant="pokemon">Default</Badge>
        <Badge size="lg" variant="pokemon">Large</Badge>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge size="sm" variant="grade10">SM Grade 10</Badge>
        <Badge size="default" variant="grade10">Default Grade 10</Badge>
        <Badge size="lg" variant="grade10">LG Grade 10</Badge>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge size="sm" variant="cosmic">SM Cosmic</Badge>
        <Badge size="default" variant="cosmic">Default Cosmic</Badge>
        <Badge size="lg" variant="cosmic">LG Cosmic</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badge sizes from small to large with proportional scaling.',
      },
    },
  },
};

// Loading states
export const LoadingStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="pokemon" loading>
        Loading Pokemon
      </Badge>
      
      <Badge variant="success" loading>
        Loading Success
      </Badge>
      
      <Badge variant="grade10" loading>
        Loading Grade
      </Badge>
      
      <Badge variant="cosmic" loading>
        Loading Cosmic
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading states with built-in spinner indicators.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-3 max-w-2xl">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="pokemon">Pokemon</Badge>
      <Badge variant="pokemonOutline">Pokemon Outline</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="grade1to3">Grade 1-3</Badge>
      <Badge variant="grade4to6">Grade 4-6</Badge>
      <Badge variant="grade7to8">Grade 7-8</Badge>
      <Badge variant="grade9">Grade 9</Badge>
      <Badge variant="grade10">Grade 10</Badge>
      <Badge variant="cosmic">Cosmic</Badge>
      <Badge variant="glass">Glass</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all 17 badge variants available.',
      },
    },
  },
};

// Real-world usage examples
export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      {/* Pokemon card collection */}
      <div className="p-4 border border-[var(--theme-border-primary)] rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-[var(--theme-text-primary)]">
          Pokemon Card Collection
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="pokemon" startIcon={<Star className="w-3 h-3" />}>
            Charizard
          </Badge>
          <GradeBadge grade={10} />
          <Badge variant="success">Verified</Badge>
          <Badge variant="pokemon" interactive>
            Base Set
          </Badge>
          <StatusBadge status="info" icon={<Info className="w-3 h-3" />}>
            1st Edition
          </StatusBadge>
        </div>
      </div>

      {/* Filter tags */}
      <div className="p-4 border border-[var(--theme-border-primary)] rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-[var(--theme-text-primary)]">
          Active Filters
        </h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" closable onClose={() => console.log('Type filter removed')}>
            Fire Type
          </Badge>
          <Badge variant="outline" closable onClose={() => console.log('Grade filter removed')}>
            Grade 9+
          </Badge>
          <Badge variant="outline" closable onClose={() => console.log('Set filter removed')}>
            Base Set
          </Badge>
          <Badge variant="pokemonOutline" closable onClose={() => console.log('Era filter removed')}>
            Classic Era
          </Badge>
        </div>
      </div>

      {/* Status indicators */}
      <div className="p-4 border border-[var(--theme-border-primary)] rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-[var(--theme-text-primary)]">
          Collection Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusBadge status="success" icon={<Check className="w-3 h-3" />}>
              Authentication Complete
            </StatusBadge>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="warning" icon={<AlertTriangle className="w-3 h-3" />}>
              Insurance Expiring Soon
            </StatusBadge>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status="info" icon={<Info className="w-3 h-3" />}>
              Market Value Updated
            </StatusBadge>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world usage examples showing badges in context of Pokemon card collection management.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    variant: 'pokemon',
    size: 'default',
    children: 'Playground Badge',
    interactive: true,
    startIcon: <Star className="w-3 h-3" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all badge properties.',
      },
    },
  },
};