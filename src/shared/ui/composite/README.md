# Composite Components

This directory contains complex multi-component patterns that combine primitives and atomic components.

## Examples of Composite Components:

- **DataTable**: Complex table with sorting, filtering, pagination
- **FormWizard**: Multi-step form with navigation
- **CardGrid**: Responsive grid of cards with filtering
- **NavigationMenu**: Complex navigation with dropdowns
- **DashboardWidget**: Complete widget with header, content, actions

## Usage Guidelines:

- Composite components combine multiple primitives and atomic components
- Should handle complex interactions and state management
- Can contain business logic specific to their use case
- Should be configurable through props
- Should maintain accessibility standards

## Component Structure:

```typescript
// Example composite component
import { Card, Button, Badge, Input } from '../primitives';
import { StatusButton, SearchBox } from '../atomic';

export const ItemManager = ({ 
  items, 
  onAdd, 
  onEdit, 
  onDelete,
  ...props 
}) => (
  <Card variant="glass" {...props}>
    <Card.Header>
      <SearchBox placeholder="Search items..." />
      <Button variant="pokemon" onClick={onAdd}>Add Item</Button>
    </Card.Header>
    <Card.Content>
      {/* Complex item management logic */}
    </Card.Content>
  </Card>
);
```