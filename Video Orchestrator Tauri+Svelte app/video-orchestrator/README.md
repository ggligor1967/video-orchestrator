# Video Orchestrator

## Overview
The Video Orchestrator project is designed to provide a seamless interface for managing video-related tasks, leveraging modern web technologies and a robust backend. This project utilizes Svelte for the frontend and Express for the backend, wrapped in a Tauri application for desktop deployment.

## Project Structure
- **apps/ui**: Contains the Svelte frontend application.
  - **src/components/tabs**: Svelte components for the tab interface.
  - **src/stores**: Svelte stores for managing application state.
  - **src/lib**: Utility functions and shared logic.
  - **src/App.svelte**: Main entry point for the UI application.
  - **src-tauri**: Source code for the Tauri application.
    - **tauri.conf.json**: Configuration settings for Tauri.
    - **Cargo.toml**: Rust package manager configuration.
  - **package.json**: NPM configuration for the UI application.

- **apps/orchestrator**: Contains the Express backend application.
  - **src/routes**: Route definitions for the backend.
  - **src/controllers**: Business logic for handling routes.
  - **src/services**: Logic for interacting with external APIs or databases.
  - **src/utils**: Utility functions for the backend.
  - **package.json**: NPM configuration for the orchestrator application.

- **packages/shared**: Shared utilities and types across the project.
  - **src/types.ts**: TypeScript types.
  - **src/schemas.ts**: Data validation schemas.
  - **src/utils.ts**: Shared utility functions.
  - **src/index.ts**: Re-exports for easier imports.
  - **package.json**: NPM configuration for the shared package.

- **tools**: Documentation for tools used in the project.
  - **ffmpeg/README.md**: Documentation for FFmpeg.
  - **piper/README.md**: Documentation for Piper.
  - **whisper/README.md**: Documentation for Whisper.

- **scripts**: PowerShell scripts for project management.
  - **download-tools.ps1**: Script to download necessary tools.
  - **diagnose-build.ps1**: Script to diagnose build issues.
  - **monitor-build.ps1**: Script to monitor the build process.

- **tests**: Contains various test suites.
  - **unit**: Unit tests.
  - **integration**: Integration tests.
  - **e2e**: End-to-end tests.

- **data/tts**: Data files related to text-to-speech functionality.

- **.github**: GitHub Actions workflows and instructions.
  - **workflows**: CI/CD workflows.
  - **copilot-instructions.md**: Instructions for using GitHub Copilot.

- **.gitignore**: Specifies files to ignore in Git.

- **pnpm-workspace.yaml**: Configuration for pnpm workspace.

- **package.json**: Main NPM configuration for the project.

- **tsconfig.json**: TypeScript configuration.

- **REAL_DEFICIENCIES_IMPLEMENTATION_PLAN.md**: Implementation plan for addressing project deficiencies.

## Getting Started
To get started with the Video Orchestrator project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd video-orchestrator
   ```

3. Install dependencies:
   ```
   pnpm install
   ```

4. Run the development server:
   ```
   pnpm dev
   ```

5. Access the application at `http://localhost:5173`.

## Contributing
Contributions are welcome! Please follow the guidelines in the repository for submitting pull requests and issues.

## License
This project is licensed under the MIT License. See the LICENSE file for details.