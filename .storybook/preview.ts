import type { Preview } from '@storybook/react';
import '../src/theme/unified-variables.css';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '812px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        wide: {
          name: 'Wide Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a202c',
        },
        {
          name: 'pokemon-light',
          value: '#f8fafc',
        },
        {
          name: 'pokemon-dark',
          value: '#0f172a',
        },
        {
          name: 'glass',
          value: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        },
        {
          name: 'cosmic',
          value: 'linear-gradient(135deg, #0c0a1d 0%, #1a0933 100%)',
        }
      ],
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
          {
            id: 'keyboard',
            enabled: true,
          },
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Pokemon Collection Theme',
      defaultValue: 'pokemon',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'pokemon', title: 'Pokemon' },
          { value: 'glass', title: 'Glass' },
          { value: 'cosmic', title: 'Cosmic' },
          { value: 'neural', title: 'Neural' },
          { value: 'minimal', title: 'Minimal' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Light/Dark Mode',
      defaultValue: 'light',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'system', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Layout Density',
      defaultValue: 'comfortable',
      toolbar: {
        title: 'Density',
        icon: 'component',
        items: [
          { value: 'compact', title: 'Compact' },
          { value: 'comfortable', title: 'Comfortable' },
          { value: 'spacious', title: 'Spacious' },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      description: 'Animation Level',
      defaultValue: 'normal',
      toolbar: {
        title: 'Motion',
        icon: 'play',
        items: [
          { value: 'reduced', title: 'Reduced' },
          { value: 'normal', title: 'Normal' },
          { value: 'enhanced', title: 'Enhanced' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;