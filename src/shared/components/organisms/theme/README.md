# Theme Export/Import System

This directory contains components and utilities for exporting and importing theme configurations.

## Files Created

### `ThemeExporter.tsx`

- Complete theme export/import UI component
- Handles single theme and theme collection operations
- Provides backup and restore functionality
- Manages custom presets

### `themeExport.ts` (in utils/)

- Core export/import utilities
- JSON file handling for themes
- Theme validation and conversion
- Local storage management for presets and backups

## Usage

```tsx
import { ThemeExporter } from '../components/theme';

// Basic usage
<ThemeExporter />

// With custom configuration
<ThemeExporter
  size="lg"
  showAdvanced={true}
  onThemeImported={(themeName) => console.log(`Imported: ${themeName}`)}
/>
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
