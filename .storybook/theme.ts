import { create } from '@storybook/theming/create';

export default create({
  base: 'light',
  
  // Pokemon Collection Branding
  brandTitle: 'Pokemon Collection UI',
  brandUrl: 'https://pokemon-collection.vercel.app',
  brandTarget: '_self',

  // Colors - Pokemon Brand
  colorPrimary: '#0075BE', // Pokemon Blue
  colorSecondary: '#FFDE00', // Pokemon Yellow
  
  // UI Colors
  appBg: '#f8fafc',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#e2e8f0',
  appBorderRadius: 8,

  // Typography
  fontBase: '"Inter", "Open Sans", sans-serif',
  fontCode: '"JetBrains Mono", "Fira Code", monospace',

  // Text colors
  textColor: '#1e293b',
  textInverseColor: '#ffffff',
  textMutedColor: '#64748b',

  // Toolbar default and active colors
  barTextColor: '#1e293b',
  barSelectedColor: '#0075BE',
  barHoverColor: '#0075BE',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
  inputTextColor: '#1e293b',
  inputBorderRadius: 6,
});