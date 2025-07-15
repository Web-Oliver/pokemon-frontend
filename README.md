# Pokemon Collection Frontend

A comprehensive React.js Single-Page Application (SPA) for managing a Pokemon card collection database with beautiful, award-winning design principles.

## 🎯 Project Overview

The Pokemon Collection Frontend is a modern, responsive web application that provides intuitive UI for:
- **Collection Management**: Add, edit, delete, and organize PSA graded cards, raw cards, and sealed products
- **Financial Tracking**: Monitor prices, profit margins, and sales analytics with interactive charts
- **Auction Management**: Create and manage auctions with export capabilities for social media
- **Search & Discovery**: Advanced search functionality with hierarchical autocomplete
- **Export Features**: Generate Facebook posts, download images, and export collection data

## 🛠 Technology Stack

### Core Technologies
- **React.js 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **Zustand** for lightweight state management

### Key Libraries
- **Recharts** for interactive data visualization
- **React Hook Form** for efficient form management
- **Axios** for HTTP client communication
- **Lucide React** for beautiful icons
- **React Hot Toast** for elegant notifications

### Testing Framework
- **Vitest** for unit and integration testing
- **React Testing Library** for component testing
- **Playwright** for end-to-end testing (planned)

## 🏗 Architecture

The project follows a strict **layered architecture** based on SOLID principles:

### Layer 1: Core/Foundation
- `src/utils/`: Global utilities (constants, logger, error handler)
- `src/api/`: API client modules for backend communication

### Layer 2: Services/Hooks/Store
- `src/hooks/`: Custom React hooks for business logic
- `src/domain/services/`: Pure business logic services

### Layer 3: Components
- `src/components/`: Reusable UI components
- `src/domain/models/`: TypeScript interfaces and data models

### Layer 4: Views/Pages
- `src/pages/`: Top-level application screens

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **Backend Service**: The Pokemon Collection Backend must be running on port 3000

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pokemon-collection-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend service** (Critical Requirement)
   ```bash
   cd ../pokemon-collection-backend
   npm run dev
   ```
   The backend must be running on **http://localhost:3000** before starting the frontend.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to **http://localhost:5173** to access the application.

## 🧪 Testing

### Running Tests

The project includes comprehensive test coverage with real backend integration:

```bash
# Run all tests with 20-second timeout
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Types

- **Unit Tests**: Individual component and utility function testing
- **Integration Tests**: Hook and API integration with real backend
- **Component Tests**: React component behavior and interaction testing

**Important**: All integration tests use the **real backend API** - no mocking is allowed per project requirements.

### ESLint & Code Quality

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## 🎨 Key Features

### Collection Management
- **Multi-Category Support**: PSA Graded Cards, Raw Cards, Sealed Products
- **Smart Search**: Hierarchical autocomplete with set/card filtering
- **Price Tracking**: Historical price management with visual displays
- **Mark as Sold**: Complete sale tracking with buyer information

### Sales Analytics
- **Interactive Charts**: Revenue and profit trends over time
- **Category Breakdown**: Visual analysis of sales by product type
- **KPI Dashboard**: Key performance indicators and margins
- **Date Range Filtering**: Custom period analysis

### Auction Management
- **Auction Creation**: Build auctions with multiple collection items
- **Export Tools**: Generate Facebook posts and download images
- **Social Media Integration**: Pre-formatted content for marketing

### Export Features
- **Facebook Text Files**: Generate marketing content for collections and auctions
- **Image Archives**: Bulk download of auction images as ZIP files
- **Collection Reports**: Export selected items for external use

## 🌐 API Integration

The frontend communicates with the Pokemon Collection Backend through RESTful APIs:

- **Base URL**: `http://localhost:3000/api`
- **Authentication**: Currently none (development setup)
- **Data Format**: JSON with structured error responses
- **Caching**: 5-minute server-side caching for search operations

### Key API Endpoints
- `/api/cards` - Card search and management
- `/api/sets` - Pokemon set information
- `/api/psa-graded-cards` - PSA collection management
- `/api/raw-cards` - Raw card collection
- `/api/sealed-products` - Sealed product management
- `/api/auctions` - Auction operations
- `/api/sales` - Sales analytics and data

## 🎯 Development Workflow

### Git Workflow
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/<name>**: New feature development
- **bugfix/<description>**: Bug fixes

### Commit Guidelines
```
feat(scope): Add new feature
fix(scope): Fix bug or issue
docs(scope): Documentation updates
style(scope): Code style changes
refactor(scope): Code refactoring
test(scope): Add or update tests
chore(scope): Maintenance tasks
```

### Code Standards
- **TypeScript**: Strict typing enforced
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **Tailwind CSS**: Utility-first styling approach

## 📱 Design Principles

### Beautiful, Award-Winning Design
- **Modern Aesthetics**: Clean, professional interface design
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **User Experience**: Intuitive navigation and interaction patterns
- **Visual Hierarchy**: Clear typography and color contrast
- **Smooth Animations**: Subtle transitions and loading states

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Visible focus indicators

## 🔧 Build & Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Build Output
- **Optimized Assets**: Minified JavaScript and CSS
- **Asset Optimization**: Image compression and lazy loading
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Optimized chunk loading

## 🐛 Troubleshooting

### Common Issues

1. **Backend Not Running**
   - Error: API calls failing with connection errors
   - Solution: Ensure backend is running on port 3000

2. **Test Failures**
   - Error: Tests timing out or API errors
   - Solution: Start backend before running tests

3. **Build Errors**
   - Error: TypeScript compilation errors
   - Solution: Run `npm run lint` and fix type issues

4. **Toast Notifications Not Showing**
   - Error: No error/success messages visible
   - Solution: Check that Toaster component is rendered in App.tsx

### Performance Optimization
- **Bundle Analysis**: Use `npm run build -- --analyze` to inspect bundle size
- **Memory Leaks**: Monitor component unmounting and cleanup
- **API Caching**: Leverage backend caching for repeated requests

## 🤝 Contributing

### Development Setup
1. Follow the installation steps above
2. Create a feature branch from `develop`
3. Implement changes following the layered architecture
4. Write comprehensive tests (unit and integration)
5. Ensure all tests pass with real backend
6. Submit pull request with detailed description

### Code Review Process
- All PRs require approval before merging
- Tests must pass with real backend integration
- ESLint and TypeScript checks must pass
- Design review for UI/UX changes

## 📄 License

This project is for educational and portfolio purposes. All rights reserved.

## 🆘 Support

For technical support or questions:
1. Check this README for common solutions
2. Review the backend documentation for API details
3. Ensure both frontend and backend are running correctly
4. Check browser console for detailed error messages

---

**Built with ❤️ using React, TypeScript, and modern web technologies**