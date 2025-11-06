# GEMINI.md

## Project Overview

This project is a "Video Orchestrator," an AI-powered desktop application for creating automated vertical videos for platforms like TikTok, Shorts, and Reels. It combines AI-generated scripts with local media processing to produce complete videos with backgrounds, voice-overs, audio, and subtitles.

The project is a monorepo using pnpm workspaces, composed of a Tauri/Svelte frontend and a Node.js/Express backend.

**Key Technologies:**

*   **Frontend:** Tauri, Svelte
*   **Backend:** Node.js, Express.js
*   **Monorepo:** pnpm workspaces
*   **Shared Code:** TypeScript, Zod for validation
*   **External Tools:** FFmpeg, Piper (TTS), Whisper (STT), Godot (optional, for voxel background generation)

**Architecture:**

*   `apps/ui`: The Tauri + Svelte desktop application.
*   `apps/orchestrator`: The Node.js + Express backend that handles the core logic.
*   `packages/shared`: A shared package for common types, schemas, and utility functions.
*   `tools`: Contains the external tool binaries required for media processing.
*   `data`: Stores media assets and the final video outputs.
*   `tests`: Contains integration and unit tests.

## Building and Running

**Prerequisites:**

*   Node.js 18+
*   pnpm
*   Rust (for the Tauri desktop app)
*   Git

**Installation:**

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Build the shared packages:
    ```bash
    pnpm --filter @video-orchestrator/shared build
    ```

**Development:**

*   Start the development environment (both UI and backend):
    ```bash
    pnpm dev
    ```
*   Start only the backend (on port 4545):
    ```bash
    pnpm --filter @app/orchestrator dev
    ```
*   Start only the frontend (on port 5173):
    ```bash
    pnpm --filter @app/ui dev
    ```

**Building:**

*   Build the entire project:
    ```bash
    pnpm build
    ```
*   Build the Tauri desktop application:
    ```bash
    pnpm --filter @app/ui tauri build
    ```

**Testing:**

*   Run all tests:
    ```bash
    pnpm test:all
    ```
*   Run integration tests:
    ```bash
    pnpm test:integration
    ```
*   Run unit tests:
    ```bash
    pnpm test:unit
    ```

## Development Conventions

*   The project follows a monorepo structure using pnpm workspaces.
*   Code is shared between the frontend and backend via the `packages/shared` directory.
*   The backend uses a service container for dependency injection, making it modular and testable.
*   The frontend uses lazy-loading for its components to improve performance.
*   Zod is used for schema validation.
*   Vitest and Playwright are used for testing.
