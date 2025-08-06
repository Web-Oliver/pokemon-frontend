# Project Overview

## Purpose
Pokemon Collection Frontend - A React-based web application for managing Pokemon card collections, auctions, and sales tracking. Built with a comprehensive design system following CLAUDE.md principles for DRY and SOLID architecture.

## Tech Stack
- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 5.2.0 
- **Routing**: React Router DOM 7.7.1
- **State Management**: Zustand 5.0.6, React Query (@tanstack/react-query 5.84.0)
- **Styling**: Tailwind CSS 3.4.15, Framer Motion 12.23.9
- **HTTP Client**: Axios 1.10.0
- **UI Components**: Lucide React (icons), React Hook Form 7.60.0
- **Testing**: Vitest 3.0.0, Testing Library, jsdom

## Architecture Principles
Follows strict layered architecture as defined in CLAUDE.md:
1. **Layer 1**: Core/Foundation/API Client (utils, constants, types, api-client)
2. **Layer 2**: Services/Hooks/Store (business logic, data orchestration) 
3. **Layer 3**: Components (UI building blocks)
4. **Layer 4**: Views/Pages (application screens)

## Key Features
- Pokemon card collection management (PSA graded, raw cards, sealed products)
- Auction system with item selection and export
- Sales analytics and reporting
- Image upload and management
- Search and filtering capabilities
- Theme system with glassmorphism design
- Export functionality (CSV, text files, DBA formats)