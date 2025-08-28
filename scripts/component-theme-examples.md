# Component Migration Examples - Unified Theme System

This document shows real examples of how to migrate components to use the centralized theme system.

## 🎯 Key Principle: ZERO MANUAL THEME HANDLING

Components should use semantic CSS classes and let CSS custom properties handle theme switching automatically.

## 📋 Migration Examples

### Example 1: Card Component

**BEFORE (Manual Dark Mode):**
```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      text-gray-900 dark:text-white 
      rounded-lg shadow-lg 
      ${className}
    `}>
      {children}
    </div>
  );
};
```

**AFTER (Automatic Theme Adaptation):**
```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={cn(
      // Semantic classes - automatically theme-aware!
      "bg-card text-card-foreground",
      "border border-border",
      "rounded-lg shadow-theme-primary",
      "transition-colors duration-200", // Smooth theme transitions
      className
    )}>
      {children}
    </div>
  );
};
```

### Example 2: Button Component

**BEFORE (Hardcoded Colors):**
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button = ({ variant = 'primary', children }: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors";
  
  if (variant === 'primary') {
    return (
      <button className={`${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`}>
        {children}
      </button>
    );
  }
  
  return (
    <button className={`${baseClasses} bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600`}>
      {children}
    </button>
  );
};
```

**AFTER (Theme-Agnostic):**
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button = ({ variant = 'primary', children }: ButtonProps) => {
  return (
    <button className={cn(
      // Base styles
      "px-4 py-2 rounded-lg font-medium transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      // Variant styles - automatically theme-aware!
      variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-theme-primary",
      variant === 'secondary' && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    )}>
      {children}
    </button>
  );
};
```

### Example 3: Form Input

**BEFORE (Complex Theme Logic):**
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className = '', ...props }: InputProps) => {
  const { isDark } = useTheme(); // Manual theme detection
  
  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 border rounded-lg 
          ${isDark 
            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          {error}
        </p>
      )}
    </div>
  );
};
```

**AFTER (Automatic Theme Support):**
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        className={cn(
          // Base styles - automatically theme-aware!
          "w-full px-3 py-2 border rounded-lg",
          "bg-input text-foreground border-border",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "transition-all duration-200",
          // Error state
          error && "border-destructive focus:ring-destructive",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
```

### Example 4: Navigation Component

**BEFORE (Manual Theme States):**
```tsx
const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <nav className={`
      ${theme === 'dark' 
        ? 'bg-gray-900 border-gray-800' 
        : 'bg-white border-gray-200'
      } 
      border-b shadow-lg
    `}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Pokemon Collection
            </h1>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`
                    ${theme === 'dark' 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                    }
                    px-3 py-2 rounded-md text-sm font-medium transition-colors
                  `}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          
          {/* Theme switcher */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`
              p-2 rounded-lg transition-colors
              ${theme === 'dark'
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
};
```

**AFTER (Theme-Agnostic with Full Theme Support):**
```tsx
import { useUnifiedTheme } from '../contexts/UnifiedThemeProvider';

const Navigation = () => {
  const { availableThemes, currentTheme, setTheme } = useUnifiedTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  
  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border shadow-theme-primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-foreground">
              Pokemon Collection
            </h1>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    "text-muted-foreground hover:text-foreground hover:bg-accent",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          
          {/* Advanced Theme Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            >
              🎨
            </button>
            
            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-popover shadow-theme-hover z-50">
                <div className="p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(availableThemes).map(([category, themes]) => 
                      themes.map(theme => (
                        <button
                          key={theme}
                          onClick={() => {
                            setTheme(theme);
                            setIsThemeMenuOpen(false);
                          }}
                          className={cn(
                            "px-3 py-2 text-xs rounded-md transition-all duration-200",
                            "text-popover-foreground hover:bg-accent hover:text-accent-foreground",
                            currentTheme === theme && "bg-primary text-primary-foreground"
                          )}
                        >
                          {theme}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
```

### Example 5: Dashboard Card with Complex Logic

**BEFORE (Hardcoded Everything):**
```tsx
const StatsCard = ({ title, value, change, icon }) => {
  const { theme } = useTheme();
  const isPositive = change > 0;
  
  return (
    <div className={`
      p-6 rounded-xl border shadow-lg
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
      }
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </p>
        </div>
        <div className={`
          p-3 rounded-lg 
          ${theme === 'dark' 
            ? 'bg-gray-700 text-blue-400' 
            : 'bg-blue-100 text-blue-600'
          }
        `}>
          {icon}
        </div>
      </div>
    </div>
  );
};
```

**AFTER (Fully Theme-Aware with Enhanced Features):**
```tsx
const StatsCard = ({ title, value, change, icon, trend }) => {
  const isPositive = change > 0;
  
  return (
    <div className={cn(
      "p-6 rounded-xl border shadow-theme-primary transition-all duration-200",
      "bg-card text-card-foreground border-border",
      "hover:shadow-theme-hover hover:scale-[1.02]",
      "group" // For hover effects
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">
            {value}
          </p>
          <div className="flex items-center space-x-2">
            <p className={cn(
              "text-sm font-medium",
              isPositive ? "text-green-600" : "text-destructive"
            )}>
              {change > 0 ? '+' : ''}{change}%
            </p>
            {trend && (
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "p-3 rounded-lg transition-all duration-200",
          "bg-primary/10 text-primary",
          "group-hover:bg-primary group-hover:text-primary-foreground",
          "group-hover:scale-110"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};
```

## 🎨 CSS Class Reference

### Core Semantic Classes
- `bg-background` - Main background
- `bg-card` - Card/surface background  
- `bg-primary` - Primary action color
- `bg-secondary` - Secondary elements
- `bg-muted` - Muted backgrounds
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border-border` - Default borders
- `shadow-theme-primary` - Standard shadows
- `shadow-theme-hover` - Hover state shadows

### Interactive States
- `hover:bg-primary/90` - Primary hover (90% opacity)
- `hover:bg-accent` - Accent hover
- `focus:ring-ring` - Focus ring color
- `focus:ring-offset-2` - Focus ring offset

### Special Effects (Glass Themes)
- `backdrop-blur-sm` - Light glassmorphism
- `bg-card/95` - Semi-transparent card (95% opacity)
- Use CSS variables for advanced glass effects

## 🚀 Migration Checklist

- [ ] Replace hardcoded colors with semantic classes
- [ ] Remove `dark:` prefixed classes
- [ ] Replace manual theme detection with CSS classes
- [ ] Add `transition-all duration-200` for smooth theme changes
- [ ] Use `cn()` utility for conditional classes
- [ ] Import `useUnifiedTheme` only when needed for logic (not styling)
- [ ] Test all themes to ensure proper appearance

## 🎯 Key Benefits After Migration

1. **Zero Updates Needed**: Add new themes without touching components
2. **Better Performance**: No re-renders on theme change
3. **Consistent Styling**: All components follow same patterns
4. **Accessibility**: Built-in support for user preferences
5. **Future-Proof**: Easy to extend and maintain