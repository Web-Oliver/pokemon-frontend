# Technical Standards - Pokemon Collection Frontend

## 🏗️ Architecture Philosophy

Strict adherence to SOLID principles with hierarchical layered architecture ensuring maintainability, scalability, and code reusability. No circular dependencies allowed.

## 🛠️ Technology Stack

### Core Framework

- **React 18** with TypeScript for type safety and modern component patterns
- **Vite** for fast development and optimized production builds
- **TypeScript** with strict mode enabled for compile-time safety

### Styling & UI

- **Tailwind CSS** for utility-first styling approach
- **Lucide React** for consistent iconography
- **Framer Motion** for smooth animations and transitions
- **Beautiful, award-winning design** principles throughout

### State Management & Data Flow

- **Zustand** for lightweight global state management
- **React Hook Form** for efficient form handling and validation
- **Axios** with unified API client for backend communication
- **React Hot Toast** for user notifications

### Data Visualization & Charts

- **Recharts** for interactive sales analytics and collection insights
- **React Window** for virtualized large collection rendering

### Development Tools

- **ESLint** with custom configuration for code quality
- **Prettier** for consistent code formatting
- **TypeScript strict mode** for comprehensive type checking

## 🏛️ Layered Architecture (Strict Hierarchy)

### Layer 1: Core/Foundation/API Client

**Purpose**: Application-agnostic utilities and raw API communication

- `src/utils/`: Global utilities (constants, logger, error handler, formatting)
- `src/api/`: Raw API client modules for backend communication
- `src/config/`: Environment-specific configurations
- **Dependencies**: None (foundation layer)

### Layer 2: Services/Hooks/Store

**Purpose**: Business logic, data orchestration, and state management

- `src/hooks/`: Custom React hooks encapsulating stateful logic
- `src/domain/services/`: Pure business logic services
- `src/interfaces/`: API service interfaces and contracts
- **Dependencies**: Layer 1 only

### Layer 3: Components

**Purpose**: Reusable UI building blocks

- `src/components/common/`: Generic, highly reusable UI components
- `src/components/forms/`: Form-specific components and fields
- `src/components/lists/`: Collection and data display components
- `src/components/layouts/`: Layout and structural components
- `src/domain/models/`: TypeScript interfaces and data models
- **Dependencies**: Layers 1-2

### Layer 4: Views/Pages

**Purpose**: Top-level application screens and orchestration

- `src/pages/`: Complete application screens
- **Dependencies**: Layers 1-3

## 🔗 Backend Integration Standards

- **Base URL**: `http://localhost:3000/api`
- **Protocol**: RESTful APIs with JSON request/response format
- **Error Handling**: Structured error responses with proper HTTP status codes
- **Caching**: 5-minute server-side caching for search operations
- **Real Backend Testing**: All integration tests must use real backend API (no mocking)

## 📊 External Integrations

- **Auto DBA Posting Script**: Generate ZIP files with images and Pokemon names
- **Facebook Marketing**: Pre-formatted text content generation
- **Local Hosting**: Application runs locally with no external deployment constraints

## 🧪 Testing Standards

- **Testing Framework**: Vitest with React Testing Library
- **Integration Testing**: **MANDATORY** real backend integration (no API mocking)
- **Test Timeout**: 20-second timeout for backend-dependent tests
- **Coverage**: Comprehensive unit and integration test coverage
- **Test Types**: Component behavior, hook integration, API communication

## 📋 Code Quality Standards

- **TypeScript**: Strict mode with comprehensive type definitions
- **ESLint**: Custom configuration with import sorting and React-specific rules
- **Prettier**: Automatic code formatting with consistent style
- **SOLID Principles**: Every component and module must follow SRP, OCP, LSP, ISP, DIP
- **DRY Principle**: No code duplication, promote reusable utilities and components
- **Error Boundaries**: Comprehensive error handling at component and application levels

## 🚀 Performance Requirements

- **Bundle Optimization**: Code splitting and tree shaking for optimal load times
- **Virtualization**: Large collection rendering with React Window
- **Lazy Loading**: Route-based code splitting for better initial load
- **Memory Management**: Proper cleanup and unmounting practices

## 🔧 Development Workflow

- **Local Development**: Vite dev server on port 5173
- **Backend Dependency**: Must have backend running on port 3000
- **Hot Reload**: Fast refresh for development efficiency
- **Build Process**: TypeScript compilation + Vite optimized build

## 📁 File Organization Principles

- **Hierarchical Dependencies**: Higher layers depend on lower layers only
- **Feature-Based Grouping**: Related components grouped by functionality
- **Index Files**: Clean exports through index.ts files
- **Naming Conventions**: PascalCase for components, camelCase for utilities
- **Single Responsibility**: Each file has one clear purpose

## 🔒 Security & Best Practices

- **No Hardcoded Secrets**: Configuration through environment variables
- **Input Validation**: Client-side validation with backend verification
- **Error Logging**: Comprehensive logging without sensitive data exposure
- **Type Safety**: Strict TypeScript prevents runtime type errors
