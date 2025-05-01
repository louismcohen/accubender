# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Build production bundle (runs TypeScript check first)
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview production build locally

## Code Style Guidelines
- **Imports**: Use absolute imports with `@/` prefix (e.g., `import Button from '@/components/ui/button'`)
- **Types**: Use TypeScript interfaces for object types, type aliases for unions/primitives
- **Naming**: PascalCase for components, camelCase for functions/variables, ALL_CAPS for constants
- **Components**: 
  - Use functional components with explicit prop interfaces
  - Follow ShadCN component patterns for UI components
- **State Management**: Use React hooks (useState, useEffect, useContext)
- **CSS**: Use Tailwind classes with cn() utility for conditional classes
- **Error Handling**: Use try/catch for async operations
- **Formatting**: Follow ESLint rules (includes TypeScript and React hooks linting)