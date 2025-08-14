import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { Search, Mail, Eye, EyeOff, User, Lock, Star } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Components/Primitives/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Input Component

The unified Input component consolidates 9+ input variants into a single comprehensive component with full theme support, validation states, and accessibility features.

## Features
- **9 Variants**: From standard inputs to Pokemon-themed and specialized variants
- **Validation States**: Success, error, and warning states with messages
- **Icon Support**: Start and end icon positioning  
- **Loading States**: Built-in loading spinner
- **Accessibility**: Full WCAG 2.1 AA compliance with proper labeling
- **Helper Text**: Additional context and guidance
- **Required Field Indicators**: Visual required field indicators
- **Full Theme Support**: Works with all theme variants

## Usage
\`\`\`tsx
import { Input } from '@/shared/ui';

<Input 
  variant="pokemon"
  label="Pokemon Name"
  placeholder="Enter Pokemon name"
  startIcon={<Search />}
  success="Valid Pokemon name!"
  required
/>
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
        'pokemon',
        'glass',
        'success',
        'warning',
        'error',
        'search',
        'filter',
        'inline'
      ],
      description: 'Visual variant of the input'
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
      description: 'Size variant of the input'
    },
    label: {
      control: 'text',
      description: 'Accessible label for the input'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    helperText: {
      control: 'text',
      description: 'Additional context or guidance text'
    },
    success: {
      control: 'text',
      description: 'Success message text'
    },
    error: {
      control: 'text',
      description: 'Error message text'
    },
    warning: {
      control: 'text',
      description: 'Warning message text'
    },
    required: {
      control: 'boolean',
      description: 'Shows required field indicator'
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input'
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state with spinner'
    }
  },
  args: {
    variant: 'default',
    size: 'default',
    label: 'Label',
    placeholder: 'Enter text...',
    required: false,
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variants
export const Default: Story = {
  args: {
    label: 'Default Input',
    placeholder: 'Enter your text here',
  },
};

export const Pokemon: Story = {
  args: {
    variant: 'pokemon',
    label: 'Pokemon Name',
    placeholder: 'Enter Pokemon name',
    startIcon: <Star className="w-4 h-4" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pokemon-themed input with official brand colors and styling.',
      },
    },
  },
};

export const Glass: Story = {
  args: {
    variant: 'glass',
    label: 'Glass Input',
    placeholder: 'Glassmorphism effect',
  },
  parameters: {
    docs: {
      description: {
        story: 'Glass input with backdrop blur and transparent styling.',
      },
    },
    backgrounds: { default: 'glass' },
  },
};

export const Search: Story = {
  args: {
    variant: 'search',
    label: 'Search',
    placeholder: 'Search Pokemon cards...',
    startIcon: <Search className="w-4 h-4" />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Search-optimized input with search icon and styling.',
      },
    },
  },
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Email"
        placeholder="Enter your email"
        startIcon={<Mail className="w-4 h-4" />}
        type="email"
      />
      
      <Input
        label="Username"
        placeholder="Choose username"
        startIcon={<User className="w-4 h-4" />}
        endIcon={<Star className="w-4 h-4 text-green-500" />}
      />
      
      <Input
        label="Search with Filter"
        placeholder="Search and filter..."
        startIcon={<Search className="w-4 h-4" />}
        variant="search"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with start icons, end icons, or both for enhanced usability.',
      },
    },
  },
};

// Validation states
export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        variant="success"
        label="Valid Email"
        placeholder="user@example.com"
        startIcon={<Mail className="w-4 h-4" />}
        success="Email format is valid!"
        value="user@example.com"
      />
      
      <Input
        variant="warning"
        label="Password Strength"
        placeholder="Enter password"
        startIcon={<Lock className="w-4 h-4" />}
        warning="Password should be stronger"
        type="password"
      />
      
      <Input
        variant="error"
        label="Required Field"
        placeholder="This field is required"
        error="Please enter a value"
        required
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with success, warning, and error validation states.',
      },
    },
  },
};

// Loading states
export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Checking Availability"
        placeholder="Enter username"
        loading={true}
        startIcon={<User className="w-4 h-4" />}
      />
      
      <Input
        variant="pokemon"
        label="Searching Pokemon"
        placeholder="Pokemon name..."
        loading={true}
        startIcon={<Search className="w-4 h-4" />}
      />
      
      <Input
        variant="glass"
        label="Processing"
        placeholder="Please wait..."
        loading={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with loading states and spinner indicators.',
      },
    },
  },
};

// Size variations
export const SizeVariations: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        size="sm"
        label="Small Input"
        placeholder="Small size input"
        variant="pokemon"
      />
      
      <Input
        size="default"
        label="Default Input"
        placeholder="Default size input"
        variant="pokemon"
      />
      
      <Input
        size="lg"
        label="Large Input"
        placeholder="Large size input"
        variant="pokemon"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Input sizes from small to large with proportional scaling.',
      },
    },
  },
};

// Helper text examples
export const WithHelperText: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Pokemon Name"
        placeholder="e.g., Pikachu"
        helperText="Enter the name of your favorite Pokemon"
        variant="pokemon"
        startIcon={<Star className="w-4 h-4" />}
      />
      
      <Input
        label="Collection Value"
        placeholder="Enter estimated value"
        helperText="Value in USD (approximate market value)"
        type="number"
      />
      
      <Input
        label="Card Condition"
        placeholder="Grade 1-10"
        helperText="PSA grading scale (10 being perfect condition)"
        type="number"
        min="1"
        max="10"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Inputs with helpful guidance text providing additional context.',
      },
    },
  },
};

// Required fields
export const RequiredFields: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Required Field"
        placeholder="This field is required"
        required
        variant="pokemon"
      />
      
      <Input
        label="Optional Field"
        placeholder="This field is optional"
        helperText="You can skip this field if needed"
      />
      
      <Input
        label="Email Address"
        placeholder="Enter your email"
        type="email"
        required
        startIcon={<Mail className="w-4 h-4" />}
        helperText="We'll use this for important notifications"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Required vs optional fields with proper visual indicators.',
      },
    },
  },
};

// Disabled states
export const DisabledStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Disabled Input"
        placeholder="This input is disabled"
        disabled
        value="Cannot edit this"
      />
      
      <Input
        label="Disabled Pokemon Input"
        placeholder="Pokemon input disabled"
        variant="pokemon"
        disabled
        startIcon={<Star className="w-4 h-4" />}
      />
      
      <Input
        label="Disabled Glass Input"
        placeholder="Glass input disabled"
        variant="glass"
        disabled
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled inputs across different variants maintaining visual hierarchy.',
      },
    },
  },
};

// Special input types
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Email"
        placeholder="user@example.com"
        type="email"
        startIcon={<Mail className="w-4 h-4" />}
        variant="pokemon"
      />
      
      <Input
        label="Password"
        placeholder="Enter password"
        type="password"
        startIcon={<Lock className="w-4 h-4" />}
        variant="pokemon"
      />
      
      <Input
        label="Number"
        placeholder="Enter number"
        type="number"
        min="0"
        max="100"
      />
      
      <Input
        label="Date"
        type="date"
        variant="pokemon"
      />
      
      <Input
        label="Search"
        placeholder="Search anything..."
        type="search"
        variant="search"
        startIcon={<Search className="w-4 h-4" />}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different HTML input types with appropriate styling and icons.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-full max-w-4xl">
      <Input
        variant="default"
        label="Default"
        placeholder="Default input"
      />
      
      <Input
        variant="pokemon"
        label="Pokemon"
        placeholder="Pokemon input"
        startIcon={<Star className="w-4 h-4" />}
      />
      
      <Input
        variant="glass"
        label="Glass"
        placeholder="Glass input"
      />
      
      <Input
        variant="success"
        label="Success"
        placeholder="Success state"
        success="Looks good!"
      />
      
      <Input
        variant="warning"
        label="Warning"
        placeholder="Warning state"
        warning="Check this field"
      />
      
      <Input
        variant="error"
        label="Error"
        placeholder="Error state"
        error="Something went wrong"
      />
      
      <Input
        variant="search"
        label="Search"
        placeholder="Search input"
        startIcon={<Search className="w-4 h-4" />}
      />
      
      <Input
        variant="filter"
        label="Filter"
        placeholder="Filter input"
      />
      
      <Input
        variant="inline"
        label="Inline"
        placeholder="Inline input"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all 9 input variants available.',
      },
    },
  },
};

// Complex form example
export const FormExample: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[var(--theme-text-primary)]">
          Pokemon Card Registration
        </h3>
        
        <Input
          label="Card Name"
          placeholder="e.g., Charizard"
          variant="pokemon"
          startIcon={<Star className="w-4 h-4" />}
          required
          helperText="Enter the Pokemon's name as shown on the card"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Set"
            placeholder="Base Set"
            required
          />
          
          <Input
            label="Card Number"
            placeholder="4/102"
            required
          />
        </div>
        
        <Input
          label="Condition Grade"
          placeholder="1-10"
          type="number"
          min="1"
          max="10"
          helperText="PSA grading scale"
        />
        
        <Input
          label="Estimated Value"
          placeholder="0.00"
          type="number"
          min="0"
          step="0.01"
          startIcon={<span className="text-sm">$</span>}
          helperText="Current market value in USD"
        />
        
        <Input
          label="Notes"
          placeholder="Additional details..."
          helperText="Any special notes about this card (optional)"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complex form example showing real-world usage patterns.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  args: {
    variant: 'pokemon',
    size: 'default',
    label: 'Playground Input',
    placeholder: 'Try different configurations...',
    helperText: 'Experiment with different input properties',
    startIcon: <Search className="w-4 h-4" />,
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all input properties.',
      },
    },
  },
};