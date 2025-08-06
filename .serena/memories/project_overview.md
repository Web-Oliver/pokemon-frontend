# Pokemon Collection Frontend - Project Overview

## Purpose
A comprehensive Pokemon card collection management system built with React/TypeScript. Manages PSA graded cards, raw cards, sealed products with features including:
- Collection tracking and organization
- Auction management system
- Price history and analytics
- Export capabilities (DBA format)
- Advanced theming system with glassmorphism effects
- Search and filtering capabilities

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, custom CSS with glassmorphism effects
- **State Management**: Zustand, React Query (@tanstack/react-query)
- **Routing**: React Router DOM v7
- **UI Libraries**: Framer Motion, Lucide React, React Hook Form
- **Testing**: Vitest, Testing Library
- **Build Tools**: Vite, ESLint, Prettier

## Key Architecture
Follows CLAUDE.md layered architecture:
- Layer 1: Core/Foundation/API Client
- Layer 2: Services/Hooks/Store
- Layer 3: Components
- Layer 4: Views/Pages

## Critical Issues Identified
- Multiple circular dependencies in theme system
- Large monolithic components (1300+ lines)
- Bundle optimization warnings
- Missing dependencies (clsx)
- JSX parsing errors in Analytics.tsx