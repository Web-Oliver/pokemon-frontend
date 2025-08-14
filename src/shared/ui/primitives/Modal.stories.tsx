import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ConfirmModal, AlertModal, PromptModal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { useState } from 'react';
import { Star, Trash2, AlertTriangle, Info, Settings } from 'lucide-react';

const meta: Meta<typeof Modal> = {
  title: 'Components/Primitives/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Modal Component

The unified Modal component consolidates 7+ modal variants into a single comprehensive component with full theme support, convenience components, and accessibility features.

## Features
- **7 Variants**: From standard modals to Pokemon-themed and confirmation modals
- **Convenience Components**: ConfirmModal, AlertModal, PromptModal for common patterns
- **Responsive Sizing**: Multiple size options that adapt to screen size
- **Full Accessibility**: WCAG 2.1 AA compliant with focus management and keyboard navigation
- **Theme Integration**: Works seamlessly with all theme variants
- **Animation Support**: Smooth enter/exit animations with motion respect
- **Overlay Customization**: Configurable overlay behavior and styling

## Usage
\`\`\`tsx
import { Modal, ConfirmModal, AlertModal } from '@/shared/ui';

// Standard modal
<Modal 
  variant="pokemon" 
  size="lg" 
  title="Pokemon Collection" 
  open={isOpen}
  onOpenChange={setIsOpen}
>
  <div>Modal content</div>
</Modal>

// Confirmation modal
<ConfirmModal
  open={showConfirm}
  title="Delete Item"
  description="Are you sure you want to delete this Pokemon card?"
  onConfirm={handleDelete}
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
        'glass',
        'pokemon',
        'cosmic',
        'quantum',
        'confirm',
        'warning',
        'destructive'
      ],
      description: 'Visual variant of the modal'
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg', 'xl', 'full'],
      description: 'Size variant of the modal'
    },
    type: {
      control: 'select',
      options: ['default', 'confirm', 'alert', 'prompt'],
      description: 'Modal type for different interaction patterns'
    },
    open: {
      control: 'boolean',
      description: 'Controls modal visibility'
    },
    title: {
      control: 'text',
      description: 'Modal title'
    },
    description: {
      control: 'text',
      description: 'Modal description'
    },
    closeOnOverlayClick: {
      control: 'boolean',
      description: 'Allow closing by clicking overlay'
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show X close button in header'
    }
  },
  args: {
    variant: 'default',
    size: 'default',
    type: 'default',
    open: false,
    title: 'Modal Title',
    description: '',
    closeOnOverlayClick: true,
    showCloseButton: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic modal with toggle
export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal {...args} open={isOpen} onOpenChange={setIsOpen}>
          <div className="space-y-4">
            <p className="text-[var(--theme-text-secondary)]">
              This is a basic modal with default styling. It can contain any content 
              and supports all theme variants.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic modal with default styling and content.',
      },
    },
  },
};

export const Pokemon: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="pokemon" onClick={() => setIsOpen(true)}>
          Open Pokemon Modal
        </Button>
        <Modal 
          {...args} 
          variant="pokemon" 
          open={isOpen} 
          onOpenChange={setIsOpen}
          title="Pokemon Collection Manager"
          description="Manage your Pokemon card collection"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-[var(--color-pokemon-blue)]/10 rounded-lg border border-[var(--color-pokemon-blue)]/20">
              <Star className="w-5 h-5 text-[var(--color-pokemon-blue)]" />
              <span className="text-sm text-[var(--theme-text-primary)]">
                Pokemon-themed modal with official branding and colors.
              </span>
            </div>
            
            <div className="space-y-3">
              <Input 
                label="Pokemon Name" 
                placeholder="e.g., Charizard" 
                variant="pokemon"
                startIcon={<Star className="w-4 h-4" />}
              />
              <Input 
                label="Card Set" 
                placeholder="e.g., Base Set" 
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="pokemonOutline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="pokemon" onClick={() => setIsOpen(false)}>
                Add to Collection
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pokemon-themed modal with official brand colors and styling.',
      },
    },
  },
};

export const Glass: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="glass" onClick={() => setIsOpen(true)}>
          Open Glass Modal
        </Button>
        <Modal 
          {...args} 
          variant="glass" 
          open={isOpen} 
          onOpenChange={setIsOpen}
          title="Glass Morphism Modal"
          description="Beautiful backdrop blur effects"
        >
          <div className="space-y-4">
            <p className="text-[var(--theme-text-primary)]">
              This modal uses glassmorphism effects with backdrop blur and 
              transparent backgrounds for a modern, floating appearance.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button variant="glass" onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Glass modal with backdrop blur and transparent styling.',
      },
    },
    backgrounds: { default: 'glass' },
  },
};

export const Cosmic: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="cosmic" onClick={() => setIsOpen(true)}>
          Open Cosmic Modal
        </Button>
        <Modal 
          {...args} 
          variant="cosmic" 
          open={isOpen} 
          onOpenChange={setIsOpen}
          title="Cosmic Premium Modal"
          description="Advanced visual effects and premium theming"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
              <p className="text-white">
                Premium cosmic modal with gradient backgrounds and enhanced visual effects.
                Perfect for premium features and advanced functionality.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="cosmic" onClick={() => setIsOpen(false)} motion="enhanced">
                Activate Premium
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Premium cosmic modal with gradient backgrounds and enhanced effects.',
      },
    },
    backgrounds: { default: 'cosmic' },
  },
};

// Confirmation modals
export const ConfirmationModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="destructive" onClick={() => setIsOpen(true)} startIcon={<Trash2 className="w-4 h-4" />}>
          Delete Pokemon Card
        </Button>
        <ConfirmModal
          open={isOpen}
          onOpenChange={setIsOpen}
          title="Delete Pokemon Card"
          description="Are you sure you want to delete this Pokemon card? This action cannot be undone and will permanently remove the card from your collection."
          confirmText="Delete Card"
          cancelText="Keep Card"
          variant="destructive"
          onConfirm={() => {
            console.log('Card deleted');
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
        />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Confirmation modal for destructive actions with clear messaging.',
      },
    },
  },
};

export const WarningModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="warning" onClick={() => setIsOpen(true)} startIcon={<AlertTriangle className="w-4 h-4" />}>
          Show Warning
        </Button>
        <ConfirmModal
          open={isOpen}
          onOpenChange={setIsOpen}
          title="Overwrite Existing Data"
          description="A Pokemon card with this name already exists in your collection. Continuing will overwrite the existing data."
          confirmText="Overwrite"
          cancelText="Cancel"
          variant="warning"
          onConfirm={() => {
            console.log('Data overwritten');
            setIsOpen(false);
          }}
          onCancel={() => setIsOpen(false)}
        />
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning modal for potentially destructive actions.',
      },
    },
  },
};

// Alert modals
export const AlertModals: Story = {
  render: () => {
    const [successOpen, setSuccessOpen] = useState(false);
    const [infoOpen, setInfoOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    
    return (
      <div className="flex gap-3">
        <Button variant="success" onClick={() => setSuccessOpen(true)}>
          Success Alert
        </Button>
        <Button variant="default" onClick={() => setInfoOpen(true)} startIcon={<Info className="w-4 h-4" />}>
          Info Alert
        </Button>
        <Button variant="destructive" onClick={() => setErrorOpen(true)}>
          Error Alert
        </Button>
        
        <AlertModal
          open={successOpen}
          onOpenChange={setSuccessOpen}
          title="Collection Saved Successfully"
          description="Your Pokemon collection has been saved and backed up to the cloud."
          variant="default"
        />
        
        <AlertModal
          open={infoOpen}
          onOpenChange={setInfoOpen}
          title="New Feature Available"
          description="We've added new sorting options to help you organize your Pokemon collection more effectively."
          variant="default"
        />
        
        <AlertModal
          open={errorOpen}
          onOpenChange={setErrorOpen}
          title="Sync Error"
          description="Unable to sync your collection with the cloud. Please check your internet connection and try again."
          variant="destructive"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Alert modals for different notification types.',
      },
    },
  },
};

// Size variations
export const SizeVariations: Story = {
  render: () => {
    const [smOpen, setSmOpen] = useState(false);
    const [defaultOpen, setDefaultOpen] = useState(false);
    const [lgOpen, setLgOpen] = useState(false);
    const [xlOpen, setXlOpen] = useState(false);
    
    return (
      <div className="flex gap-3">
        <Button size="sm" onClick={() => setSmOpen(true)}>Small Modal</Button>
        <Button onClick={() => setDefaultOpen(true)}>Default Modal</Button>
        <Button onClick={() => setLgOpen(true)}>Large Modal</Button>
        <Button onClick={() => setXlOpen(true)}>Extra Large Modal</Button>
        
        <Modal 
          open={smOpen} 
          onOpenChange={setSmOpen} 
          size="sm" 
          title="Small Modal"
          variant="pokemon"
        >
          <p className="text-sm">Compact modal for simple interactions.</p>
          <div className="flex justify-end mt-4">
            <Button size="sm" onClick={() => setSmOpen(false)}>Close</Button>
          </div>
        </Modal>
        
        <Modal 
          open={defaultOpen} 
          onOpenChange={setDefaultOpen} 
          size="default" 
          title="Default Modal"
          variant="pokemon"
        >
          <p>Standard modal size for general content and forms.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDefaultOpen(false)}>Cancel</Button>
            <Button variant="pokemon" onClick={() => setDefaultOpen(false)}>Confirm</Button>
          </div>
        </Modal>
        
        <Modal 
          open={lgOpen} 
          onOpenChange={setLgOpen} 
          size="lg" 
          title="Large Modal"
          variant="pokemon"
          description="More spacious modal for complex content"
        >
          <div className="space-y-4">
            <p>Large modal with more space for complex forms and detailed content.</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Pokemon Name" placeholder="e.g., Charizard" />
              <Input label="Card Number" placeholder="e.g., 4/102" />
            </div>
            <Input label="Description" placeholder="Additional details..." />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setLgOpen(false)}>Cancel</Button>
            <Button variant="pokemon" onClick={() => setLgOpen(false)}>Save</Button>
          </div>
        </Modal>
        
        <Modal 
          open={xlOpen} 
          onOpenChange={setXlOpen} 
          size="xl" 
          title="Extra Large Modal"
          variant="cosmic"
          description="Maximum space for complex workflows and data"
        >
          <div className="space-y-6">
            <p className="text-white">
              Extra large modal for comprehensive forms, data tables, or complex workflows.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Pokemon Name" placeholder="Name" />
              <Input label="Type" placeholder="Fire/Flying" />
              <Input label="Rarity" placeholder="Rare Holo" />
              <Input label="Set" placeholder="Base Set" />
              <Input label="Card Number" placeholder="4/102" />
              <Input label="Condition" placeholder="Grade 1-10" />
            </div>
            <div className="space-y-2">
              <Input label="Description" placeholder="Detailed description..." />
              <Input label="Notes" placeholder="Additional notes..." />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setXlOpen(false)}>Cancel</Button>
            <div className="flex gap-2">
              <Button variant="secondary">Save Draft</Button>
              <Button variant="cosmic" motion="enhanced">Save & Continue</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal sizes from small to extra large for different content needs.',
      },
    },
  },
};

// Complex modal example
export const ComplexModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    
    return (
      <>
        <Button variant="pokemon" onClick={() => setIsOpen(true)} startIcon={<Settings className="w-4 h-4" />}>
          Add Pokemon Card
        </Button>
        <Modal 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) setStep(1);
          }} 
          size="lg" 
          title={`Add Pokemon Card - Step ${step} of 3`}
          variant="pokemon"
          description="Complete all steps to add your Pokemon card to the collection"
        >
          <div className="space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    num === step 
                      ? 'bg-[var(--color-pokemon-blue)] text-white' 
                      : num < step 
                        ? 'bg-[var(--color-pokemon-green)] text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      num < step ? 'bg-[var(--color-pokemon-green)]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--theme-text-primary)]">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Pokemon Name" placeholder="e.g., Charizard" variant="pokemon" required />
                  <Input label="Card Set" placeholder="e.g., Base Set" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Card Number" placeholder="e.g., 4/102" required />
                  <Input label="Year" placeholder="e.g., 1999" type="number" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--theme-text-primary)]">Condition & Value</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Condition Grade" placeholder="1-10" type="number" min="1" max="10" />
                  <Input label="Estimated Value" placeholder="0.00" type="number" startIcon={<span className="text-sm">$</span>} />
                </div>
                <Input label="Condition Notes" placeholder="Any specific condition details..." />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--theme-text-primary)]">Final Details</h3>
                <Input label="Storage Location" placeholder="e.g., Binder 1, Page 5" />
                <Input label="Purchase Date" type="date" />
                <Input label="Additional Notes" placeholder="Any other relevant information..." />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="pokemonOutline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                {step < 3 ? (
                  <Button variant="pokemon" onClick={() => setStep(step + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button variant="pokemon" onClick={() => {
                    console.log('Card added');
                    setIsOpen(false);
                    setStep(1);
                  }}>
                    Add to Collection
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complex multi-step modal with progress indicator and form validation.',
      },
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => {
    const [openVariant, setOpenVariant] = useState<string | null>(null);
    const variants = ['default', 'glass', 'pokemon', 'cosmic', 'quantum', 'confirm', 'warning', 'destructive'];
    
    return (
      <div className="grid grid-cols-2 gap-3">
        {variants.map((variant) => (
          <div key={variant}>
            <Button 
              variant={variant as any}
              onClick={() => setOpenVariant(variant)}
              className="w-full"
            >
              {variant.charAt(0).toUpperCase() + variant.slice(1)} Modal
            </Button>
            <Modal
              open={openVariant === variant}
              onOpenChange={(open) => !open && setOpenVariant(null)}
              variant={variant as any}
              title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Modal`}
              description={`This is the ${variant} modal variant with themed styling.`}
            >
              <div className="space-y-4">
                <p className={variant === 'cosmic' ? 'text-white' : 'text-[var(--theme-text-secondary)]'}>
                  This modal showcases the {variant} variant with appropriate theming and styling.
                </p>
                <div className="flex justify-end">
                  <Button 
                    variant={variant === 'cosmic' ? 'cosmic' : 'default'} 
                    onClick={() => setOpenVariant(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete showcase of all modal variants available.',
      },
    },
  },
};

// Playground
export const Playground: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="pokemon" onClick={() => setIsOpen(true)}>
          Open Playground Modal
        </Button>
        <Modal {...args} open={isOpen} onOpenChange={setIsOpen}>
          <div className="space-y-4">
            <p className={args.variant === 'cosmic' ? 'text-white' : 'text-[var(--theme-text-secondary)]'}>
              This is a playground modal where you can experiment with all the available 
              properties and see how they affect the modal's appearance and behavior.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant={args.variant === 'pokemon' ? 'pokemon' : 'default'} onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    variant: 'pokemon',
    size: 'default',
    title: 'Playground Modal',
    description: 'Experiment with different modal configurations',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to experiment with all modal properties.',
      },
    },
  },
};