# Contributing to Video Orchestrator

Thank you for your interest in contributing to Video Orchestrator! This document provides guidelines and information for contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/video-orchestrator.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `pytest tests/`
6. Commit your changes: `git commit -m "Add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

```bash
# Install in development mode
pip install -e .

# Install development dependencies
pip install -r requirements-dev.txt

# Install FFmpeg (required for video processing)
# macOS: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
# Windows: Download from https://ffmpeg.org/download.html
```

## Code Style

We follow PEP 8 style guidelines. Format your code with Black:

```bash
pip install black
black video_orchestrator/
```

## Testing

### Running Tests

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest --cov=video_orchestrator tests/

# Run specific test file
pytest tests/test_config.py -v
```

### Writing Tests

- Place tests in the `tests/` directory
- Name test files with `test_` prefix
- Use descriptive test function names
- Follow existing test patterns

Example:
```python
import pytest
from video_orchestrator.utils.file_utils import is_image_file

class TestFileUtils:
    def test_is_image_file(self):
        """Test image file detection."""
        assert is_image_file("test.jpg") is True
        assert is_image_file("test.mp4") is False
```

## Project Structure

```
video-orchestrator/
├── video_orchestrator/     # Main package
│   ├── core/              # Core processing logic
│   ├── ui/                # User interface
│   └── utils/             # Utility functions
├── tests/                 # Test files
├── examples/              # Example scripts
└── docs/                  # Documentation (future)
```

## Areas for Contribution

### High Priority

1. **AI Integration**: Implement actual AI features using OpenAI/Claude APIs
2. **Additional Transitions**: Add more transition effects between clips
3. **Text Overlays**: Add support for captions and text overlays
4. **Filters**: Implement video filters (brightness, contrast, saturation, etc.)
5. **Performance**: Optimize video processing for large files

### Medium Priority

1. **Platform-specific packages**: Create installers for Windows/macOS/Linux
2. **Preview functionality**: Add video preview before export
3. **Templates**: Pre-configured templates for common video types
4. **Effects library**: Additional visual effects and animations
5. **Progress estimation**: Better time remaining estimates

### Nice to Have

1. **Video trimming**: Edit video clips before processing
2. **Multi-language support**: Internationalization (i18n)
3. **Cloud storage**: Direct upload to social media platforms
4. **Collaborative features**: Share projects between users
5. **Plugin system**: Allow custom plugins and extensions

## Code Guidelines

### Python Code

- Use type hints where appropriate
- Write docstrings for all public functions and classes
- Keep functions small and focused (< 50 lines preferred)
- Use descriptive variable names
- Add comments for complex logic

Example:
```python
def resize_to_vertical(self, clip, fill_mode: str = 'fit') -> CompositeVideoClip:
    """Resize clip to vertical format (9:16 aspect ratio).
    
    Args:
        clip: MoviePy video clip
        fill_mode: How to handle aspect ratio ('fit', 'crop', 'blur')
        
    Returns:
        Resized video clip in vertical format
    """
    # Implementation here
```

### UI Code

- Follow Qt best practices
- Keep UI logic separate from business logic
- Use signals/slots for communication
- Handle errors gracefully with user-friendly messages

### Documentation

- Update README.md for major features
- Add usage examples for new features
- Update USAGE.md with detailed instructions
- Include docstrings in code

## Pull Request Guidelines

### Before Submitting

- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No new security vulnerabilities
- [ ] Commit messages are clear and descriptive

### PR Description

Include:
1. What changes were made
2. Why the changes were necessary
3. How to test the changes
4. Screenshots (for UI changes)
5. Related issues (if any)

Example:
```markdown
## Description
Add blur background mode for aspect ratio conversion

## Changes
- Implemented blur filter for background
- Added UI option for blur mode
- Updated tests

## Testing
1. Run `pytest tests/`
2. Test with: `python examples/cli_example.py videos --fill-mode blur`
3. Verify blurred background appears

## Screenshots
[Add screenshot here]

Fixes #123
```

## Reporting Bugs

Use GitHub Issues with:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- System information (OS, Python version)
- Error messages/logs
- Screenshots if applicable

## Feature Requests

Use GitHub Issues with:
- Clear description of the feature
- Use case/motivation
- Example usage (if applicable)
- Willingness to implement (optional)

## Code Review Process

1. Automated checks run on all PRs
2. Maintainer reviews code
3. Feedback addressed by contributor
4. Approved PRs are merged

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn
- Focus on the code, not the person
- Assume good intentions

## Questions?

- Open a GitHub Issue for questions
- Check existing documentation first
- Be specific about your question
- Provide context and examples

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

Thank you for contributing to Video Orchestrator! 🎬
