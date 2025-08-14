# Atomic Components

This directory contains basic styled building blocks that combine primitives into commonly used patterns.

## Examples of Atomic Components:

- **FormField**: Input + Label + Error message combination
- **IconButton**: Button with icon styling
- **SearchBox**: Input with search icon and clear button
- **StatusCard**: Card with status indicator
- **ActionButton**: Button with loading states and icons

## Usage Guidelines:

- Atomic components should use primitives from `../primitives`
- Each component should serve a single, well-defined purpose
- Should be highly reusable across different contexts
- Should not contain complex business logic

## Component Structure:

```typescript
// Example atomic component
import { Button, Badge } from '../primitives';

export const StatusButton = ({ status, children, ...props }) => (
  <div className="relative">
    <Button {...props}>{children}</Button>
    <Badge variant={status} className="absolute -top-2 -right-2" />
  </div>
);
```