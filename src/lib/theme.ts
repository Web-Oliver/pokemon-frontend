/**
 * Centralized Theme Configuration for Pokemon Collection
 * Integrates shadcn/ui with custom theme system
 */

export const themeConfig = {
  // Design tokens
  colors: {
    // shadcn/ui base colors
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    chart: {
      "1": "hsl(var(--chart-1))",
      "2": "hsl(var(--chart-2))",
      "3": "hsl(var(--chart-3))",
      "4": "hsl(var(--chart-4))",
      "5": "hsl(var(--chart-5))",
    },
    // Pokemon brand colors
    pokemon: {
      red: "#FF0000",
      blue: "#0075BE",
      yellow: "#FFDE00",
      green: "#00A350",
    },
  },
  
  // Animation settings
  animations: {
    fast: "150ms",
    normal: "250ms",
    slow: "400ms",
  },
  
  // Spacing system
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem", 
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  
  // Border radius
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem", 
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
  },
} as const;

export type ThemeConfig = typeof themeConfig;

// Theme modes
export type ThemeMode = "light" | "dark" | "system";

// Density settings
export type DensityMode = "compact" | "comfortable" | "spacious";

// Animation intensity
export type AnimationIntensity = "reduced" | "normal" | "enhanced";

// Glassmorphism intensity  
export type GlassmorphismIntensity = "subtle" | "medium" | "intense";

export interface ThemeSettings {
  mode: ThemeMode;
  density: DensityMode;
  animationIntensity: AnimationIntensity;
  glassmorphismIntensity: GlassmorphismIntensity;
  reducedMotion: boolean;
  highContrast: boolean;
}

export const defaultThemeSettings: ThemeSettings = {
  mode: "dark",
  density: "comfortable",
  animationIntensity: "normal",
  glassmorphismIntensity: "medium",
  reducedMotion: false,
  highContrast: false,
};

// CSS variable mappings for different theme modes
export const lightThemeVariables = {
  "--background": "0 0% 100%",
  "--foreground": "222.2 84% 4.9%",
  "--muted": "210 40% 98%",
  "--muted-foreground": "215.4 16.3% 46.9%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "222.2 84% 4.9%",
  "--card": "0 0% 100%",
  "--card-foreground": "222.2 84% 4.9%",
  "--border": "214.3 31.8% 91.4%",
  "--input": "214.3 31.8% 91.4%",
  "--primary": "222.2 47.4% 11.2%",
  "--primary-foreground": "210 40% 98%",
  "--secondary": "210 40% 96%",
  "--secondary-foreground": "222.2 47.4% 11.2%",
  "--accent": "210 40% 96%",
  "--accent-foreground": "222.2 47.4% 11.2%",
  "--destructive": "0 84.2% 60.2%",
  "--destructive-foreground": "210 40% 98%",
  "--ring": "222.2 84% 4.9%",
  "--radius": "0.5rem",
  "--chart-1": "12 76% 61%",
  "--chart-2": "173 58% 39%",
  "--chart-3": "197 37% 24%",
  "--chart-4": "43 74% 66%",
  "--chart-5": "27 87% 67%",
};

export const darkThemeVariables = {
  "--background": "222.2 84% 4.9%",
  "--foreground": "210 40% 98%",
  "--muted": "217.2 32.6% 17.5%",
  "--muted-foreground": "215 20.2% 65.1%",
  "--popover": "222.2 84% 4.9%",
  "--popover-foreground": "210 40% 98%",
  "--card": "222.2 84% 4.9%",
  "--card-foreground": "210 40% 98%",
  "--border": "217.2 32.6% 17.5%",
  "--input": "217.2 32.6% 17.5%",
  "--primary": "210 40% 98%",
  "--primary-foreground": "222.2 47.4% 11.2%",
  "--secondary": "217.2 32.6% 17.5%",
  "--secondary-foreground": "210 40% 98%",
  "--accent": "217.2 32.6% 17.5%",
  "--accent-foreground": "210 40% 98%",
  "--destructive": "0 62.8% 30.6%",
  "--destructive-foreground": "210 40% 98%",
  "--ring": "212.7 26.8% 83.9%",
  "--chart-1": "220 70% 50%",
  "--chart-2": "160 60% 45%",
  "--chart-3": "30 80% 55%",
  "--chart-4": "280 65% 60%",
  "--chart-5": "340 75% 55%",
};

// Utility functions for theme management
export function applyThemeVariables(variables: Record<string, string>) {
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function getThemeVariables(mode: ThemeMode): Record<string, string> {
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? darkThemeVariables : lightThemeVariables;
  }
  return mode === "dark" ? darkThemeVariables : lightThemeVariables;
}

export function setThemeMode(mode: ThemeMode) {
  const variables = getThemeVariables(mode);
  applyThemeVariables(variables);
  
  // Phase 1.3: Use data attribute for theme switching (performance optimized)
  const root = document.documentElement;
  
  // Maintain backwards compatibility with class-based themes
  root.classList.remove("light", "dark");
  
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolvedTheme = prefersDark ? "dark" : "light";
    root.classList.add(resolvedTheme);
    root.setAttribute("data-theme", resolvedTheme);
  } else {
    root.classList.add(mode);
    root.setAttribute("data-theme", mode);
  }
}

// Phase 1.3: Enhanced theme switching with extended theme modes
export type ExtendedThemeMode = ThemeMode | "pokemon" | "glass";

export function setExtendedThemeMode(mode: ExtendedThemeMode) {
  const root = document.documentElement;
  
  // Handle extended themes
  if (mode === "pokemon" || mode === "glass") {
    // Set base dark theme variables first
    const darkVars = getThemeVariables("dark");
    applyThemeVariables(darkVars);
    
    // Add the extended theme
    root.classList.remove("light", "dark");
    root.classList.add("dark"); // Base for extended themes
    root.setAttribute("data-theme", mode);
  } else {
    // Handle standard themes
    setThemeMode(mode);
  }
}