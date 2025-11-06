# Architecture Overview

## Monorepo Layout
- `apps/orchestrator`: Express backend with dependency-injected services and routers.
- `apps/ui`: Tauri + Svelte desktop frontend consuming modular API helpers.
- `packages/shared`: Cross-cutting TypeScript types, Zod schemas, and utilities.
- `tests`: Vitest (unit/integration/media) and Playwright e2e suites covering shared workflows.

## Backend Composition (`apps/orchestrator`)
- `src/app.js`: Pure Express app factory wiring middlewares, feature routers, and health endpoints.
- `src/container/`: Lightweight service container registering config, logger, services, controllers, routers, and middleware with override-friendly singletons (`ServiceContainer`).
- `src/config/`: Environment-aware configuration (`loadConfig`) centralising CORS, static directories, logging, and ports for desktop and web shells.
- `src/controllers/`: Dependency-injected controller factories encapsulating validation and orchestration logic.
- `src/middleware/`: Error/not-found handlers resolved via container, enabling custom logging and test stubs.
- Routes resolve through the container (e.g., `createAiRouter`) ensuring consistent wiring and simplifying supertest-driven integration tests.

## Frontend Composition (`apps/ui`)
- `src/App.svelte`: Lazy-loads tab components with requestIdle prefetch and container-aware stores, limiting initial payload for desktop/web.
- `src/components/tabs/`: Feature-specific Svelte modules consuming shared stores and API helpers; subscriptions cleaned via `onDestroy` for memory safety on desktop runtimes.
- `src/stores/appStore.js`: Centralised state inherited by tabs; debounced updates reduce synchronous store chatter.

## Shared Package (`packages/shared`)
- Exposes reusable domain types (`ProjectContext`, `ExportSettings`), Zod schemas, and formatting utilities, allowing backend controllers and frontend stores to share a contract.
- Build via `pnpm --filter @video-orchestrator/shared build` before publishing or generating artefacts.

## Testing & Extensibility
- Integration specs (`tests/integration/api.test.ts`) run the Express app in-process through the container, enabling targeted overrides (e.g., silent loggers) and faster pipelines.
- Frontend modules benefit from lazy-import patterns and containerised stores, maintaining responsiveness across Tauri (desktop) and browser builds.
- Extend backend services by registering new factories within `src/container/index.js`, ensuring new routes/controllers remain injectable and easily testable.
