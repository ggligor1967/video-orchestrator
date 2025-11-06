# Frontend Security Implementation

## Overview

This document describes the security measures implemented in the Video Orchestrator frontend (Tauri + Svelte application).

## Input Sanitization

### Text Input Sanitization (`lib/utils.js`)

All user text inputs are sanitized before being sent to the backend API:

```javascript
sanitizeTextInput(text, maxLength = 10000)
```

**Protection against:**
- Control character injection
- Excessive input length (DoS)
- Null byte attacks

**Applied to:**
- Script generation (topic, script text)
- Background suggestions (script, topic)
- Virality score calculation (script)
- TTS generation (text)

### File Upload Validation (`components/tabs/BackgroundTab.svelte`)

Video file uploads are validated using multiple checks:

```javascript
// MIME type validation
hasAllowedMimeType(file.type, ALLOWED_MIME_TYPES)

// Extension validation
hasAllowedExtension(file.name, ALLOWED_EXTENSIONS)

// Size validation
file.size <= MAX_FILE_SIZE (500MB)
```

**Allowed formats:**
- MIME types: `video/mp4`, `video/quicktime`, `video/x-msvideo`, `video/x-matroska`, `video/webm`, `video/mpeg`
- Extensions: `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`, `.mpg`, `.mpeg`

**Protection against:**
- Malicious file upload
- File type confusion attacks
- Resource exhaustion (large files)

## Error Handling

### Development vs. Production Logging

Error logging is environment-aware using the `logError()` utility:

```javascript
logError(message, error)
```

**Behavior:**
- **Development**: Full error details including stack traces logged to console
- **Production**: Only user-friendly error messages logged (no stack traces)

**Benefits:**
- Prevents information disclosure in production
- Maintains debugging capability in development
- Consistent error handling across components

### User-Facing Error Messages

All API errors are translated to user-friendly messages:

```javascript
try {
  // API call
} catch (error) {
  logError("Operation failed:", error);
  addNotification(error.message || "Generic error message", "error");
}
```

## Rate Limiting

### Client-Side Rate Limit Handling (`lib/api.js`)

The API client detects rate limit responses and provides user feedback:

```javascript
hooks: {
  afterResponse: [
    async (request, options, response) => {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
      }
      return response;
    }
  ]
}
```

**Features:**
- Automatic retry with exponential backoff (2 retries)
- Extracts `Retry-After` header for accurate wait times
- Clear user notification when rate limited

## Tauri Security Configuration

### Restrictive Allowlist (`src-tauri/tauri.conf.json`)

The Tauri configuration follows the principle of least privilege:

```json
{
  "allowlist": {
    "all": false  // Deny by default
  }
}
```

### Filesystem Access Control

Filesystem operations are scoped to application-specific directories:

```json
"fs": {
  "scope": [
    "$APPDATA/video-orchestrator/*",   // Application data
    "$DOCUMENT/VideoOrchestrator/*",   // User exports
    "$DESKTOP/VideoOrchestrator/*",    // Shortcuts
    "$DOWNLOAD/VideoOrchestrator/*"    // Downloads
  ]
}
```

**Protection against:**
- Directory traversal attacks
- Unauthorized file access
- System file modification

### HTTP Request Scope

HTTP requests are limited to known endpoints:

```json
"http": {
  "scope": [
    "http://127.0.0.1:4545/*",                          // Backend API (localhost only)
    "https://api.openai.com/*",                         // OpenAI for script generation
    "https://generativelanguage.googleapis.com/*"       // Google Gemini for AI
  ]
}
```

**Protection against:**
- Server-Side Request Forgery (SSRF)
- Data exfiltration
- Unauthorized external requests

### Content Security Policy (CSP)

```json
"csp": "default-src 'self'; connect-src 'self' http://127.0.0.1:4545 https://api.openai.com https://generativelanguage.googleapis.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self'"
```

**Protection against:**
- Cross-Site Scripting (XSS)
- Data injection attacks
- Unauthorized resource loading

## Backend Communication

### API Integration Security

All API calls go through a centralized `ky` instance (`lib/api.js`):

```javascript
const api = ky.create({
  prefixUrl: "http://127.0.0.1:4545",  // Hardcoded localhost only
  timeout: 30000,                       // 30 second timeout
  retry: { limit: 2 }                   // Automatic retry
});
```

**Features:**
- Hardcoded backend URL (no user configuration)
- Request timeout protection
- Automatic retry with backoff
- Centralized error handling

## State Management Security

### Project Context Store (`stores/appStore.js`)

Backend health checking with exponential backoff:

```javascript
// Health check every 15 seconds
HEALTH_CHECK_INTERVAL = 15000

// Retry with exponential backoff
MAX_RETRY_ATTEMPTS = 3
delays: [1000ms, 2000ms, 4000ms]
```

**Protection against:**
- Backend connection issues
- Network instability
- Resource exhaustion from excessive polling

## Best Practices

### Input Validation Checklist

When adding new user input fields:

1. ✅ Apply `sanitizeTextInput()` for text inputs
2. ✅ Use `hasAllowedExtension()` for file uploads
3. ✅ Use `hasAllowedMimeType()` for file uploads
4. ✅ Validate file size before upload
5. ✅ Use `logError()` for error handling
6. ✅ Provide user-friendly error messages

### Error Handling Checklist

When adding new API calls:

1. ✅ Wrap in try-catch block
2. ✅ Use `logError()` instead of `console.error()`
3. ✅ Extract user-friendly message from error
4. ✅ Use `addNotification()` for user feedback
5. ✅ Handle rate limit responses gracefully

### File Operation Checklist

When adding new file operations:

1. ✅ Verify path is within Tauri scope
2. ✅ Sanitize filenames using `sanitizeFilename()`
3. ✅ Validate file types and extensions
4. ✅ Check file sizes before processing
5. ✅ Clean up temporary files after use

## Security Testing

### Manual Testing Scenarios

1. **Input Validation**
   - Try uploading non-video files
   - Try entering extremely long text (>10,000 characters)
   - Try special characters in filenames

2. **Rate Limiting**
   - Make rapid AI generation requests
   - Verify rate limit notification appears
   - Verify `Retry-After` time is shown

3. **Error Handling**
   - Disconnect backend and trigger operations
   - Check error messages are user-friendly
   - Verify no stack traces in production

4. **File Operations**
   - Try path traversal in filenames (`../../etc/passwd`)
   - Try files larger than 500MB
   - Try invalid video formats

## Incident Response

### Security Issue Reporting

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Contact the development team privately
3. Provide detailed reproduction steps
4. Wait for security patch before disclosure

### Common Vulnerabilities to Monitor

1. **XSS via User Input**
   - Always sanitize text before API calls
   - Never use `{@html}` with user input in Svelte

2. **Path Traversal**
   - Always validate file paths
   - Use Tauri's scoped filesystem

3. **Information Disclosure**
   - Use `logError()` in all components
   - Never log sensitive data (API keys, tokens)

4. **Resource Exhaustion**
   - Enforce file size limits
   - Respect rate limits
   - Clean up temporary files

## References

- [Tauri Security Best Practices](https://tauri.app/v1/references/architecture/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Svelte Security Guide](https://svelte.dev/docs#template-syntax-html)
- [ky HTTP Client](https://github.com/sindresorhus/ky)

## Updates

- **2025-01-27**: Initial security implementation
  - Added input sanitization utilities
  - Enhanced file upload validation
  - Implemented rate limit handling
  - Added development/production error logging
  - Documented Tauri security configuration
