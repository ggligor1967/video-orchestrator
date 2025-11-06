# Repository Guidelines

## Project Structure & Module Organization
- `apps/ui` contains the Tauri + Svelte shell; tabs live in `src/components/tabs`, config in `src-tauri/`, stores in `src/stores`.
- `apps/orchestrator` is the Express backend, split across `src/routes`, `controllers`, `services`, and `utils`.
- `packages/shared/src` houses cross-app types, Zod schemas, and utilities, re-exported via `packages/shared/src/index.ts`.
- `tests/` collects Vitest unit/integration/CLI/media suites and Playwright specs such as `tests/e2e/pipeline-ui.spec.js`.
- Stash binaries, cached media, and automation helpers under `tools/`, `data/`, `assets/`, and `scripts/`, with download steps instead of heavy files.

## Build, Test, and Development Commands
- `pnpm install` restores the workspace and should follow any `pnpm-lock.yaml` update.
- `pnpm dev` runs orchestrator (4545) and Svelte UI (5173) together for integrated checks.
- `pnpm --filter @app/orchestrator dev` and `pnpm --filter @app/ui dev` launch services independently for focused work.
- `pnpm build` compiles both bundles; execute before `pnpm --filter @app/ui tauri build` or packaging.
- `pnpm test:all`, `pnpm test:integration`, and `pnpm test:e2e:ui` cover full, service-level, and Playwright runs; add `pnpm test:coverage` when you need reports.

## Coding Style & Naming Conventions
- Use 2-space indentation across TypeScript, JavaScript, and Svelte; prefer `camelCase` functions/variables and `PascalCase` components.
- Name Svelte files `kebab-case.svelte`, colocating companion stores or helpers in the same folder.
- Run `pnpm lint` before review; ESLint with `eslint-plugin-svelte` handles import order, unused symbols, and template hygiene.
- Keep shared helpers in `packages/shared/src/utils.ts` and surface contracts from `packages/shared/src/types.ts`.

## Testing Guidelines
- Write tests as `.spec.ts` or `.test.ts`; keep fast unit specs near source and broader suites in `tests/integration`.
- Use Vitest for backend, CLI, and media validation, and Playwright for UI flows plus keyboard/touch coverage.
- Run `pnpm test:integration` after backend changes and `pnpm test:e2e:ui` when adjusting navigation or interaction layers.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (example: `feat(ui): add background blending`) and squash WIP stacks before raising a PR.
- In PR descriptions, state intent, impacted modules, test evidence, and tooling or binary prerequisites; link related issues.
- Attach screenshots or short clips for UI-facing updates, and document new env vars or feature flags.
- Confirm `pnpm lint`, applicable test suites, and `pnpm build` pass locally before requesting review.

## Security & Configuration Tips
- Store secrets and model binaries outside Git and document download links in `tools/<tool>/README.md`.
- Verify Rust (`rustc --version`) and Node 18+ before Tauri work, and reset caches with `pnpm clean` when artifacts clash.
