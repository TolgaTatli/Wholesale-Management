# Wholesale Management - AI Coding Agent Instructions

## Project Overview
This is a React 19 + Vite 7 wholesale management application using modern JavaScript (not TypeScript). Currently in early development with a minimal starter template structure.

## Tech Stack & Architecture
- **Build Tool**: Vite 7 with HMR (Hot Module Replacement)
- **Framework**: React 19.2 with React DOM 19.2
- **Language**: JavaScript (JSX) - ES modules (`"type": "module"` in package.json)
- **Styling**: CSS modules approach with component-specific stylesheets ([App.css](../src/App.css), [index.css](../src/index.css))
- **Entry Point**: [src/main.jsx](../src/main.jsx) mounts [src/App.jsx](../src/App.jsx) into `#root` div using StrictMode

## Development Workflows

### Running the Application
```bash
npm run dev          # Start dev server with HMR (default: http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build
npm run lint         # Run ESLint across codebase
```

### Code Quality Standards
- **ESLint Config**: Uses modern flat config format ([eslint.config.js](../eslint.config.js))
- **Enabled Rules**:
  - React Hooks rules (flat config)
  - React Refresh for Vite HMR
  - Custom rule: `no-unused-vars` with exception for capitalized constants (`varsIgnorePattern: '^[A-Z_]'`)
- **Ignored Files**: `dist/` directory is excluded from linting

## Project-Specific Conventions

### File Structure
```
src/
  ├── App.jsx          # Main component
  ├── App.css          # App-specific styles
  ├── main.jsx         # Application entry point
  ├── index.css        # Global styles
  └── assets/          # Static assets (logos, images)
```

### Styling Approach
- **Theme System**: CSS custom properties in `:root` with light/dark mode support
- **Color Scheme**: Automatic theme switching via `@media (prefers-color-scheme: light)`
- **Component Styles**: Scoped CSS files paired with components (e.g., `App.jsx` → `App.css`)
- **Global Styles**: [src/index.css](../src/index.css) defines typography, colors, and base element styles

### React Patterns
- **State Management**: `useState` hooks for local state (no external state library)
- **Component Style**: Functional components with hooks only
- **Strict Mode**: All components wrapped in `<StrictMode>` for development warnings
- **File Extensions**: Use `.jsx` for files containing JSX syntax

### Asset Handling
- Public assets: Reference from `/` (e.g., `/vite.svg`)
- Source assets: Import relative paths (e.g., `./assets/react.svg`)

## Key Implementation Notes
- React Compiler is **not enabled** for better dev/build performance
- No TypeScript - keep type annotations and interfaces out of the codebase
- ESLint uses ECMAScript 2020 with latest parser options
- Vite plugin uses Babel for Fast Refresh (not SWC)

## Future Development Areas
This project is in early stages. When building out features, consider:
- Adding routing (React Router or similar)
- State management strategy for complex wholesale operations
- API integration patterns
- Form handling for wholesale transactions
- Authentication/authorization approach
