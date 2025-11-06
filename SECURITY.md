# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. DO NOT Publicly Disclose

- **Do not** open a public GitHub issue
- **Do not** discuss on social media or forums
- **Do not** share details until we've had time to address it

### 2. Report Privately

Send an email to: **security@video-orchestrator.dev** (or create a private security advisory on GitHub)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Next release cycle

### 4. Disclosure Process

1. We confirm the vulnerability
2. We develop and test a fix
3. We prepare a security advisory
4. We release the fix
5. We publish the advisory (with credit to reporter, if desired)

## Security Best Practices

### For Users

#### API Keys and Secrets

```bash
# ✅ Good - Use environment variables
OPENAI_API_KEY=your-key-here
GEMINI_API_KEY=your-key-here

# ❌ Bad - Never hardcode in source files
const apiKey = "sk-xxxxx"; // DO NOT DO THIS
```

#### File Permissions

- Store media files in user directories with restricted permissions
- Don't run the application as administrator unless necessary
- Keep tools and binaries in isolated directories

#### Network Security

- Only enable network features if needed
- Use local processing when possible
- Validate all external API responses

### For Developers

#### Input Validation

```typescript
// ✅ Always validate inputs
const videoInput = videoInputSchema.parse(req.body);

// ✅ Sanitize file paths
const safePath = path.resolve(baseDir, sanitizePath(userInput));

// ❌ Never trust user input directly
fs.readFile(req.body.path); // DANGEROUS
```

#### Path Traversal Prevention

```typescript
// ✅ Good - Validate paths
import { validatePath } from './utils/pathSecurity';

const userPath = req.body.filePath;
if (!validatePath(userPath, allowedBaseDir)) {
  throw new Error('Invalid path');
}

// ❌ Bad - Direct path usage
fs.readFile(req.body.filePath); // VULNERABLE
```

#### Command Injection Prevention

```typescript
// ✅ Good - Use parameterized commands
const args = [
  '-i', sanitizedInput,
  '-vf', `scale=${width}:${height}`,
  sanitizedOutput
];
execFile('ffmpeg', args);

// ❌ Bad - String concatenation
exec(`ffmpeg -i ${userInput}`); // VULNERABLE
```

#### Error Handling

```typescript
// ✅ Good - Don't expose internals
catch (error) {
  logger.error('Internal error', error);
  res.status(500).json({ error: 'Processing failed' });
}

// ❌ Bad - Expose stack traces
catch (error) {
  res.status(500).json({ error: error.stack }); // DANGEROUS
}
```

## Security Features

### Current Implementations

- ✅ **Input Validation**: Zod schemas for all API inputs
- ✅ **Path Security**: Path traversal prevention
- ✅ **Command Sanitization**: Safe FFmpeg command execution
- ✅ **Error Handling**: No internal details exposed
- ✅ **Rate Limiting**: API request throttling
- ✅ **File Type Validation**: Strict MIME type checking
- ✅ **Memory Limits**: Process memory guards
- ✅ **Timeout Protection**: Process timeout handlers

### Security Audit Results

Current security score: **A+** (all critical vulnerabilities resolved)

**Strengths:**
- Path traversal prevention implemented
- Comprehensive input validation with Zod schemas
- Command injection protection for FFmpeg
- Error sanitization (no internal details exposed)
- Rate limiting on all API endpoints
- File type validation with MIME checks
- Memory and timeout guards

**Areas for Improvement:**
- Add authentication for multi-user scenarios
- Implement encryption for sensitive data at rest
- Add integrity checks for external tool binaries
- Enhanced audit logging and monitoring

## Known Security Considerations

### External Tools

The application uses external binaries:
- **FFmpeg** - Video processing
- **Piper** - Text-to-speech
- **Whisper** - Speech-to-text
- **Godot** - Background generation (optional)

**Mitigation:**
- Download from official sources only
- Verify checksums when possible
- Run in isolated processes with timeouts
- Limit file system access

### API Keys

The application may use external APIs:
- OpenAI (for script generation)
- Google Gemini (for script generation)
- Pexels/Pixabay (for stock media)

**Mitigation:**
- Keys stored in `.env` (not committed)
- Keys validated before use
- Rate limiting implemented
- Quota monitoring enabled

### Local File Access

The application accesses local files for:
- Media processing
- Temporary storage
- Cache management
- Export outputs

**Mitigation:**
- Path validation on all operations
- Restricted to user directories
- Cleanup of temporary files
- Size limits enforced

## Security Updates

### Staying Updated

```bash
# Check for dependency vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Check for critical updates
pnpm outdated
```

### Automated Security Checks

- **GitHub Dependabot**: Automatic dependency updates
- **CI/CD Security Scans**: Run on every commit
- **SAST Tools**: Static analysis in pipeline

## Compliance

### Data Privacy

- **No telemetry** by default
- **Local processing** - No data sent to external servers (except AI APIs if configured)
- **User control** - Users control all data storage

### Open Source

- All code is open source (MIT License)
- Dependencies are vetted and documented
- Security audit results are public

## Security Checklist

### Before Release

- [ ] All dependencies updated
- [ ] Security audit passed
- [ ] No hardcoded secrets
- [ ] All inputs validated
- [ ] Error messages sanitized
- [ ] Tests include security scenarios
- [ ] Documentation includes security best practices
- [ ] External tools verified

### For Contributors

- [ ] Code reviewed for security issues
- [ ] No new secrets committed
- [ ] Tests include edge cases
- [ ] Documentation updated
- [ ] No deprecated dependencies added

## Contact

For security concerns: **security@video-orchestrator.dev**

For general issues: [GitHub Issues](https://github.com/YOUR_ORG/video-orchestrator/issues)

---

**Remember**: Security is everyone's responsibility. If you see something, say something! 🔒
