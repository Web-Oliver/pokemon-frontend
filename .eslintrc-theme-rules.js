// Custom ESLint rules for Pokemon Collection Frontend Theme Compliance
// These rules enforce our unified design system and prevent hardcoded styling

module.exports = {
  rules: {
    // Prevent hardcoded color values in JSX and CSS
    'pokemon-ui/no-hardcoded-colors': {
      create: function(context) {
        const hardcodedColorPatterns = [
          // Hex colors
          /#[0-9a-f]{3,8}/i,
          // RGB/RGBA functions
          /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/i,
          // HSL/HSLA functions  
          /hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%/i,
          // Common Tailwind color classes
          /\b(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray|black|white)-\d+\b/,
          // CSS color keywords
          /\b(red|blue|green|yellow|purple|pink|orange|brown|black|white|gray|grey)\b/i
        ];

        function checkForHardcodedColors(node, value) {
          hardcodedColorPatterns.forEach(pattern => {
            if (pattern.test(value)) {
              context.report({
                node,
                message: `Avoid hardcoded colors (${value}). Use CSS variables from the theme system instead, e.g., var(--theme-primary) or bg-[var(--theme-primary)].`,
                suggest: [{
                  desc: 'Use CSS variable instead',
                  fix: function(fixer) {
                    // Basic suggestion - would need more sophisticated logic for real implementation
                    return fixer.replaceText(node, `var(--theme-primary)`);
                  }
                }]
              });
            }
          });
        }

        return {
          // Check JSX className attributes
          JSXAttribute(node) {
            if (node.name.name === 'className' && node.value) {
              if (node.value.type === 'Literal') {
                checkForHardcodedColors(node, node.value.value);
              } else if (node.value.type === 'JSXExpressionContainer') {
                if (node.value.expression.type === 'Literal') {
                  checkForHardcodedColors(node, node.value.expression.value);
                }
              }
            }
          },

          // Check style prop objects
          Property(node) {
            if (node.key && 
                (node.key.name === 'color' || 
                 node.key.name === 'backgroundColor' || 
                 node.key.name === 'borderColor' ||
                 node.key.value === 'color' ||
                 node.key.value === 'backgroundColor' ||
                 node.key.value === 'borderColor')) {
              if (node.value.type === 'Literal') {
                checkForHardcodedColors(node, node.value.value);
              }
            }
          },

          // Check template literals (styled-components, emotion, etc.)
          TemplateLiteral(node) {
            node.quasis.forEach(quasi => {
              checkForHardcodedColors(node, quasi.value.raw);
            });
          }
        };
      }
    },

    // Enforce CSS variables for theming
    'pokemon-ui/prefer-css-variables': {
      create: function(context) {
        const themeProperties = [
          'color', 'backgroundColor', 'borderColor', 'fill', 'stroke'
        ];

        return {
          Property(node) {
            if (node.key && themeProperties.includes(node.key.name || node.key.value)) {
              if (node.value.type === 'Literal' && 
                  typeof node.value.value === 'string' &&
                  !node.value.value.includes('var(--')) {
                context.report({
                  node,
                  message: `Use CSS variables for theming. Replace "${node.value.value}" with a CSS variable like "var(--theme-primary)".`,
                });
              }
            }
          }
        };
      }
    },

    // Warn about potential component reusability violations
    'pokemon-ui/enforce-shared-components': {
      create: function(context) {
        const componentUsage = new Map();

        return {
          JSXElement(node) {
            const elementName = node.openingElement.name.name;
            
            // Track usage of non-standard HTML elements (likely components)
            if (elementName && elementName[0] === elementName[0].toUpperCase()) {
              const usage = componentUsage.get(elementName) || [];
              usage.push(node);
              componentUsage.set(elementName, usage);

              // If component used multiple times, suggest making it shared
              if (usage.length > 2) {
                context.report({
                  node,
                  message: `Component "${elementName}" is used ${usage.length} times. Consider creating a shared component in src/shared/ui/.`,
                });
              }
            }
          }
        };
      }
    },

    // Enforce proper theme import usage
    'pokemon-ui/proper-theme-imports': {
      create: function(context) {
        let hasThemeImport = false;
        let usesHardcodedStyles = false;

        return {
          ImportDeclaration(node) {
            if (node.source.value.includes('@/theme') || 
                node.source.value.includes('./theme')) {
              hasThemeImport = true;
            }
          },

          JSXAttribute(node) {
            if (node.name.name === 'className' && node.value) {
              const className = node.value.type === 'Literal' ? 
                node.value.value : '';
              
              // Check for hardcoded Tailwind classes
              if (/\b(bg|text|border)-(red|blue|green|yellow|purple|pink|indigo|gray|black|white)-\d+\b/.test(className)) {
                usesHardcodedStyles = true;
              }
            }
          },

          'Program:exit'() {
            if (usesHardcodedStyles && !hasThemeImport) {
              context.report({
                message: 'File uses hardcoded styles but does not import theme system. Import from @/theme to use proper design tokens.',
                loc: { line: 1, column: 0 }
              });
            }
          }
        };
      }
    },

    // Enforce Storybook stories for shared components
    'pokemon-ui/require-storybook-stories': {
      create: function(context) {
        const filename = context.getFilename();
        
        // Check if this is a shared UI component
        if (filename.includes('src/shared/ui/') && 
            filename.endsWith('.tsx') && 
            !filename.includes('.stories.') &&
            !filename.includes('.test.')) {
          
          return {
            ExportDefaultDeclaration(node) {
              context.report({
                node,
                message: 'Shared UI components must have corresponding Storybook stories. Create a .stories.tsx file for this component.',
              });
            }
          };
        }

        return {};
      }
    },

    // Enforce accessibility attributes for interactive components
    'pokemon-ui/require-a11y-attributes': {
      create: function(context) {
        const interactiveElements = ['button', 'input', 'select', 'textarea'];
        
        return {
          JSXOpeningElement(node) {
            const elementName = node.name.name;
            
            if (interactiveElements.includes(elementName)) {
              const hasAriaLabel = node.attributes.some(attr => 
                attr.name && attr.name.name === 'aria-label'
              );
              const hasAriaLabelledBy = node.attributes.some(attr =>
                attr.name && attr.name.name === 'aria-labelledby'
              );
              const _hasRole = node.attributes.some(attr =>
                attr.name && attr.name.name === 'role'
              );

              if (!hasAriaLabel && !hasAriaLabelledBy && elementName === 'button') {
                context.report({
                  node,
                  message: 'Interactive elements should have accessible labels. Add aria-label or ensure the button has descriptive text content.',
                });
              }
            }
          }
        };
      }
    },

    // Enforce TypeScript strict mode compliance
    'pokemon-ui/no-any-types': {
      create: function(context) {
        return {
          TSAnyKeyword(node) {
            context.report({
              node,
              message: 'Avoid using "any" type. Use specific types or "unknown" with type guards for better type safety.',
              suggest: [{
                desc: 'Replace with unknown',
                fix: function(fixer) {
                  return fixer.replaceText(node, 'unknown');
                }
              }]
            });
          }
        };
      }
    }
  }
};