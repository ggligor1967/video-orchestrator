# Contributing to Video Orchestrator

Thank you for your interest in contributing to Video Orchestrator! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **pnpm 8+** - Package manager
- **Rust** - For Tauri desktop app
- **Git** - Version control

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/video-orchestrator.git
cd video-orchestrator

# Install dependencies
pnpm install

# Build shared packages
pnpm --filter @video-orchestrator/shared build

# Start development environment
pnpm dev
```

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Follow the coding style guidelines (see below)
- Write tests for new functionality
- Update documentation as needed
- Keep commits atomic and well-described

### 3. Test Your Changes

```bash
# Run all tests
pnpm test:all

# Run specific test suites
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Check linting
pnpm lint

# Build to ensure no errors
pnpm build
```

### 4. Commit Your Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat(ui): add background blending feature"
git commit -m "fix(backend): resolve audio sync issue"
git commit -m "docs: update API documentation"
git commit -m "test: add tests for export service"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🎨 Coding Style Guidelines

### General

- Use **2-space indentation** for TypeScript, JavaScript, and Svelte
- Use **camelCase** for functions and variables
- Use **PascalCase** for components and classes
- Use **kebab-case** for file names

### TypeScript/JavaScript

```typescript
// ✅ Good
function calculateTotalDuration(segments: VideoSegment[]): number {
  return segments.reduce((sum, seg) => sum + seg.duration, 0);
}

// ❌ Bad
function calc_total(segs) {
  let total = 0;
  for (let i = 0; i < segs.length; i++) {
    total += segs[i].duration;
  }
  return total;
}
```

### Svelte Components

```svelte
<!-- ✅ Good -->
<script lang="ts">
  import { onMount } from 'svelte';
  import type { VideoProject } from '$lib/types';
  
  export let project: VideoProject;
  
  let isLoading = false;
  
  async function handleExport() {
    isLoading = true;
    // ...
  }
</script>

<button on:click={handleExport} disabled={isLoading}>
  {isLoading ? 'Exporting...' : 'Export Video'}
</button>
```

## 📝 Pull Request Guidelines

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Affected Modules
- [ ] Backend (orchestrator)
- [ ] Frontend (UI)
- [ ] Shared packages
- [ ] Tests
- [ ] Documentation

## Testing
Describe how you tested your changes:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] E2E tests pass (if applicable)

## Screenshots/Videos
(If UI changes) Attach screenshots or short videos

## Checklist
- [ ] Code follows project style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] All tests pass locally
- [ ] No new linting errors
- [ ] Build succeeds
```

### PR Review Process

1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: Maintainers will review your code
3. **Revisions**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

## 🧪 Testing Guidelines

### Writing Tests

```typescript
// Unit test example
import { describe, it, expect } from 'vitest';
import { calculateDuration } from './utils';

describe('calculateDuration', () => {
  it('should calculate total duration correctly', () => {
    const segments = [
      { duration: 10 },
      { duration: 20 },
      { duration: 30 }
    ];
    
    expect(calculateDuration(segments)).toBe(60);
  });
  
  it('should handle empty array', () => {
    expect(calculateDuration([])).toBe(0);
  });
});
```

### Test Coverage

- Aim for **>80% coverage** for new code
- All public APIs should have tests
- Edge cases should be covered
- Integration tests for critical workflows

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Processes video segments and applies effects
 * @param segments - Array of video segments to process
 * @param effects - Effects to apply (blur, brightness, etc.)
 * @returns Promise resolving to processed video path
 * @throws {VideoProcessingError} If FFmpeg fails
 */
async function processVideo(
  segments: VideoSegment[],
  effects: VideoEffect[]
): Promise<string> {
  // Implementation
}
```

### README Updates

When adding features, update:
- Main `README.md` feature list
- Relevant module documentation
- API documentation (if applicable)

## 🐛 Bug Reports

### Before Submitting

1. Check if the bug is already reported
2. Test with latest version
3. Collect debug information

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Node version: [e.g., 18.17.0]
- App version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature related to a problem?**
Clear description of the problem.

**Describe the solution**
What you want to happen.

**Describe alternatives**
Alternative solutions you've considered.

**Additional context**
Screenshots, mockups, or examples.
```

## 🏗️ Architecture Guidelines

### Backend (Express)

- Use dependency injection container
- Follow service-controller pattern
- Validate inputs with Zod schemas
- Handle errors gracefully

```typescript
// Service example
class VideoService {
  constructor(private ffmpegService: FFmpegService) {}
  
  async processVideo(input: VideoInput): Promise<VideoOutput> {
    // Implementation
  }
}
```

### Frontend (Svelte)

- Use stores for state management
- Keep components focused and reusable
- Use TypeScript for type safety
- Follow tab-based architecture

```svelte
<!-- Component example -->
<script lang="ts">
  import { projectStore } from '$stores/appStore';
  
  let isProcessing = false;
</script>
```

### Shared Packages

- Define interfaces in `packages/shared/src/types.ts`
- Define schemas in `packages/shared/src/schemas.ts`
- Export everything from `index.ts`

## 📦 Dependencies

### Adding Dependencies

```bash
# Backend dependency
pnpm --filter @app/orchestrator add package-name

# Frontend dependency
pnpm --filter @app/ui add package-name

# Shared dependency
pnpm --filter @video-orchestrator/shared add package-name

# Workspace root dependency
pnpm add -w package-name
```

### Dependency Guidelines

- **Minimize dependencies** - Only add what's necessary
- **Check licenses** - Ensure compatibility with MIT
- **Check bundle size** - Especially for frontend
- **Update regularly** - Keep dependencies up to date

## 🔒 Security

- **Never commit secrets** or API keys
- Use `.env` files (excluded from Git)
- Sanitize user inputs
- Validate file paths
- Handle errors without exposing internals

## 📞 Getting Help

- **Documentation**: Check `README.md` and module docs
- **Issues**: Search existing issues on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community (if available)

## 🎉 Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project website (when available)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Video Orchestrator! 🚀
