# Consolidated Theme UI Components

This directory contains all theme-related UI components for the Pokemon Collection frontend. All theme management UI has been consolidated here to follow CLAUDE.md principles of Single Responsibility and DRY.

## Components Included

### Main Theme Components

#### `ThemePicker.tsx`
- Complete visual theme selection interface
- Interactive theme switching with live preview
- Responsive grid layout with theme preview cards
- Theme-aware styling and animations

#### `ThemeToggle.tsx` (moved from ui directory)
- Stunning modern theme toggle component
- Light/dark/system mode switching
- Beautiful animated transitions
- Tooltip and system theme indicators

### Accessibility Theme Components

#### `AccessibilityTheme.tsx`
- High contrast theme support
- Reduced motion theme settings
- Focus management controls
- Comprehensive accessibility controls

#### `HighContrastTheme.tsx`
- High contrast mode implementation
- WCAG compliant color schemes

#### `ReducedMotionTheme.tsx`
- Reduced motion support
- Animation intensity controls

#### `FocusManagementTheme.tsx`
- Focus ring management
- Keyboard navigation support

#### `AccessibilityControls.tsx`
- Accessibility settings panel
- Toggle controls for accessibility features

## Usage

```tsx
import { 
  ThemePicker, 
  ThemeToggle, 
  AccessibilityControls,
  ThemeComponents 
} from '@/shared/components/organisms/theme';

// Individual component usage
<ThemePicker onThemeChange={(theme) => console.log(theme)} />
<ThemeToggle />
<AccessibilityControls />

// Or use the consolidated export
const { ThemePicker, ThemeToggle } = ThemeComponents;
```

## Features

### Export Features

- **Export Current Theme**: Save the currently active theme configuration
- **Export All Presets**: Export all custom presets as a collection
- **Export as Collection**: Export selected presets with custom metadata

### Import Features

- **Import Theme File**: Load and apply theme from JSON file
- **Import as Preset**: Save imported theme as a custom preset
- **Batch Import**: Import theme collections with multiple themes

### Management Features

- **Automatic Backups**: Created before major theme changes
- **Backup Restore**: Restore from automatic backups
- **Custom Presets**: Save, load, and delete custom theme presets
- **Validation**: Comprehensive validation of imported theme files

## File Format

Themes are exported in JSON format with the following structure:

```json
{
  "metadata": {
    "name": "My Theme",
    "description": "Custom theme description",
    "version": "1.0.0",
    "exportDate": "2025-08-05T07:59:25.273Z",
    "appVersion": "2025.1.0"
  },
  "configuration": {
    "visualTheme": "context7-premium",
    "colorScheme": "dark",
    "density": "comfortable",
    "animationIntensity": "normal",
    "primaryColor": "dark",
    "highContrast": false,
    "reducedMotion": false,
    "glassmorphismIntensity": 80,
    "particleEffectsEnabled": true
  },
  "customStyles": {
    "--custom-property": "value"
  }
}
```

## Integration

The theme export/import system integrates with:

- `ThemeContext.tsx` for theme configuration access
- `fileOperations.ts` for consistent file download patterns
- `exportUtils.ts` for standardized export operations
- Existing UI component patterns for consistent styling
