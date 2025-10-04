# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager & Node Version

- **ALWAYS use `pnpm`** - never use npm or yarn
- Required: Node >=24, pnpm 10.18.0
- Install dependencies: `pnpm install`

## Development Commands

```bash
pnpm dev          # Start development server (Vite)
pnpm build        # TypeScript check + production build
pnpm preview      # Preview production build
pnpm lint         # Lint with oxlint (strict rules)
pnpm format       # Format code with Prettier
pnpm format:check # Check formatting without changes
pnpm lint:fix     # Auto-fix lint issues + format
```

## Architecture Principles

### Strict Folder Structure

The codebase follows a **strict three-layer architecture**:

```
src/
├── pages/       # Page-level components (route representations)
├── modules/     # Feature modules with logic and state
├── components/  # Presentational/dummy components only
└── api/         # API layer and data providers
```

**Critical architectural rules:**
1. **Router → Pages → Modules → Components** (one-way dependency flow)
2. **Page CANNOT import another Page**
3. **Module CANNOT import another Module** (exception: high-order modules only)
4. Pages orchestrate modules and handle routing logic
5. Modules contain business logic and can import components
6. Components are purely presentational (no business logic)

### Data & API Pattern

- **NO static data in components or modules**
- All data flows through `src/api/` layer
- Use **data provider pattern** with `MOCK_*` constants for easy API switching
- Example: `MOCK_ARTICLES` in `src/api/news.ts` - replace with actual Supabase calls later
- If no data (empty array), hide entire block (don't show empty states)

### Component Loading States

- Always show loading states when fetching data
- Use the `<Loader />` component for loading UI
- Handle errors gracefully with navigation fallbacks

## Code Quality Standards

Follow **DRY** and **KISS** principles. Apply **SOLID** only when necessary (not the primary focus).

### TypeScript & Linting

- oxlint configured with **strict error-level rules** for React, TypeScript, Import, ESLint
- jsx-a11y and unicorn set to warnings
- Must pass TypeScript compilation (`tsc`) before build
- Only `src/**/*` files are linted (node_modules, dist, config files ignored)

### Styling Guidelines

- **Tailwind CSS v4** with PostCSS (`@tailwindcss/postcss`)
- **shadcn/ui** components (built on Radix UI primitives)
- Color system combines:
  - Default Tailwind colors: `gray`, `red`, `yellow`, `green`, `blue` (preserved)
  - Custom shadcn CSS variables: `background`, `foreground`, `card`, `primary`, etc.
- **IMPORTANT**: Use proper gray colors (`text-gray-600`, `text-gray-900`, `bg-gray-100`) instead of `text-muted-foreground` or `bg-muted` in white-background contexts
- Use `<Separator />` component for horizontal/vertical dividers (not border classes)

### UI Component Patterns

- Modals should have white backgrounds (`bg-white text-gray-900`) not dark theme
- Trust score badges use dynamic colors: green (≥60), yellow (≥20), red (<20)
- Progress bars automatically color-code based on score value
- Remove default borders with `border-0` class when needed
- Images use custom `<Image />` component with fallback support

## Tech Stack

- **React 19.2** with React Router for navigation
- **Vite 7** for build tooling
- **TanStack Query** for state management (installed, not yet implemented)
- **Supabase** for backend (installed, placeholder API ready)
- **TypeScript 5.9** for type safety
- **Prettier 3.6** for code formatting
- **oxlint 1.19** for fast linting

## Project Context

This is a **news credibility checker** application (ProofMark) for HackYeah hackathon:
- Users can view news articles with AI-generated trust scores
- Trust scores range 0-100 with letter grades (AAA, AA, A, B, C)
- Deep Research mode (coming soon) for advanced fact-checking
- Article detail pages show full analysis with sources and flags

## Future Integration Points

1. **Supabase Connection**: Replace `MOCK_ARTICLES` in `src/api/news.ts` with actual database queries
2. **TanStack Query**: Implement for data fetching and caching
3. **AI Analysis**: Connect `analyzeText()` function to actual AI API
4. **Deep Research**: Implement advanced credibility analysis features
