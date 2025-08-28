# Component Migration Scripts - Unified Theme System

This directory contains automated scripts to help migrate your components to the centralized theme system with minimal manual work.

## 🚀 Quick Start

### 1. Run the Migration Script

```bash
# Navigate to your project root
cd /home/oliver/apps/pokemon-collection/pokemon-collection-frontend

# Run the automated migration
node scripts/migrate-components-to-unified-theme.js
```

### 2. What the Script Does

**Automatically replaces:**
- `bg-white` → `bg-background`
- `bg-gray-900` → `bg-background` 
- `text-white` → `text-foreground`
- `text-gray-600` → `text-muted-foreground`
- `border-gray-200` → `border-border`
- `shadow-lg` → `shadow-theme-primary`
- And 20+ more common patterns...

**Removes dark mode classes:**
- `dark:bg-gray-800` ❌ (removed)
- `dark:text-white` ❌ (removed)
- `dark:border-gray-700` ❌ (removed)

**Adds theme imports:**
- Automatically imports `useUnifiedTheme` where needed
- Adds proper relative import paths

### 3. Review Changes

The script creates `.backup` files so you can review changes:

```bash
# Compare original vs migrated
diff src/components/SomeComponent.tsx.backup src/components/SomeComponent.tsx

# Remove backups when satisfied
find . -name "*.backup" -delete
```

## 📋 Migration Report Example

```
🎨 UNIFIED THEME MIGRATION REPORT
============================================================
📊 STATISTICS:
  Files processed: 47
  Files migrated: 23
  CSS classes replaced: 156
  Dark mode classes removed: 89
  Theme imports added: 12

✅ SUCCESSFULLY MIGRATED FILES:
  • src/components/ui/Card.tsx
  • src/components/ui/Button.tsx
  • src/features/dashboard/Dashboard.tsx
  • src/features/collection/Collection.tsx
  ...

📝 NEXT STEPS:
  1. Review migrated files and test functionality
  2. Update main App.tsx to use UnifiedThemeProvider
  3. Import unified-theme-variables.css in your main CSS file
  4. Remove old theme-related code and CSS files
  5. Delete backup files once satisfied: rm **/*.backup
```

## 🛠️ Manual Migration Steps

For components the script couldn't fully migrate:

### 1. Replace Your Theme Provider

**OLD:**
```tsx
import { ThemeProvider } from '../contexts/theme-context';

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      {/* app content */}
    </ThemeProvider>
  );
}
```

**NEW:**
```tsx
import { UnifiedThemeProvider } from '../contexts/UnifiedThemeProvider';
import '../styles/unified-theme-variables.css';

function App() {
  return (
    <UnifiedThemeProvider>
      {/* app content */}
    </UnifiedThemeProvider>
  );
}
```

### 2. Update CSS Import

**Add to your main CSS file or App.tsx:**
```tsx
import '../styles/unified-theme-variables.css';
```

### 3. Add Theme Switcher (Optional)

```tsx
import UnifiedThemeSwitcher from '../components/theme/UnifiedThemeSwitcher';

// Add anywhere in your app
<UnifiedThemeSwitcher />
```

## 🔍 Component Examples

### Simple Card Component

**BEFORE:**
```tsx
const Card = ({ children }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg shadow-lg">
    {children}
  </div>
);
```

**AFTER (Automatic):**
```tsx
const Card = ({ children }) => (
  <div className="bg-card text-card-foreground border-border rounded-lg shadow-theme-primary">
    {children}
  </div>
);
```

### Button Component

**BEFORE:**
```tsx
const Button = ({ variant, children }) => (
  <button className={`px-4 py-2 rounded-lg ${variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`}>
    {children}
  </button>
);
```

**AFTER (Automatic):**
```tsx
const Button = ({ variant, children }) => (
  <button className={cn(
    "px-4 py-2 rounded-lg transition-colors duration-200",
    variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  )}>
    {children}
  </button>
);
```

## 🎨 Available Themes

Once migrated, your components automatically support all themes:

### Standard Themes
- `light` - Clean light interface
- `dark` - Modern dark interface
- `system` - Follows OS preference

### Brand Themes  
- `pokemon` - Pokemon brand colors

### Glass Themes
- `glass` - Basic glassmorphism
- `premium` - Enhanced glass effects
- `liquid-glass` - Fluid animations
- `holo-collection` - Holographic effects

### Artistic Themes
- `cosmic-aurora` - Space-inspired
- `ethereal-dream` - Dreamy purples

### Professional Themes
- `g10`, `g90`, `g100` - Carbon Design System

## ⚠️ Common Issues & Solutions

### Issue: Colors don't look right
**Solution:** Check if you're overriding theme classes with custom CSS

### Issue: Dark mode not working
**Solution:** Ensure you're not using `dark:` classes anymore - they're handled by CSS variables now

### Issue: Theme switching is slow
**Solution:** Add `transition-colors duration-200` to components for smooth transitions

### Issue: Custom colors not theming
**Solution:** Use CSS custom properties: `style={{ backgroundColor: 'hsl(var(--primary))' }}`

## 🧪 Testing Your Migration

```bash
# Test theme switching
npm run dev

# In browser console:
document.documentElement.setAttribute('data-theme', 'pokemon')
document.documentElement.setAttribute('data-theme', 'cosmic-aurora')
document.documentElement.setAttribute('data-theme', 'light')
```

All your components should switch themes instantly! 🎉

## 📚 Additional Resources

- `component-theme-examples.md` - Detailed before/after examples
- `../docs/CENTRALIZED_THEME_ANALYSIS.md` - Full architecture analysis
- `../src/components/theme/UnifiedThemeSwitcher.tsx` - Example theme switcher
- `../src/styles/unified-theme-variables.css` - All available CSS variables