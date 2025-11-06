Windows PowerShell
Copyright (C) Microsoft Corporation. All rights reserved.

Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows

PS D:\playground\Aplicatia> Write-Host "=== RUNNING TESTS - FIX VERIFICATION ===" -ForegroundColor Cyan
=== RUNNING TESTS - FIX VERIFICATION ===
PS D:\playground\Aplicatia> pnpm test:all

> video-orchestrator@1.0.0 test:all D:\playground\Aplicatia
> pnpm test:unit && pnpm test:integration && pnpm test:e2e:api


> video-orchestrator@1.0.0 test:unit D:\playground\Aplicatia
> pnpm --filter @app/orchestrator test


> @app/orchestrator@1.0.0 test D:\playground\Aplicatia\apps\orchestrator
> vitest


 DEV  v4.0.6 D:/playground/Aplicatia/apps/orchestrator

stdout | tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should mark service as unavailable
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.241Z"}
info: Service marked available: tts {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.244Z"}
info: Service marked available: whisper {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.245Z"}

stdout | tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should mark service as unavailable
warn: Service marked unavailable: ai {"cooldownMs":1000,"retryAfter":"2025-11-04T10:29:39.246Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.246Z"}

stdout | tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should mark service as available
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.249Z"}
info: Service marked available: tts {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.249Z"}
info: Service marked available: whisper {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.250Z"}

stdout | tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should mark service as available
warn: Service marked unavailable: ai {"cooldownMs":1000,"retryAfter":"2025-11-04T10:29:39.250Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.251Z"}
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.251Z"}

stdout | tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should allow retry after cooldown period
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.252Z"}
info: Service marked available: tts {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.252Z"}
info: Service marked available: whisper {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.253Z"}

stdout | tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should allow retry after cooldown period
warn: Service marked unavailable: tts {"cooldownMs":1000,"retryAfter":"2025-11-04T10:29:39.254Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.254Z"}

stdout | tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should return status of all services
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
info: Service marked available: tts {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
info: Service marked available: whisper {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should return status of all services
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
warn: Service marked unavailable: tts {"cooldownMs":5000,"retryAfter":"2025-11-04T10:29:44.255Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should execute operation successfully when service available
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should execute operation successfully when service available
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should use fallback when operation fails
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should use fallback when operation fails
error: Service ai operation failed {"error":"Service error","required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
warn: Service marked unavailable: ai {"cooldownMs":300000,"retryAfter":"2025-11-04T10:34:39.255Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
info: Using fallback for ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should throw error when required service fails
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should throw error when required service fails
error: Service ai operation failed {"error":"Service error","required":true,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
warn: Service marked unavailable: ai {"cooldownMs":300000,"retryAfter":"2025-11-04T10:34:39.255Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should skip operation if service is known to be unavailable
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should skip operation if service is known to be unavailable
warn: Service marked unavailable: ai {"cooldownMs":5000,"retryAfter":"2025-11-04T10:29:44.255Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should mark service unavailable after failure
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should mark service unavailable after failure
info: Service tts unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should use custom cooldown period
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should use custom cooldown period
error: Service whisper operation failed {"error":"Service error","required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
warn: Service marked unavailable: whisper {"cooldownMs":2000,"retryAfter":"2025-11-04T10:29:41.255Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}
info: Using fallback for whisper {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.255Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should return null when fallback not provided
info: Service marked available: ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.256Z"}

stdout | tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should return null when fallback not provided
warn: Service marked unavailable: ai {"cooldownMs":5000,"retryAfter":"2025-11-04T10:29:46.256Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.256Z"}
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.256Z"}

stdout | tests/unit/gracefulDegradation.test.js > Fallback Functions > ttsFallback should return fallback response
warn: TTS service unavailable, generating silent audio placeholder {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.256Z"}

stdout | tests/unit/gracefulDegradation.test.js > Fallback Functions > whisperFallback should return empty subtitle template
warn: Whisper service unavailable, returning empty subtitle template {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.256Z"}

stdout | tests/unit/gracefulDegradation.test.js > Fallback Functions > aiServiceFallback should return template script
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.256Z"}

stdout | tests/unit/gracefulDegradation.test.js > Fallback Functions > aiServiceFallback should include topic and genre in response
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.256Z"}

 ❯ tests/unit/gracefulDegradation.test.js (17 tests | 2 failed) 45ms
     ✓ should mark service as unavailable 9ms
     ✓ should mark service as available 3ms
     × should allow retry after cooldown period 13ms
     ✓ should return status of all services 1ms
     ✓ should execute operation successfully when service available 2ms
     ✓ should use fallback when operation fails 2ms
     ✓ should throw error when required service fails 3ms
     ✓ should skip operation if service is known to be unavailable 2ms
     ✓ should mark service unavailable after failure 1ms
     × should use custom cooldown period 2ms
     ✓ should return null when fallback not provided 1ms
     ✓ ttsFallback should return fallback response 1ms
     ✓ whisperFallback should return empty subtitle template 1ms
     ✓ aiServiceFallback should return template script 1ms
     ✓ aiServiceFallback should include topic and genre in response 1ms
     ✓ should export service flag constants 0ms
     ✓ should have unique values for each service 0ms
stdout | tests/audio.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }

stdout | tests/tts.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops

stdout | tests/video.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops

stdout | tests/subs.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: ⚙️  override existing env vars with { override: true }

stdout | tests/health.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }

stdout | tests/ai.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`

 ❯ tests/pathSecurity.test.js (19 tests | 1 failed) 27ms
       ✓ should allow paths within data directory 1ms
       ✓ should allow paths within tmp directory 0ms
       ✓ should reject paths with directory traversal 0ms
       ✓ should reject paths outside allowed directories 0ms
       ✓ should reject paths that escape project root 0ms
       ✓ should remove path separators 0ms
       ✓ should remove null bytes 0ms
       ✓ should replace dangerous characters 0ms
       ✓ should limit filename length 0ms
       ✓ should preserve valid filenames 0ms
       ✓ should accept allowed extensions 0ms
       ✓ should reject disallowed extensions 0ms
       ✓ should be case-insensitive 0ms
       ✓ should create path in tmp directory 0ms
       ✓ should include timestamp and random string 1ms
       ✓ should sanitize prefix 0ms
       ✓ should throw on non-existent file 1ms
       ✓ should throw on unsafe path 0ms
       × should throw on path with invalid characters 17ms
stdout | tests/e2e-pipeline.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops

stdout | tests/health.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:38.994Z"}

stdout | tests/ai.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.002Z"}

stdout | tests/subs.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.004Z"}

stdout | tests/video.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.004Z"}

stdout | tests/tts.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.003Z"}

stdout | tests/audio.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.004Z"}

stdout | tests/e2e-pipeline.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:39.042Z"}

Sourcemap for "D:/playground/Aplicatia/node_modules/.pnpm/node-cron@4.2.1/node_modules/node-cron/dist/esm/node-cron.js" points to missing source files
 ❯ tests/unit/errorResponse.test.js (24 tests | 2 failed) 25ms
       ✓ should create basic error response 5ms
       ✓ should include details when provided 1ms
       ✓ should have ISO timestamp 0ms
       ✓ should send error response with status code 0ms
       ✓ badRequest should return 400 0ms
       ✓ invalidInput should include field info 0ms
       ✓ missingField should include field name 0ms
       ✓ notFound should return 404 0ms
       ✓ forbidden should return 403 0ms
       ✓ pathTraversal should include attempted path 0ms
       ✓ internalError should return 500 0ms
       ✓ serviceError should include service name 0ms
       ✓ ffmpegError should include command details 0ms
       ✓ rateLimitExceeded should return 429 0ms
       × should format Zod validation errors 12ms
       × should handle nested field paths 2ms
       ✓ should catch async errors and call next 0ms
       ✓ should not call next if no error 0ms
       ✓ should have unique error codes 0ms
       ✓ should have uppercase snake_case codes 0ms
       ✓ all error responses should have success: false 0ms
       ✓ all error responses should have error.code 0ms
       ✓ all error responses should have error.message 0ms
       ✓ all error responses should have timestamp 0ms
 ❯ tests/unit/paths.test.js (27 tests | 1 failed) 26ms
       ✓ should have all required path keys 3ms
       ✓ should have consistent root structure 0ms
       ✓ should have tools paths configured 0ms
       ✓ should return path for valid key 0ms
       ✓ should return path with subpaths appended 0ms
       ✓ should handle multiple subpath segments 0ms
       ✓ should throw error for invalid key 2ms
       ✓ should work with all valid keys 4ms
       ✓ should return relative path from project root 1ms
       ✓ should handle nested paths 0ms
       ✓ should work with subpath notation 0ms
       ✓ should allow paths within specified directories 1ms
       ✓ should allow paths in exports directory 0ms
       ✓ should reject paths outside allowed directories 0ms
       ✓ should reject path traversal attempts 0ms
       ✓ should handle multiple allowed keys 0ms
       ✓ should reject invalid keys gracefully 0ms
       ✓ should handle Windows paths correctly 0ms
       ✓ should return all configured paths 0ms
       ✓ should return a copy of paths object 0ms
       ✓ should have all expected keys 0ms
       ✓ should have data paths under dataRoot 0ms
       ✓ should have tool paths under tools root 0ms
       ✓ should have cache subdirectories under cache 0ms
       ✓ should not have duplicate or conflicting paths 0ms
       ✓ should use correct path separators 1ms
       × should handle absolute paths correctly 7ms
 ❯ tests/unit/logSanitization.test.js (20 tests | 1 failed) 19ms
       ✓ should redact API keys with api_key pattern 3ms
       × should redact Bearer tokens 10ms
       ✓ should redact OpenAI API keys (sk_ pattern) 1ms
       ✓ should redact Gemini API keys (AI pattern) 0ms
       ✓ should redact GitHub tokens (ghp_ pattern) 0ms
       ✓ should redact password fields 0ms
       ✓ should redact secret fields 0ms
       ✓ should redact token fields 0ms
       ✓ should redact credit card numbers 0ms
       ✓ should redact credit card numbers without dashes 0ms
       ✓ should remove newline characters 0ms
       ✓ should remove carriage return characters 0ms
       ✓ should remove tab characters 0ms
       ✓ should sanitize objects with sensitive fields 0ms
       ✓ should redact multiple sensitive values in same message 0ms
       ✓ should preserve non-sensitive data 0ms
       ✓ should handle null values 0ms
       ✓ should handle undefined values 0ms
       ✓ should handle empty strings 0ms
       ✓ should handle numbers 0ms
stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline
info: Cleanup service started {"interval":"60min","maxAge":"1440min","service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.729Z"}
info: Development mode: Memory optimizer running in passive mode {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.730Z"}
info: Memory monitoring started {"interval":"30s","service":"video-orchestrator","thresholds":{"critical":85,"emergency":95,"warning":70},"timestamp":"2025-11-04T10:29:40.731Z"}
info: Performance monitoring started {"logInterval":"60s","service":"video-orchestrator","thresholds":{"cpu":80,"errorRate":5,"memory":85,"queueDepth":100},"timestamp":"2025-11-04T10:29:40.733Z","window":"60s"}
info: Marketplace initialized with seed templates {"count":3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.751Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline
info: Stock media cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\stock-videos","service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.766Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline
info: Caption styling cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\styled-subtitles","service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.766Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline
info: Template directory initialized {"service":"video-orchestrator","templatesDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\templates","timestamp":"2025-11-04T10:29:40.767Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate a complete story script
info: Brand kit directories initialized {"assetsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\assets","brandsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands","configDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\configs","service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.779Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate a complete story script
info: Generating script {"duration":30,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:40.812Z","topic":"haunted lighthouse"}

stdout | tests/video.test.js
info: Cleanup service started {"interval":"60min","maxAge":"1440min","service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.968Z"}
info: Development mode: Memory optimizer running in passive mode {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.968Z"}
info: Memory monitoring started {"interval":"30s","service":"video-orchestrator","thresholds":{"critical":85,"emergency":95,"warning":70},"timestamp":"2025-11-04T10:29:40.969Z"}
info: Performance monitoring started {"logInterval":"60s","service":"video-orchestrator","thresholds":{"cpu":80,"errorRate":5,"memory":85,"queueDepth":100},"timestamp":"2025-11-04T10:29:40.970Z","window":"60s"}
info: Marketplace initialized with seed templates {"count":3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:40.985Z"}

stdout | tests/video.test.js
info: Stock media cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\stock-videos","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.004Z"}

stdout | tests/video.test.js
info: Caption styling cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\styled-subtitles","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.004Z"}

stdout | tests/video.test.js
info: Template directory initialized {"service":"video-orchestrator","templatesDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\templates","timestamp":"2025-11-04T10:29:41.006Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should validate required fields
info: Brand kit directories initialized {"assetsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\assets","brandsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands","configDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\configs","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.020Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should validate required fields
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "inputPath"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/video/crop","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.051Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should validate required fields
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/crop HTTP/1.1" 400 273 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.056Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should validate aspect ratio enum
error: Unhandled error [   {     "code": "invalid_value",     "values": [       "9:16",       "16:9",       "1:1",       "4:5"     ],     "path": [       "aspectRatio"     ],     "message": "Invalid option: expected one of \"9:16\"|\"16:9\"|\"1:1\"|\"4:5\""   } ] {"method":"POST","path":"/video/crop","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.074Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should validate aspect ratio enum
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/crop HTTP/1.1" 400 291 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.075Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should accept valid crop request
info: Processing video crop request {"aspectRatio":"9:16","focusPoint":"center","inputPath":"data/assets/backgrounds/test-video.mp4","service":"video-orchestrator","smartCrop":false,"timestamp":"2025-11-04T10:29:41.085Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should accept valid crop request
error: Crop to vertical failed {"error":"The \"path\" argument must be of type string or an instance of Buffer or URL. Received an instance of Object","inputPath":{"aspectRatio":"9:16","focusPoint":"center","inputPath":"data/assets/backgrounds/test-video.mp4","outputPath":"data/cache/video/cropped.mp4","smartCrop":false},"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.086Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should accept valid crop request
error: Unhandled error Failed to crop video: The "path" argument must be of type string or an instance of Buffer or URL. Received an instance of Object {"method":"POST","path":"/video/crop","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.087Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should accept valid crop request
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/crop HTTP/1.1" 500 261 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.090Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
info: Processing video crop request {"aspectRatio":"9:16","focusPoint":"center","inputPath":"data/assets/backgrounds/test.mp4","service":"video-orchestrator","smartCrop":false,"timestamp":"2025-11-04T10:29:41.105Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
error: Crop to vertical failed {"error":"The \"path\" argument must be of type string or an instance of Buffer or URL. Received an instance of Object","inputPath":{"aspectRatio":"9:16","focusPoint":"center","inputPath":"data/assets/backgrounds/test.mp4","outputPath":"data/cache/video/crop-9-16.mp4","smartCrop":false},"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.106Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
error: Unhandled error Failed to crop video: The "path" argument must be of type string or an instance of Buffer or URL. Received an instance of Object {"method":"POST","path":"/video/crop","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.107Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/crop HTTP/1.1" 500 261 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.110Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
info: Processing video crop request {"aspectRatio":"16:9","focusPoint":"center","inputPath":"data/assets/backgrounds/test.mp4","service":"video-orchestrator","smartCrop":false,"timestamp":"2025-11-04T10:29:41.125Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
error: Crop to vertical failed {"error":"The \"path\" argument must be of type string or an instance of Buffer or URL. Received an instance of Object","inputPath":{"aspectRatio":"16:9","focusPoint":"center","inputPath":"data/assets/backgrounds/test.mp4","outputPath":"data/cache/video/crop-16-9.mp4","smartCrop":false},"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.126Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
error: Unhandled error Failed to crop video: The "path" argument must be of type string or an instance of Buffer or URL. Received an instance of Object {"method":"POST","path":"/video/crop","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.127Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/crop HTTP/1.1" 500 261 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.128Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
info: Processing video crop request {"aspectRatio":"1:1","focusPoint":"center","inputPath":"data/assets/backgrounds/test.mp4","service":"video-orchestrator","smartCrop":false,"timestamp":"2025-11-04T10:29:41.139Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
error: Crop to vertical failed {"error":"The \"path\" argument must be of type string or an instance of Buffer or URL. Received an instance of Object","inputPath":{"aspectRatio":"1:1","focusPoint":"center","inputPath":"data/assets/backgrounds/test.mp4","outputPath":"data/cache/video/crop-1-1.mp4","smartCrop":false},"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.140Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
error: Unhandled error Failed to crop video: The "path" argument must be of type string or an instance of Buffer or URL. Received an instance of Object {"method":"POST","path":"/video/crop","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.140Z"}

stdout | tests/audio.test.js
info: Cleanup service started {"interval":"60min","maxAge":"1440min","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.108Z"}
info: Development mode: Memory optimizer running in passive mode {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.111Z"}
info: Memory monitoring started {"interval":"30s","service":"video-orchestrator","thresholds":{"critical":85,"emergency":95,"warning":70},"timestamp":"2025-11-04T10:29:41.111Z"}
info: Performance monitoring started {"logInterval":"60s","service":"video-orchestrator","thresholds":{"cpu":80,"errorRate":5,"memory":85,"queueDepth":100},"timestamp":"2025-11-04T10:29:41.115Z","window":"60s"}
info: Marketplace initialized with seed templates {"count":3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.141Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/crop HTTP/1.1" 500 261 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.142Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
info: Processing video crop request {"aspectRatio":"4:5","focusPoint":"center","inputPath":"data/assets/backgrounds/test.mp4","service":"video-orchestrator","smartCrop":false,"timestamp":"2025-11-04T10:29:41.152Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
error: Crop to vertical failed {"error":"The \"path\" argument must be of type string or an instance of Buffer or URL. Received an instance of Object","inputPath":{"aspectRatio":"4:5","focusPoint":"center","inputPath":"data/assets/backgrounds/test.mp4","outputPath":"data/cache/video/crop-4-5.mp4","smartCrop":false},"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.153Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
error: Unhandled error Failed to crop video: The "path" argument must be of type string or an instance of Buffer or URL. Received an instance of Object {"method":"POST","path":"/video/crop","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.153Z"}

stdout | tests/audio.test.js
info: Stock media cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\stock-videos","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.180Z"}

stdout | tests/ai.test.js
info: Cleanup service started {"interval":"60min","maxAge":"1440min","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.151Z"}
info: Development mode: Memory optimizer running in passive mode {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.151Z"}
info: Memory monitoring started {"interval":"30s","service":"video-orchestrator","thresholds":{"critical":85,"emergency":95,"warning":70},"timestamp":"2025-11-04T10:29:41.151Z"}
info: Performance monitoring started {"logInterval":"60s","service":"video-orchestrator","thresholds":{"cpu":80,"errorRate":5,"memory":85,"queueDepth":100},"timestamp":"2025-11-04T10:29:41.154Z","window":"60s"}
info: Marketplace initialized with seed templates {"count":3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.177Z"}

stdout | tests/health.test.js
info: Cleanup service started {"interval":"60min","maxAge":"1440min","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.150Z"}
info: Development mode: Memory optimizer running in passive mode {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.151Z"}
info: Memory monitoring started {"interval":"30s","service":"video-orchestrator","thresholds":{"critical":85,"emergency":95,"warning":70},"timestamp":"2025-11-04T10:29:41.152Z"}
info: Performance monitoring started {"logInterval":"60s","service":"video-orchestrator","thresholds":{"cpu":80,"errorRate":5,"memory":85,"queueDepth":100},"timestamp":"2025-11-04T10:29:41.154Z","window":"60s"}
info: Marketplace initialized with seed templates {"count":3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.180Z"}

stdout | tests/subs.test.js
info: Cleanup service started {"interval":"60min","maxAge":"1440min","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.154Z"}
info: Development mode: Memory optimizer running in passive mode {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.155Z"}
info: Memory monitoring started {"interval":"30s","service":"video-orchestrator","thresholds":{"critical":85,"emergency":95,"warning":70},"timestamp":"2025-11-04T10:29:41.156Z"}
info: Performance monitoring started {"logInterval":"60s","service":"video-orchestrator","thresholds":{"cpu":80,"errorRate":5,"memory":85,"queueDepth":100},"timestamp":"2025-11-04T10:29:41.159Z","window":"60s"}
info: Marketplace initialized with seed templates {"count":3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.182Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/crop > should support all valid aspect ratios
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/crop HTTP/1.1" 500 261 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.155Z"}

stdout | tests/audio.test.js
info: Template directory initialized {"service":"video-orchestrator","templatesDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\templates","timestamp":"2025-11-04T10:29:41.182Z"}

stdout | tests/tts.test.js
info: Cleanup service started {"interval":"60min","maxAge":"1440min","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.151Z"}
info: Development mode: Memory optimizer running in passive mode {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.152Z"}
info: Memory monitoring started {"interval":"30s","service":"video-orchestrator","thresholds":{"critical":85,"emergency":95,"warning":70},"timestamp":"2025-11-04T10:29:41.152Z"}
info: Performance monitoring started {"logInterval":"60s","service":"video-orchestrator","thresholds":{"cpu":80,"errorRate":5,"memory":85,"queueDepth":100},"timestamp":"2025-11-04T10:29:41.155Z","window":"60s"}
info: Marketplace initialized with seed templates {"count":3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.181Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/auto-reframe > should validate required fields
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "inputPath"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/video/auto-reframe","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.166Z"}

stdout | tests/audio.test.js
info: Caption styling cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\styled-subtitles","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.183Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/auto-reframe > should validate required fields
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/auto-reframe HTTP/1.1" 400 281 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.168Z"}

stdout | tests/audio.test.js
info: Brand kit directories initialized {"assetsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\assets","brandsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands","configDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\configs","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.186Z"}

stdout | tests/ai.test.js
info: Caption styling cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\styled-subtitles","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.206Z"}

stdout | tests/subs.test.js
info: Stock media cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\stock-videos","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.210Z"}

stdout | tests/health.test.js
info: Stock media cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\stock-videos","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.214Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/auto-reframe > should accept valid reframe request
info: Processing auto-reframe request {"detectionMode":"face","inputPath":"data/assets/backgrounds/test.mp4","service":"video-orchestrator","targetAspect":"9:16","timestamp":"2025-11-04T10:29:41.183Z"}
error: Unhandled error videoService.autoReframe is not a function {"method":"POST","path":"/video/auto-reframe","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.184Z"}

stdout | tests/ai.test.js
info: Stock media cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\stock-videos","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.207Z"}

stdout | tests/subs.test.js
info: Caption styling cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\styled-subtitles","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.211Z"}

stdout | tests/health.test.js
info: Caption styling cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\styled-subtitles","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.215Z"}

stdout | tests/tts.test.js
info: Caption styling cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\styled-subtitles","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.220Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/auto-reframe > should accept valid reframe request
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/auto-reframe HTTP/1.1" 500 181 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.187Z"}

stdout | tests/ai.test.js
info: Template directory initialized {"service":"video-orchestrator","templatesDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\templates","timestamp":"2025-11-04T10:29:41.208Z"}

stdout | tests/subs.test.js
info: Template directory initialized {"service":"video-orchestrator","templatesDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\templates","timestamp":"2025-11-04T10:29:41.213Z"}

stdout | tests/health.test.js
info: Template directory initialized {"service":"video-orchestrator","templatesDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\templates","timestamp":"2025-11-04T10:29:41.216Z"}

stdout | tests/tts.test.js
info: Stock media cache directory initialized {"cacheDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache\\stock-videos","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.221Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/speed-ramp > should validate required fields
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "inputPath"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "number",     "code": "invalid_type",     "path": [       "endTime"     ],     "message": "Invalid input: expected number, received undefined"   } ] {"method":"POST","path":"/video/speed-ramp","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.201Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should validate required fields
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voiceover"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "backgroundMusic"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "array",     "code": "invalid_type",     "path": [       "soundEffects"     ],     "message": "Invalid input: expected array, received undefined"   },   {     "expected": "object",     "code": "invalid_type",     "path": [       "settings"     ],     "message": "Invalid input: expected object, received undefined"   } ] {"method":"POST","path":"/audio/normalize","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.257Z"}

stdout | tests/ai.test.js
info: Brand kit directories initialized {"assetsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\assets","brandsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands","configDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\configs","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.212Z"}

stdout | tests/subs.test.js
info: Brand kit directories initialized {"assetsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\assets","brandsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands","configDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\configs","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.216Z"}

stdout | tests/health.test.js
info: Brand kit directories initialized {"assetsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\assets","brandsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands","configDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\configs","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.219Z"}

stdout | tests/tts.test.js
info: Template directory initialized {"service":"video-orchestrator","templatesDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\templates","timestamp":"2025-11-04T10:29:41.222Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/speed-ramp > should validate required fields
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/speed-ramp HTTP/1.1" 400 384 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.203Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should validate required fields
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/normalize HTTP/1.1" 400 606 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.265Z"}

stdout | tests/tts.test.js
info: Brand kit directories initialized {"assetsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\assets","brandsDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands","configDir":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\brands\\configs","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.227Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/speed-ramp > should validate speed multiplier range
error: Unhandled error [   {     "origin": "number",     "code": "too_big",     "maximum": 3,     "inclusive": true,     "path": [       "speedMultiplier"     ],     "message": "Too big: expected number to be <=3"   } ] {"method":"POST","path":"/video/speed-ramp","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.215Z"}

stdout | tests/health.test.js > Health Endpoint > GET /health > should return 200 OK with health status
info: Verifying external tools availability {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.256Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/speed-ramp > should validate speed multiplier range
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:41.216Z","type":"errorRate","value":"100.00%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/speed-ramp HTTP/1.1" 400 264 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.217Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should generate script with valid input
info: Generating script {"duration":60,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:41.296Z","topic":"haunted mansion mystery"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with default settings
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voiceover"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "backgroundMusic"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "array",     "code": "invalid_type",     "path": [       "soundEffects"     ],     "message": "Invalid input: expected array, received undefined"   },   {     "expected": "object",     "code": "invalid_type",     "path": [       "settings"     ],     "message": "Invalid input: expected object, received undefined"   } ] {"method":"POST","path":"/audio/normalize","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.300Z"}

stdout | tests/subs.test.js > Subtitles API > POST /subs/generate should create a valid SRT file
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "audioPath"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/subs/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.295Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with default settings
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/normalize HTTP/1.1" 400 606 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.302Z"}

stdout | tests/subs.test.js > Subtitles API > POST /subs/generate should create a valid SRT file
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /subs/generate HTTP/1.1" 400 276 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.305Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/speed-ramp > should accept valid speed ramp request
info: Processing speed ramp request {"endTime":10,"inputPath":"data/assets/backgrounds/test.mp4","service":"video-orchestrator","speedMultiplier":1.5,"startTime":2,"timestamp":"2025-11-04T10:29:41.229Z"}
error: Unhandled error videoService.applySpeedRamp is not a function {"method":"POST","path":"/video/speed-ramp","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.229Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should validate required fields
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "text"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.320Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/speed-ramp > should accept valid speed ramp request
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/speed-ramp HTTP/1.1" 500 182 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.231Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with custom LUFS target
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voiceover"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "backgroundMusic"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "array",     "code": "invalid_type",     "path": [       "soundEffects"     ],     "message": "Invalid input: expected array, received undefined"   },   {     "expected": "object",     "code": "invalid_type",     "path": [       "settings"     ],     "message": "Invalid input: expected object, received undefined"   } ] {"method":"POST","path":"/audio/normalize","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.322Z"}

stdout | tests/subs.test.js > Subtitles API > POST /subs/format should convert SRT to VTT
info: Processing subtitle formatting request {"format":"vtt","service":"video-orchestrator","subtitleId":"test-format-1762252181322","timestamp":"2025-11-04T10:29:41.336Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should validate required fields
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 373 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.327Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/speed-ramp > should validate start time before end time
error: Unhandled error [   {     "code": "custom",     "path": [       "endTime"     ],     "message": "End time must be greater than start time"   } ] {"method":"POST","path":"/video/speed-ramp","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.244Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with custom LUFS target
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/normalize HTTP/1.1" 400 606 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.324Z"}

stdout | tests/subs.test.js > Subtitles API > POST /subs/format should convert SRT to VTT
error: Subtitle formatting failed {"error":"The \"path\" argument must be of type string or an instance of Buffer or URL. Received an instance of Object","service":"video-orchestrator","subtitlePath":{"format":"vtt","subtitleId":"test-format-1762252181322"},"timestamp":"2025-11-04T10:29:41.338Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept valid TTS request with default settings
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.354Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/speed-ramp > should validate start time before end time
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/speed-ramp HTTP/1.1" 400 261 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.246Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with peak limiting
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voiceover"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "backgroundMusic"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "array",     "code": "invalid_type",     "path": [       "soundEffects"     ],     "message": "Invalid input: expected array, received undefined"   },   {     "expected": "object",     "code": "invalid_type",     "path": [       "settings"     ],     "message": "Invalid input: expected object, received undefined"   } ] {"method":"POST","path":"/audio/normalize","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.337Z"}

stdout | tests/subs.test.js > Subtitles API > POST /subs/format should convert SRT to VTT
error: Unhandled error Failed to format subtitles: The "path" argument must be of type string or an instance of Buffer or URL. Received an instance of Object {"method":"POST","path":"/subs/format","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.339Z"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /subs/format HTTP/1.1" 500 268 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.341Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept valid TTS request with default settings
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.356Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/merge-audio > should validate required fields
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "videoPath"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "audioPath"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/video/merge-audio","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.261Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with peak limiting
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/normalize HTTP/1.1" 400 606 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.340Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/merge-audio > should validate required fields
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/merge-audio HTTP/1.1" 400 387 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.263Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should validate LUFS target range
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voiceover"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "backgroundMusic"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "expected": "array",     "code": "invalid_type",     "path": [       "soundEffects"     ],     "message": "Invalid input: expected array, received undefined"   },   {     "expected": "object",     "code": "invalid_type",     "path": [       "settings"     ],     "message": "Invalid input: expected object, received undefined"   } ] {"method":"POST","path":"/audio/normalize","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.354Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept TTS request with custom voice
info: Processing TTS generation request {"service":"video-orchestrator","speed":1,"textLength":31,"timestamp":"2025-11-04T10:29:41.374Z","voice":"en_US-amy-medium"}
error: Unhandled error ttsService.generateSpeech is not a function {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.374Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/merge-audio > should accept valid merge request
info: Processing video-audio merge request {"audioPath":"data/tts/voice-001.wav","audioVolume":1,"musicVolume":0.3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.277Z","videoPath":"data/cache/video/cropped.mp4"}
error: Unhandled error videoService.mergeWithAudio is not a function {"method":"POST","path":"/video/merge-audio","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.278Z"}

 ❯ tests/subs.test.js (2 tests | 2 failed) 129ms
     × POST /subs/generate should create a valid SRT file 92ms
     × POST /subs/format should convert SRT to VTT 23ms
stdout | tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should validate LUFS target range
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/normalize HTTP/1.1" 400 606 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.356Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept TTS request with custom voice
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 500 176 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.377Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/merge-audio > should accept valid merge request
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/merge-audio HTTP/1.1" 500 183 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.280Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should validate required fields
error: Unhandled error [   {     "expected": "array",     "code": "invalid_type",     "path": [       "tracks"     ],     "message": "Invalid input: expected array, received undefined"   } ] {"method":"POST","path":"/audio/mix","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.372Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept TTS request with speed adjustment
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.391Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/merge-audio > should validate audio volume range
error: Unhandled error [   {     "origin": "number",     "code": "too_big",     "maximum": 2,     "inclusive": true,     "path": [       "audioVolume"     ],     "message": "Too big: expected number to be <=2"   } ] {"method":"POST","path":"/video/merge-audio","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.292Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should validate required fields
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/mix HTTP/1.1" 400 268 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.374Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept TTS request with speed adjustment
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.393Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/merge-audio > should validate audio volume range
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/merge-audio HTTP/1.1" 400 261 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.294Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept valid mix request with two tracks
info: Processing audio mix request {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.389Z","trackCount":2,"tracks":[{"fadeIn":0,"fadeOut":0,"path":"data/tts/voice-001.wav","type":"background","volume":1},{"fadeIn":0,"fadeOut":0,"path":"data/assets/audio/bg-music.mp3","type":"background","volume":0.3}]}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should validate text length limits
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.403Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/merge-audio > should support optional background music
info: Processing video-audio merge request {"audioPath":"data/tts/voice-001.wav","audioVolume":1,"backgroundMusicPath":"data/assets/audio/bg-music.mp3","musicVolume":0.3,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.306Z","videoPath":"data/cache/video/cropped.mp4"}
error: Unhandled error videoService.mergeWithAudio is not a function {"method":"POST","path":"/video/merge-audio","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.307Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate a complete story script
error: Operation failed after all retries {"attempts":1,"code":"invalid_api_key","error":"401 Incorrect API key provided: sk-proj-********************************************************************_COM. You can find your API key at https://platform.openai.com/account/api-keys.","operation":"OpenAI Script Generation","service":"video-orchestrator","status":401,"timestamp":"2025-11-04T10:29:41.444Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept valid mix request with two tracks
error: Error mixing audio {"error":"ENOENT: no such file or directory, access 'D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\tts\\voice-001.wav'","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.391Z","trackCount":2}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should validate text length limits
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.405Z"}

stdout | tests/video.test.js > Video Processing Module > POST /video/merge-audio > should support optional background music
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /video/merge-audio HTTP/1.1" 500 183 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.309Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate a complete story script
warn: OpenAI failed, trying Gemini {"error":"401 Incorrect API key provided: sk-proj-********************************************************************_COM. You can find your API key at https://platform.openai.com/account/api-keys.","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.445Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept valid mix request with two tracks
error: Unhandled error Failed to mix audio: ENOENT: no such file or directory, access 'D:\playground\Aplicatia\apps\orchestrator\data\tts\voice-001.wav' {"method":"POST","path":"/audio/mix","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.391Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should reject empty text
error: Unhandled error [   {     "origin": "string",     "code": "too_small",     "minimum": 1,     "inclusive": true,     "path": [       "text"     ],     "message": "Text is required"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.416Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept valid mix request with two tracks
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/mix HTTP/1.1" 500 266 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.393Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should reject empty text
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 336 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.417Z"}

stdout | tests/video.test.js > Video Processing Module > GET /video/info > should validate required video path
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.324Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept mix request with multiple tracks
info: Processing audio mix request {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.403Z","trackCount":4,"tracks":[{"fadeIn":0,"fadeOut":0,"path":"data/tts/voice-001.wav","type":"background","volume":1},{"fadeIn":0,"fadeOut":0,"path":"data/tts/voice-002.wav","type":"background","volume":1},{"fadeIn":0,"fadeOut":0,"path":"data/assets/audio/bg-music.mp3","type":"background","volume":0.2},{"fadeIn":0,"fadeOut":0,"path":"data/assets/audio/sfx-whoosh.wav","type":"background","volume":0.8}]}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should handle special characters in text
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.425Z"}

stdout | tests/video.test.js > Video Processing Module > GET /video/info > should validate required video path
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /video/info HTTP/1.1" 500 233 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.326Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept mix request with multiple tracks
error: Error mixing audio {"error":"ENOENT: no such file or directory, access 'D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\tts\\voice-001.wav'","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.404Z","trackCount":4}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should handle special characters in text
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.427Z"}

stdout | tests/video.test.js > Video Processing Module > GET /video/info > should return 404 for non-existent video
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.341Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept mix request with multiple tracks
error: Unhandled error Failed to mix audio: ENOENT: no such file or directory, access 'D:\playground\Aplicatia\apps\orchestrator\data\tts\voice-001.wav' {"method":"POST","path":"/audio/mix","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.405Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should validate speed range
error: Unhandled error [   {     "origin": "number",     "code": "too_big",     "maximum": 3,     "inclusive": true,     "path": [       "speed"     ],     "message": "Too big: expected number to be <=3"   },   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.436Z"}

stdout | tests/video.test.js > Video Processing Module > GET /video/info > should return 404 for non-existent video
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /video/info?path=data%2Fnonexistent%2Fvideo.mp4 HTTP/1.1" 500 269 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.343Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept mix request with multiple tracks
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/mix HTTP/1.1" 500 266 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.406Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should validate speed range
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 353 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.438Z"}

stdout | tests/video.test.js > Video Processing Module > GET /video/info > should accept valid video info request
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.360Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept TTS with SSML markup
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.449Z"}

stdout | tests/video.test.js > Video Processing Module > GET /video/info > should accept valid video info request
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /video/info?path=data%2Fassets%2Fbackgrounds%2Ftest.mp4 HTTP/1.1" 500 277 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.362Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should validate track volume range
error: Unhandled error [   {     "origin": "number",     "code": "too_big",     "maximum": 2,     "inclusive": true,     "path": [       "tracks",       0,       "volume"     ],     "message": "Too big: expected number to be <=2"   } ] {"method":"POST","path":"/audio/mix","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.417Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept TTS with SSML markup
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.452Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should validate track volume range
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/mix HTTP/1.1" 400 257 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.419Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should support different output formats
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.465Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should validate minimum number of tracks
error: Unhandled error [   {     "origin": "array",     "code": "too_small",     "minimum": 1,     "inclusive": true,     "path": [       "tracks"     ],     "message": "At least 1 audio track required"   } ] {"method":"POST","path":"/audio/mix","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.428Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should support different output formats
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.467Z"}

 ❯ tests/video.test.js (17 tests | 1 failed) 358ms
       ✓ should validate required fields 56ms
       ✓ should validate aspect ratio enum 12ms
       ✓ should accept valid crop request 16ms
       ✓ should support all valid aspect ratios 65ms
       ✓ should validate required fields 12ms
       ✓ should accept valid reframe request 20ms
       ✓ should validate required fields 14ms
       ✓ should validate speed multiplier range 14ms
       ✓ should accept valid speed ramp request 16ms
       ✓ should validate start time before end time 14ms
       ✓ should validate required fields 19ms
       ✓ should accept valid merge request 14ms
       ✓ should validate audio volume range 14ms
       ✓ should support optional background music 14ms
       × should validate required video path 18ms
       ✓ should return 404 for non-existent video 16ms
       ✓ should accept valid video info request 19ms
stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should validate minimum number of tracks
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/mix HTTP/1.1" 400 247 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.430Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept mix with fade in/out effects
info: Processing audio mix request {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.440Z","trackCount":1,"tracks":[{"fadeIn":2,"fadeOut":3,"path":"data/assets/audio/bg-music.mp3","type":"background","volume":0.5}]}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should support different output formats
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.478Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept mix with fade in/out effects
error: Error mixing audio {"error":"ENOENT: no such file or directory, access 'D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets\\audio\\bg-music.mp3'","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.440Z","trackCount":1}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should support different output formats
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:41.481Z","type":"errorRate","value":"100.00%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.481Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept mix with fade in/out effects
error: Unhandled error Failed to mix audio: ENOENT: no such file or directory, access 'D:\playground\Aplicatia\apps\orchestrator\data\assets\audio\bg-music.mp3' {"method":"POST","path":"/audio/mix","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.441Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should support different output formats
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "voice"     ],     "message": "Invalid input: expected string, received undefined"   } ] {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:41.491Z"}

stdout | tests/audio.test.js > Audio Processing Module > POST /audio/mix > should accept mix with fade in/out effects
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:41.442Z","type":"errorRate","value":"100.00%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /audio/mix HTTP/1.1" 500 275 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.443Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should support different output formats
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /tts/generate HTTP/1.1" 400 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.492Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should validate required audio path
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.453Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > GET /tts/voices > should return list of available voices
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:41.502Z","type":"errorRate","value":"92.31%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /tts/voices HTTP/1.1" 200 259 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.502Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should validate required audio path
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /audio/info HTTP/1.1" 500 233 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.455Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > GET /tts/voices > should support filtering by language
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:41.515Z","type":"errorRate","value":"85.71%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /tts/voices?language=en_US HTTP/1.1" 200 259 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.515Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should return 404 for non-existent audio file
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.470Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > GET /tts/voices > should support filtering by gender
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:41.525Z","type":"errorRate","value":"80.00%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /tts/voices?gender=female HTTP/1.1" 200 259 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.525Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should return 404 for non-existent audio file
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /audio/info?path=data%2Fnonexistent%2Faudio.wav HTTP/1.1" 500 269 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.472Z"}

stdout | tests/tts.test.js > TTS (Text-to-Speech) Module > GET /tts/voices > should return voice details with quality info
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:41.536Z","type":"errorRate","value":"75.00%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /tts/voices HTTP/1.1" 200 259 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.536Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should accept valid audio info request
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.484Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should accept valid audio info request
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /audio/info?path=data%2Ftts%2Fvoice-001.wav HTTP/1.1" 500 265 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.486Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should support multiple audio formats
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.498Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should support multiple audio formats
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /audio/info?path=data%2Fassets%2Faudio%2Ftest.wav HTTP/1.1" 500 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.500Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should support multiple audio formats
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.511Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should support multiple audio formats
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /audio/info?path=data%2Fassets%2Faudio%2Ftest.mp3 HTTP/1.1" 500 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.512Z"}

 ❯ tests/tts.test.js (14 tests | 1 failed) 290ms
       ✓ should validate required fields 89ms
       × should accept valid TTS request with default settings 25ms
       ✓ should accept TTS request with custom voice 19ms
       ✓ should accept TTS request with speed adjustment 12ms
       ✓ should validate text length limits 13ms
       ✓ should reject empty text 11ms
       ✓ should handle special characters in text 9ms
       ✓ should validate speed range 11ms
       ✓ should accept TTS with SSML markup 16ms
       ✓ should support different output formats 39ms
       ✓ should return list of available voices 10ms
       ✓ should support filtering by language 12ms
       ✓ should support filtering by gender 10ms
       ✓ should return voice details with quality info 12ms
stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should support multiple audio formats
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.524Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should support multiple audio formats
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /audio/info?path=data%2Fassets%2Faudio%2Ftest.aac HTTP/1.1" 500 271 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.525Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should support multiple audio formats
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:41.536Z"}

stdout | tests/audio.test.js > Audio Processing Module > GET /audio/info > should support multiple audio formats
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /audio/info?path=data%2Fassets%2Faudio%2Ftest.flac HTTP/1.1" 500 272 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.538Z"}

 ❯ tests/audio.test.js (15 tests | 5 failed) 348ms
       × should validate required fields 90ms
       × should accept valid normalize request with default settings 21ms
       × should accept valid normalize request with custom LUFS target 22ms
       × should accept valid normalize request with peak limiting 15ms
       ✓ should validate LUFS target range 17ms
       ✓ should validate required fields 17ms
       ✓ should accept valid mix request with two tracks 17ms
       ✓ should accept mix request with multiple tracks 13ms
       ✓ should validate track volume range 13ms
       ✓ should validate minimum number of tracks 11ms
       ✓ should accept mix with fade in/out effects 12ms
       × should validate required audio path 13ms
       ✓ should return 404 for non-existent audio file 16ms
       ✓ should accept valid audio info request 15ms
       ✓ should support multiple audio formats 52ms
stdout | tests/health.test.js > Health Endpoint > GET /health > should return 200 OK with health status
info: Tool verification complete {"available":0,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.582Z","total":4}

stdout | tests/health.test.js > Health Endpoint > GET /health > should return 200 OK with health status
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /health HTTP/1.1" 200 401 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.586Z"}

stdout | tests/health.test.js > Health Endpoint > GET /health > should return consistent timestamp format
info: Verifying external tools availability {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.600Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should generate script with valid input
error: Operation failed after all retries {"attempts":1,"code":"invalid_api_key","error":"401 Incorrect API key provided: sk-proj-********************************************************************_COM. You can find your API key at https://platform.openai.com/account/api-keys.","operation":"OpenAI Script Generation","service":"video-orchestrator","status":401,"timestamp":"2025-11-04T10:29:41.825Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should generate script with valid input
warn: OpenAI failed, trying Gemini {"error":"401 Incorrect API key provided: sk-proj-********************************************************************_COM. You can find your API key at https://platform.openai.com/account/api-keys.","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.825Z"}

stdout | tests/health.test.js > Health Endpoint > GET /health > should return consistent timestamp format
info: Tool verification complete {"available":0,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.854Z","total":4}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate a complete story script
error: Operation failed after all retries {"attempts":1,"error":"[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: [400 Bad Request] API key not valid. Please pass a valid API key. [{\"@type\":\"type.googleapis.com/google.rpc.ErrorInfo\",\"reason\":\"API_KEY_INVALID\",\"domain\":\"googleapis.com\",\"metadata\":{\"service\":\"generativelanguage.googleapis.com\"}},{\"@type\":\"type.googleapis.com/google.rpc.LocalizedMessage\",\"locale\":\"en-US\",\"message\":\"API key not valid. Please pass a valid API key.\"}]","operation":"Gemini Script Generation","service":"video-orchestrator","status":400,"timestamp":"2025-11-04T10:29:41.855Z"}

stdout | tests/health.test.js > Health Endpoint > GET /health > should return consistent timestamp format
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /health HTTP/1.1" 200 401 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.856Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate a complete story script
error: Service ai operation failed {"error":"[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: [400 Bad Request] API key not valid. Please pass a valid API key. [{\"@type\":\"type.googleapis.com/google.rpc.ErrorInfo\",\"reason\":\"API_KEY_INVALID\",\"domain\":\"googleapis.com\",\"metadata\":{\"service\":\"generativelanguage.googleapis.com\"}},{\"@type\":\"type.googleapis.com/google.rpc.LocalizedMessage\",\"locale\":\"en-US\",\"message\":\"API key not valid. Please pass a valid API key.\"}]","required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.856Z"}
warn: Service marked unavailable: ai {"cooldownMs":300000,"retryAfter":"2025-11-04T10:34:41.857Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.857Z"}
info: Using fallback for ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.857Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.857Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate a complete story script
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /ai/script HTTP/1.1" 200 690 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.861Z"}

stdout | tests/health.test.js > Health Endpoint > GET /health > should return uptime as a number
info: Verifying external tools availability {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.866Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: Generating script {"duration":15,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:41.883Z","topic":"abandoned hospital"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.883Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.883Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /ai/script HTTP/1.1" 200 690 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.884Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: Generating script {"duration":15,"genre":"mystery","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:41.893Z","topic":"abandoned hospital"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.894Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.894Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /ai/script HTTP/1.1" 200 693 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.895Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: Generating script {"duration":15,"genre":"paranormal","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:41.905Z","topic":"abandoned hospital"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.905Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.905Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /ai/script HTTP/1.1" 200 702 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.906Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: Generating script {"duration":15,"genre":"true crime","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:41.915Z","topic":"abandoned hospital"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.916Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.916Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 1: Script Generation > should generate scripts with different genres
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "POST /ai/script HTTP/1.1" 200 702 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.917Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\2b963b01-036b-42f0-9917-ef96c45a3e23.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.935Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 2b963b01-036b-42f0-9917-ef96c45a3e23.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.936Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\3dce23c9-ebdb-43cc-9935-cc9b378a473e.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.940Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 3dce23c9-ebdb-43cc-9935-cc9b378a473e.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.940Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\5846c478-ab8d-4ac1-aab4-652bac7c736b.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.943Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 5846c478-ab8d-4ac1-aab4-652bac7c736b.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.943Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\638632b1-da3a-4a43-9d6d-41d53b11e001.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.946Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 638632b1-da3a-4a43-9d6d-41d53b11e001.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.947Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\6ec5fbda-cdab-496a-9c07-ebd5d045b459.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.950Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 6ec5fbda-cdab-496a-9c07-ebd5d045b459.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.950Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should retry on retryable errors
warn: Operation failed, retrying... {"attempt":1,"error":"ETIMEDOUT","maxRetries":3,"nextRetryIn":"100ms","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.945Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\7164b5fd-bc42-41f9-9aef-c9a18d8f5a5d.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.952Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 7164b5fd-bc42-41f9-9aef-c9a18d8f5a5d.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.953Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should retry on retryable errors
warn: Operation failed, retrying... {"attempt":2,"error":"ECONNREFUSED","maxRetries":3,"nextRetryIn":"200ms","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.045Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\768fdb78-338d-4673-bd9e-3d3d32f28530.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.956Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 768fdb78-338d-4673-bd9e-3d3d32f28530.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.956Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should retry on retryable errors
info: Operation succeeded after 2 retries {"attempt":2,"operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.245Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\7bfb58bf-06a7-4c30-a257-f2d63d34aee4.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.959Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should throw after exhausting all retries
warn: Operation failed, retrying... {"attempt":1,"error":"ETIMEDOUT","maxRetries":2,"nextRetryIn":"100ms","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.958Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 7bfb58bf-06a7-4c30-a257-f2d63d34aee4.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.959Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should throw after exhausting all retries
warn: Operation failed, retrying... {"attempt":2,"error":"ETIMEDOUT","maxRetries":2,"nextRetryIn":"200ms","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.058Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\7fe0a460-a2d6-4de5-b63f-90d7cc33c8c2.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.961Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should throw after exhausting all retries
error: Operation failed after all retries {"attempts":3,"error":"ETIMEDOUT","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.258Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 7fe0a460-a2d6-4de5-b63f-90d7cc33c8c2.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.962Z"}

(node:31844) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 6)
(Use `node --trace-warnings ...` to show where the warning was created)
stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\90cc8b16-0a8c-4a8a-acd0-9ad80e89d198.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.965Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should not retry on non-retryable errors
error: Operation failed after all retries {"attempts":1,"error":"Invalid input","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.968Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for 90cc8b16-0a8c-4a8a-acd0-9ad80e89d198.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.965Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should retry on retryable status codes
warn: Operation failed, retrying... {"attempt":1,"error":"Server error","maxRetries":2,"nextRetryIn":"100ms","operation":"unknown","service":"video-orchestrator","status":503,"timestamp":"2025-11-04T10:29:41.969Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\a75949e5-81ae-4489-b1aa-a99d2281270b.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.968Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should retry on retryable status codes
info: Operation succeeded after 1 retries {"attempt":1,"operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.069Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for a75949e5-81ae-4489-b1aa-a99d2281270b.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.968Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should apply exponential backoff correctly
warn: Operation failed, retrying... {"attempt":1,"error":"ETIMEDOUT","maxRetries":3,"nextRetryIn":"100ms","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.971Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\c05c6f27-1c11-43d6-96fb-b93aa2b51123.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.971Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should apply exponential backoff correctly
warn: Operation failed, retrying... {"attempt":2,"error":"ETIMEDOUT","maxRetries":3,"nextRetryIn":"200ms","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.071Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for c05c6f27-1c11-43d6-96fb-b93aa2b51123.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.972Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should apply exponential backoff correctly
info: Operation succeeded after 2 retries {"attempt":2,"operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.271Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\c194936b-5e62-4359-9449-811d2ebac216.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.975Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should respect maxDelay cap
warn: Operation failed, retrying... {"attempt":1,"error":"ETIMEDOUT","maxRetries":2,"nextRetryIn":"1000ms","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.975Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for c194936b-5e62-4359-9449-811d2ebac216.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.976Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should respect maxDelay cap
info: Operation succeeded after 1 retries {"attempt":1,"operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.975Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\d3391272-484c-494b-8452-4078d8a83e66.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.978Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should call onRetry callback
warn: Operation failed, retrying... {"attempt":1,"error":"ETIMEDOUT","maxRetries":2,"nextRetryIn":"100ms","operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.976Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for d3391272-484c-494b-8452-4078d8a83e66.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.978Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should call onRetry callback
info: Operation succeeded after 1 retries {"attempt":1,"operation":"unknown","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.076Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\e2c81127-a5cc-4939-a0c5-414c0088c762.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.982Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should use preset configurations correctly
warn: Operation failed, retrying... {"attempt":1,"error":"rate_limit_exceeded","maxRetries":3,"nextRetryIn":"600ms","operation":"AI Service","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.982Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for e2c81127-a5cc-4939-a0c5-414c0088c762.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.983Z"}

stdout | tests/unit/retryHandler.test.js > retryWithBackoff > should use preset configurations correctly
info: Operation succeeded after 1 retries {"attempt":1,"operation":"AI Service","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.582Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\e5cf384d-e867-4d46-b204-d7f9ea6bf0a0.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.985Z"}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should open after failure threshold
error: Circuit breaker test opened after 3 failures {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.985Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for e5cf384d-e867-4d46-b204-d7f9ea6bf0a0.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.985Z"}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should reject requests when OPEN
error: Circuit breaker test opened after 2 failures {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.986Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\f81f1074-11c8-4c22-b8b3-7fd3e015c9b3.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.988Z"}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should transition to HALF_OPEN after timeout
error: Circuit breaker test opened after 2 failures {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.986Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for f81f1074-11c8-4c22-b8b3-7fd3e015c9b3.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.988Z"}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should transition to HALF_OPEN after timeout
info: Circuit breaker test entering HALF_OPEN state {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.986Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
error: Error getting video info {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","inputPath":"D:\\playground\\Aplicatia\\data\\assets\\backgrounds\\ead890f2-b91e-477e-868d-a43d8de29194.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.991Z"}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should close after success threshold in HALF_OPEN
error: Circuit breaker test opened after 2 failures {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.989Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
warn: Could not get video info for ead890f2-b91e-477e-868d-a43d8de29194.mp4 {"error":"spawn D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe ENOENT","service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.992Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should list available background videos
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:41 +0000] "GET /assets/backgrounds HTTP/1.1" 200 - "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:41.996Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should get video info for background
error: Error in path validation middleware {"error":"Cannot read properties of undefined (reading 'inputPath')","service":"video-orchestrator","stack":"TypeError: Cannot read properties of undefined (reading 'inputPath')\n    at D:/playground/Aplicatia/apps/orchestrator/src/middleware/validatePath.js:75:21\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:157:13)\n    at Route.dispatch (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\route.js:117:3)\n    at handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:435:11)\n    at Layer.handleRequest (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\lib\\layer.js:152:17)\n    at D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:295:15\n    at processParams (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:582:12)\n    at next (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:291:5)\n    at Function.handle (D:\\playground\\Aplicatia\\node_modules\\.pnpm\\router@2.2.0\\node_modules\\router\\index.js:186:3)","timestamp":"2025-11-04T10:29:42.012Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 2: Background Video > should get video info for background
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /video/info?path=%2Fstatic%2Fassets%2Fbackgrounds%2Fe5cf384d-e867-4d46-b204-d7f9ea6bf0a0.mp4 HTTP/1.1" 500 314 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.016Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 3: Text-to-Speech Generation > should generate voice-over from script
info: Processing TTS generation request {"service":"video-orchestrator","speed":1,"textLength":168,"timestamp":"2025-11-04T10:29:42.027Z","voice":"en_US-lessac-medium"}
error: Unhandled error ttsService.generateSpeech is not a function {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:42.028Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 3: Text-to-Speech Generation > should generate voice-over from script
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /tts/generate HTTP/1.1" 500 176 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.030Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 3: Text-to-Speech Generation > should list available voices
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /tts/voices HTTP/1.1" 200 259 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.046Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 3: Text-to-Speech Generation > should support different speech speeds
info: Processing TTS generation request {"service":"video-orchestrator","speed":0.8,"textLength":31,"timestamp":"2025-11-04T10:29:42.062Z","voice":"en_US-lessac-medium"}
error: Unhandled error ttsService.generateSpeech is not a function {"method":"POST","path":"/tts/generate","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:42.063Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 3: Text-to-Speech Generation > should support different speech speeds
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /tts/generate HTTP/1.1" 500 176 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.065Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 7: Batch Processing > should list batch jobs
info: Getting all batch jobs {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.076Z"}
error: Unhandled error batchService.getAllBatchJobs is not a function {"method":"GET","path":"/batch","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:42.077Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 7: Batch Processing > should list batch jobs
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.078Z","type":"errorRate","value":"36.36%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /batch HTTP/1.1" 500 172 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.079Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 8: Scheduler > should list scheduled jobs
info: Getting all scheduled posts {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.087Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 8: Scheduler > should list scheduled jobs
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.089Z","type":"errorRate","value":"33.33%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /scheduler HTTP/1.1" 200 46 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.089Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Integration: Cross-Module Communication > should validate file paths across all endpoints
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\exports","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\tts","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\subs"],"field":"outputPath","ip":"::ffff:127.0.0.1","requestedPath":"../../../etc/passwd","resolvedPath":"d:\\playground\\etc\\passwd","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.100Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Integration: Cross-Module Communication > should validate file paths across all endpoints
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.102Z","type":"errorRate","value":"38.46%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /tts/generate HTTP/1.1" 403 301 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.102Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Integration: Cross-Module Communication > should validate file paths across all endpoints
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\exports","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\tts","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\subs"],"field":"outputPath","ip":"::ffff:127.0.0.1","requestedPath":"..\\..\\..\\windows\\system32","resolvedPath":"d:\\playground\\windows\\system32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.112Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Integration: Cross-Module Communication > should validate file paths across all endpoints
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.115Z","type":"errorRate","value":"42.86%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /tts/generate HTTP/1.1" 403 301 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.115Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Integration: Cross-Module Communication > should validate file paths across all endpoints
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\exports","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\tts","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\subs"],"field":"outputPath","ip":"::ffff:127.0.0.1","requestedPath":"data/../../../sensitive.txt","resolvedPath":"d:\\playground\\aplicatia\\sensitive.txt","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.127Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Integration: Cross-Module Communication > should validate file paths across all endpoints
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.129Z","type":"errorRate","value":"46.67%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /tts/generate HTTP/1.1" 403 301 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.129Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should complete script generation within 5 seconds
info: Generating script {"duration":15,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.139Z","topic":"quick test"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should complete script generation within 5 seconds
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.140Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.140Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should complete script generation within 5 seconds
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.141Z","type":"errorRate","value":"43.75%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 658 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.141Z"}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should close after success threshold in HALF_OPEN
info: Circuit breaker test entering HALF_OPEN state {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.144Z"}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should close after success threshold in HALF_OPEN
info: Circuit breaker test recovered to CLOSED state {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.145Z"}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should reset manually
error: Circuit breaker test opened after 2 failures {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.146Z"}

stdout | tests/health.test.js > Health Endpoint > GET /health > should return uptime as a number
info: Tool verification complete {"available":0,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.153Z","total":4}

stdout | tests/unit/retryHandler.test.js > CircuitBreaker > should reset manually
info: Circuit breaker test manually reset {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.147Z"}

stdout | tests/health.test.js > Health Endpoint > GET /health > should return uptime as a number
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /health HTTP/1.1" 200 401 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.156Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Generating script {"duration":15,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.156Z","topic":"concurrent test 0"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.157Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.157Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.158Z","type":"errorRate","value":"41.18%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 685 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.159Z"}

 ✓ tests/unit/retryHandler.test.js (15 tests) 210ms
stdout | tests/health.test.js > Health Endpoint > GET /health > should include tools status
info: Verifying external tools availability {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.166Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Generating script {"duration":15,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.161Z","topic":"concurrent test 1"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.162Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.162Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 685 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.164Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Generating script {"duration":15,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.166Z","topic":"concurrent test 2"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.166Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.166Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should generate script with valid input
error: Operation failed after all retries {"attempts":1,"error":"[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: [400 Bad Request] API key not valid. Please pass a valid API key. [{\"@type\":\"type.googleapis.com/google.rpc.ErrorInfo\",\"reason\":\"API_KEY_INVALID\",\"domain\":\"googleapis.com\",\"metadata\":{\"service\":\"generativelanguage.googleapis.com\"}},{\"@type\":\"type.googleapis.com/google.rpc.LocalizedMessage\",\"locale\":\"en-US\",\"message\":\"API key not valid. Please pass a valid API key.\"}]","operation":"Gemini Script Generation","service":"video-orchestrator","status":400,"timestamp":"2025-11-04T10:29:42.229Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 685 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.167Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should generate script with valid input
error: Service ai operation failed {"error":"[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: [400 Bad Request] API key not valid. Please pass a valid API key. [{\"@type\":\"type.googleapis.com/google.rpc.ErrorInfo\",\"reason\":\"API_KEY_INVALID\",\"domain\":\"googleapis.com\",\"metadata\":{\"service\":\"generativelanguage.googleapis.com\"}},{\"@type\":\"type.googleapis.com/google.rpc.LocalizedMessage\",\"locale\":\"en-US\",\"message\":\"API key not valid. Please pass a valid API key.\"}]","required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.230Z"}
warn: Service marked unavailable: ai {"cooldownMs":300000,"retryAfter":"2025-11-04T10:34:42.230Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.230Z"}
info: Using fallback for ai {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.230Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.231Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Generating script {"duration":15,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.169Z","topic":"concurrent test 4"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should generate script with valid input
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 709 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.236Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.169Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.170Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.171Z","type":"errorRate","value":"35.00%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 685 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.172Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Generating script {"duration":15,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.174Z","topic":"concurrent test 3"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.174Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.174Z"}

stdout | tests/e2e-pipeline.test.js > End-to-End Pipeline > Performance: Pipeline Timing > should handle concurrent requests
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 685 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.176Z"}

 ❯ tests/e2e-pipeline.test.js (23 tests | 4 failed) 1461ms
       ✓ should generate a complete story script  1105ms
       ✓ should generate scripts with different genres 47ms
       ✓ should list available background videos 79ms
       ✓ should get video info for background 18ms
       × should generate voice-over from script 19ms
       ✓ should list available voices 12ms
       × should support different speech speeds 19ms
       ✓ should generate subtitles from audio 0ms
       ✓ should support different subtitle formats 0ms
       ✓ should export final video with all components 0ms
       ✓ should support different export platforms 0ms
       ✓ should execute full pipeline via /pipeline/build endpoint 0ms
       ✓ should validate pipeline input parameters 0ms
       ✓ should handle pipeline errors gracefully 0ms
       ✓ should accept batch job submission 0ms
       × should list batch jobs 11ms
       ✓ should create scheduled job 0ms
       ✓ should list scheduled jobs 10ms
       × should maintain state across pipeline steps 1ms
       ✓ should handle errors in pipeline gracefully 0ms
       ✓ should validate file paths across all endpoints 39ms
       ✓ should complete script generation within 5 seconds 12ms
       ✓ should handle concurrent requests 40ms
stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should validate required fields
error: Unhandled error [   {     "expected": "string",     "code": "invalid_type",     "path": [       "topic"     ],     "message": "Invalid input: expected string, received undefined"   },   {     "code": "invalid_value",     "values": [       "horror",       "mystery",       "paranormal",       "true crime"     ],     "path": [       "genre"     ],     "message": "Invalid option: expected one of \"horror\"|\"mystery\"|\"paranormal\"|\"true crime\""   } ] {"method":"POST","path":"/ai/script","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:42.264Z"}

stdout | tests/validatePath.test.js > Security Middleware - Path Validation > validatePath middleware > should block paths outside allowed directories
warn: Invalid file type detected {"extension":".sys","field":"inputPath","ip":"127.0.0.1","requestedPath":"C:/Windows/System32/config.sys","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.258Z","userAgent":"test-user-agent"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should validate required fields
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 400 406 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.266Z"}

stdout | tests/validatePath.test.js > Security Middleware - Path Validation > validatePath middleware > should block path traversal attempts with ../
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets"],"field":"inputPath","ip":"127.0.0.1","requestedPath":"data/assets/../../etc/passwd","resolvedPath":"d:\\playground\\aplicatia\\apps\\orchestrator\\etc\\passwd","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.266Z","userAgent":"test-user-agent"}

stdout | tests/validatePath.test.js > Security Middleware - Path Validation > validatePath middleware > should block if any path is invalid
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache"],"field":"outputPath","ip":"127.0.0.1","requestedPath":"/etc/passwd","resolvedPath":"d:\\etc\\passwd","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.268Z","userAgent":"test-user-agent"}

stdout | tests/unit/trendMonitoringService.test.js > TrendMonitoringService > getTrendingTopics > should return trending topics for a given genre
info: Service marked available: undefined {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.279Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should validate genre enum
error: Unhandled error [   {     "code": "invalid_value",     "values": [       "horror",       "mystery",       "paranormal",       "true crime"     ],     "path": [       "genre"     ],     "message": "Invalid option: expected one of \"horror\"|\"mystery\"|\"paranormal\"|\"true crime\""   } ] {"method":"POST","path":"/ai/script","service":"video-orchestrator","status":500,"timestamp":"2025-11-04T10:29:42.284Z"}

stdout | tests/validatePath.test.js > Security Middleware - Path Validation > validatePath middleware > should block array with invalid path
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets"],"field":"tracks[1].path","ip":"127.0.0.1","requestedPath":"/etc/passwd","resolvedPath":"d:\\etc\\passwd","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.272Z","userAgent":"test-user-agent"}

stdout | tests/unit/trendMonitoringService.test.js > TrendMonitoringService > getTrendingTopics > should return different trends for different genres
info: Service marked available: undefined {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.289Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should validate genre enum
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 400 303 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.286Z"}

stdout | tests/validatePath.test.js > Security Middleware - Path Validation > validatePath middleware > should validate URL parameters with paths
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets"],"field":"params.id","ip":"127.0.0.1","requestedPath":"data/assets/../../../etc/passwd","resolvedPath":"d:\\playground\\aplicatia\\apps\\etc\\passwd","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.274Z","userAgent":"test-user-agent"}

stdout | tests/unit/trendMonitoringService.test.js > TrendMonitoringService > getTrendingTopics > should return different trends for different genres
info: Service marked available: undefined {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.295Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: Generating script {"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.301Z","topic":"test story"}

stdout | tests/validatePath.test.js > Security Middleware - Path Validation > validatePath middleware > should provide helpful error details
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets","D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\cache"],"field":"inputPath","ip":"127.0.0.1","requestedPath":"/invalid/path.mp4","resolvedPath":"d:\\invalid\\path.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.277Z","userAgent":"test-user-agent"}

stdout | tests/unit/trendMonitoringService.test.js > TrendMonitoringService > getTrendingTopics > should limit the number of returned trends
info: Service marked available: undefined {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.302Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.302Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.302Z"}

stdout | tests/validatePath.test.js > Security Middleware - Path Validation > Pre-configured validators > validateDataPath should block non-data paths
warn: Invalid file type detected {"extension":".js","field":"inputPath","ip":"127.0.0.1","requestedPath":"D:\\playground\\Aplicatia\\apps\\orchestrator\\src\\server.js","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.280Z","userAgent":"test-user-agent"}

stdout | tests/unit/trendMonitoringService.test.js > TrendMonitoringService > suggestTrendBasedScripts > should generate scripts based on trending topics
info: Service marked available: undefined {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.305Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 658 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.304Z"}

 ✓ tests/rateLimiting.test.js (5 tests) 1323ms
     ✓ should reset after window expires  1157ms
stdout | tests/validatePath.test.js > Security Middleware - Path Validation > createStrictValidator > should block even allowed data paths if not in strict list
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\exports"],"field":"inputPath","ip":"127.0.0.1","requestedPath":"D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets\\video.mp4","resolvedPath":"d:\\playground\\aplicatia\\apps\\orchestrator\\data\\assets\\video.mp4","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.282Z","userAgent":"test-user-agent"}

stdout | tests/unit/trendMonitoringService.test.js > TrendMonitoringService > suggestTrendBasedScripts > should handle empty trends array with fallback
error: Service undefined operation failed {"error":"No trending topics provided","required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.307Z"}
warn: Service marked unavailable: undefined {"cooldownMs":300000,"retryAfter":"2025-11-04T10:34:42.308Z","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.308Z"}
info: Using fallback for undefined {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.309Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: Generating script {"genre":"mystery","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.319Z","topic":"test story"}

stdout | tests/validatePath.test.js > Security Middleware - Path Validation > Security logging > should log path traversal attempts
warn: Path traversal attempt detected {"allowedDirs":["D:\\playground\\Aplicatia\\apps\\orchestrator\\data\\assets"],"field":"inputPath","ip":"192.168.1.100","requestedPath":"data/assets/../../etc/passwd","resolvedPath":"d:\\playground\\aplicatia\\apps\\orchestrator\\etc\\passwd","service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.286Z","userAgent":"test-user-agent"}

stdout | tests/unit/trendMonitoringService.test.js > TrendMonitoringService > getTrendAlerts > should return trend alerts based on preferences
info: Service undefined unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.312Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.320Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.320Z"}

 ✓ tests/unit/serviceDependencyValidator.test.js (32 tests) 20ms
stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 661 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.322Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: Generating script {"genre":"paranormal","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.335Z","topic":"test story"}

 ✓ tests/validatePath.test.js (29 tests) 42ms
 ✓ tests/unit/trendMonitoringService.test.js (8 tests) 49ms
stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.336Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.336Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 670 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.337Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: Generating script {"genre":"true crime","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.350Z","topic":"test story"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.351Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.351Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should accept all valid genres
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 670 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.352Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should handle duration parameter
info: Generating script {"duration":90,"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.367Z","topic":"ghost story"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should handle duration parameter
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.367Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.367Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should handle duration parameter
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 662 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.369Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should return hooks array with at least one hook
info: Generating script {"genre":"mystery","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.384Z","topic":"mysterious disappearance"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should return hooks array with at least one hook
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.385Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.385Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should return hooks array with at least one hook
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 717 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.388Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should return hashtags array with at least one hashtag
info: Generating script {"genre":"paranormal","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.402Z","topic":"paranormal investigation"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should return hashtags array with at least one hashtag
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.402Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.402Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should return hashtags array with at least one hashtag
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 726 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.404Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should handle special characters in topic
info: Generating script {"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.415Z","topic":"The Haunted House on \"Elm Street\" & other stories"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should handle special characters in topic
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.416Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.416Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should handle special characters in topic
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.417Z","type":"errorRate","value":"18.18%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 815 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.418Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should reject extremely long topics
info: Generating script {"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.428Z","topic":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should reject extremely long topics
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.428Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.428Z"}

stdout | tests/ai.test.js > AI Script Generation > POST /ai/script > should reject extremely long topics
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.432Z","type":"errorRate","value":"16.67%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 - "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.432Z"}

stdout | tests/ai.test.js > AI Service Error Handling > should handle network errors gracefully
info: Generating script {"genre":"horror","service":"video-orchestrator","style":"story","timestamp":"2025-11-04T10:29:42.447Z","topic":"test story"}

stdout | tests/ai.test.js > AI Service Error Handling > should handle network errors gracefully
info: Service ai unavailable, using fallback {"required":false,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.448Z"}
warn: AI service unavailable, returning template script {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.448Z"}

stdout | tests/ai.test.js > AI Service Error Handling > should handle network errors gracefully
warn: Performance alert triggered {"service":"video-orchestrator","threshold":5,"timestamp":"2025-11-04T10:29:42.449Z","type":"errorRate","value":"15.38%"}
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "POST /ai/script HTTP/1.1" 200 658 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.450Z"}

 ❯ tests/ai.test.js (10 tests | 1 failed) 1229ms
       ✓ should generate script with valid input  1024ms
       ✓ should validate required fields 22ms
       ✓ should validate genre enum 19ms
       ✓ should accept all valid genres 66ms
       ✓ should handle duration parameter 17ms
       ✓ should return hooks array with at least one hook 19ms
       ✓ should return hashtags array with at least one hashtag 16ms
       ✓ should handle special characters in topic 12ms
       × should reject extremely long topics 17ms
     ✓ should handle network errors gracefully 15ms
stdout | tests/health.test.js > Health Endpoint > GET /health > should include tools status
info: Tool verification complete {"available":0,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.508Z","total":4}

stdout | tests/health.test.js > Health Endpoint > GET /health > should include tools status
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /health HTTP/1.1" 200 401 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.510Z"}

stdout | tests/health.test.js > Root Endpoint > GET / > should return API information
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET / HTTP/1.1" 200 829 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.520Z"}

stdout | tests/health.test.js > Root Endpoint > GET / > should include endpoints documentation
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET / HTTP/1.1" 200 829 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.530Z"}

stdout | tests/health.test.js > 404 Handler > should return 404 for unknown routes
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /nonexistent-endpoint HTTP/1.1" 404 156 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.539Z"}

stdout | tests/health.test.js > 404 Handler > should return 404 for unknown API routes
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /api/does-not-exist HTTP/1.1" 404 154 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.548Z"}

stdout | tests/health.test.js > CORS Configuration > should include CORS headers for allowed origins
info: Verifying external tools availability {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.556Z"}

 ✓ tests/unit/pagination.test.js (19 tests) 9ms
stdout | tests/health.test.js > CORS Configuration > should include CORS headers for allowed origins
info: Tool verification complete {"available":0,"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.795Z","total":4}

stdout | tests/health.test.js > CORS Configuration > should include CORS headers for allowed origins
info: ::ffff:127.0.0.1 - - [04/Nov/2025:10:29:42 +0000] "GET /health HTTP/1.1" 200 401 "-" "-" {"service":"video-orchestrator","timestamp":"2025-11-04T10:29:42.797Z"}

 ❯ tests/health.test.js (10 tests | 1 failed) 1585ms
       × should return 200 OK with health status 368ms
       ✓ should return consistent timestamp format 265ms
       ✓ should return uptime as a number 300ms
       ✓ should include tools status  353ms
       ✓ should return API information 12ms
       ✓ should include endpoints documentation 9ms
     ✓ should return 404 for unknown routes 9ms
     ✓ should return 404 for unknown API routes 8ms
     ✓ should include CORS headers for allowed origins 248ms
     ✓ should handle OPTIONS preflight requests 9ms
stdout | tests/integration/pagination.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops

stdout | tests/unit/audioMixing.test.js
[dotenv@17.2.3] injecting env (12) from .env -- tip: 🔐 prevent committing .env to code: https://dotenvx.com/precommit

stdout | tests/integration/pagination.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:43.249Z"}

stdout | tests/unit/audioMixing.test.js
info: FFmpeg paths configured {"ffmpeg":"../../tools/ffmpeg/bin/ffmpeg.exe","ffprobe":"D:\\playground\\Aplicatia\\apps\\orchestrator\\tools\\ffmpeg\\ffprobe.exe","platform":"win32","service":"video-orchestrator","timestamp":"2025-11-04T10:29:43.305Z"}

 ↓ tests/integration/pagination.test.js (15 tests | 15 skipped)
 ↓ tests/unit/audioMixing.test.js (22 tests | 22 skipped)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 22 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/ai.test.js > AI Script Generation > POST /ai/script > should reject extremely long topics
Error: expected 400 "Bad Request", got 200 "OK"
 ❯ tests/ai.test.js:149:10
    147|         .post('/ai/script')
    148|         .send(payload)
    149|         .expect(400);
       |          ^
    150|
    151|       expect(response.body).toHaveProperty('error');
 ❯ Test._assertStatus ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:309:14
 ❯ ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:365:13
 ❯ Test._assertFunction ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:342:13
 ❯ Test.assert ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:195:23
 ❯ localAssert ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:138:14
 ❯ Server.<anonymous> ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:152:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/22]⎯

 FAIL  tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should validate required fields
AssertionError: expected [ Array(4) ] to include 'inputPath'
 ❯ tests/audio.test.js:21:26
     19|       // Check that 'inputPath' field is mentioned in validation errors
     20|       const fieldNames = response.body.error.details.errors.map(e => e.field);
     21|       expect(fieldNames).toContain('inputPath');
       |                          ^
     22|     });
     23|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/22]⎯

 FAIL  tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with default settings
AssertionError: expected [ 200, 404, 500 ] to include 400
 ❯ tests/audio.test.js:35:31
     33|         .expect('Content-Type', /json/);
     34|
     35|       expect([200, 404, 500]).toContain(response.status);
       |                               ^
     36|     });
     37|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/22]⎯

 FAIL  tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with custom LUFS target
AssertionError: expected [ 200, 404, 500 ] to include 400
 ❯ tests/audio.test.js:50:31
     48|         .expect('Content-Type', /json/);
     49|
     50|       expect([200, 404, 500]).toContain(response.status);
       |                               ^
     51|
     52|       if (response.status === 200) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/22]⎯

 FAIL  tests/audio.test.js > Audio Processing Module > POST /audio/normalize > should accept valid normalize request with peak limiting
AssertionError: expected [ 200, 404, 500 ] to include 400
 ❯ tests/audio.test.js:70:31
     68|         .send(payload);
     69|
     70|       expect([200, 404, 500]).toContain(response.status);
       |                               ^
     71|     });
     72|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/22]⎯

 FAIL  tests/audio.test.js > Audio Processing Module > GET /audio/info > should validate required audio path
Error: expected 400 "Bad Request", got 500 "Internal Server Error"
 ❯ tests/audio.test.js:217:10
    215|       const response = await request(app)
    216|         .get('/audio/info')
    217|         .expect(400);
       |          ^
    218|
    219|       expect(response.body).toHaveProperty('error');
 ❯ Test._assertStatus ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:309:14
 ❯ ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:365:13
 ❯ Test._assertFunction ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:342:13
 ❯ Test.assert ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:195:23
 ❯ localAssert ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:138:14
 ❯ Server.<anonymous> ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:152:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/22]⎯

 FAIL  tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 3: Text-to-Speech Generation > should generate voice-over from script
AssertionError: expected 500 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 500

 ❯ tests/e2e-pipeline.test.js:159:31
    157|         });
    158|
    159|       expect(response.status).toBe(200);
       |                               ^
    160|       expect(response.body).toMatchObject({
    161|         success: true,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/22]⎯

 FAIL  tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 3: Text-to-Speech Generation > should support different speech speeds
AssertionError: expected 500 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 500

 ❯ tests/e2e-pipeline.test.js:199:33
    197|           });
    198|
    199|         expect(response.status).toBe(200);
       |                                 ^
    200|         expect(response.body.success).toBe(true);
    201|       }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/22]⎯

 FAIL  tests/e2e-pipeline.test.js > End-to-End Pipeline > Step 7: Batch Processing > should list batch jobs
AssertionError: expected 500 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 500

 ❯ tests/e2e-pipeline.test.js:306:31
    304|         .get('/batch');
    305|
    306|       expect(response.status).toBe(200);
       |                               ^
    307|       expect(response.body.success).toBe(true);
    308|       // Backend returns {success, data: {batches: []}}

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/22]⎯

 FAIL  tests/e2e-pipeline.test.js > End-to-End Pipeline > Integration: Cross-Module Communication > should maintain state across pipeline steps
AssertionError: expected null to be truthy

- Expected:
true

+ Received:
null

 ❯ tests/e2e-pipeline.test.js:338:36
    336|       expect(pipelineData.script).toBeTruthy();
    337|       // TTS path should exist from mock TTS generation
    338|       expect(pipelineData.ttsPath).toBeTruthy();
       |                                    ^
    339|     });
    340|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/22]⎯

 FAIL  tests/health.test.js > Health Endpoint > GET /health > should return 200 OK with health status
AssertionError: expected 'degraded' to be 'ok' // Object.is equality

Expected: "ok"
Received: "degraded"

 ❯ tests/health.test.js:14:36
     12|
     13|       expect(response.body).toHaveProperty('status');
     14|       expect(response.body.status).toBe('ok');
       |                                    ^
     15|       expect(response.body).toHaveProperty('timestamp');
     16|       expect(response.body).toHaveProperty('uptime');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/22]⎯

 FAIL  tests/pathSecurity.test.js > Path Security > sanitizeFFmpegPath - Integration > should throw on path with invalid characters
AssertionError: expected [Function] to throw error including 'invalid characters' but got 'File does not exist'

Expected: "invalid characters"
Received: "File does not exist"

 ❯ tests/pathSecurity.test.js:136:59
    134|         // The function checks the input path for invalid characters
    135|         const pathWithInvalid = validPath + ';rm -rf /';
    136|         expect(() => sanitizeFFmpegPath(pathWithInvalid)).toThrow('invalid characters');
       |                                                           ^
    137|       } finally {
    138|         // Cleanup

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/22]⎯

 FAIL  tests/subs.test.js > Subtitles API > POST /subs/generate should create a valid SRT file
AssertionError: expected 400 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 400

 ❯ tests/subs.test.js:41:29
     39|       });
     40|
     41|     expect(response.status).toBe(200);
       |                             ^
     42|     expect(response.body.success).toBe(true);
     43|     expect(response.body.data.path).toContain(outputFilename);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/22]⎯

 FAIL  tests/subs.test.js > Subtitles API > POST /subs/format should convert SRT to VTT
AssertionError: expected 500 to be 200 // Object.is equality

- Expected
+ Received

- 200
+ 500

 ❯ tests/subs.test.js:66:29
     64|       });
     65|
     66|     expect(response.status).toBe(200);
       |                             ^
     67|     expect(response.body.success).toBe(true);
     68|     expect(response.body.data.path).toContain('.vtt');

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/22]⎯

 FAIL  tests/tts.test.js > TTS (Text-to-Speech) Module > POST /tts/generate > should accept valid TTS request with default settings
AssertionError: expected [ 200, 500 ] to include 400
 ❯ tests/tts.test.js:35:26
     33|         .expect('Content-Type', /json/);
     34|
     35|       expect([200, 500]).toContain(response.status);
       |                          ^
     36|
     37|       if (response.status === 200) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/22]⎯

 FAIL  tests/video.test.js > Video Processing Module > GET /video/info > should validate required video path
Error: expected 400 "Bad Request", got 500 "Internal Server Error"
 ❯ tests/video.test.js:234:10
    232|       const response = await request(app)
    233|         .get('/video/info')
    234|         .expect(400);
       |          ^
    235|
    236|       expect(response.body).toHaveProperty('error');
 ❯ Test._assertStatus ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:309:14
 ❯ ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:365:13
 ❯ Test._assertFunction ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:342:13
 ❯ Test.assert ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:195:23
 ❯ localAssert ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:138:14
 ❯ Server.<anonymous> ../../node_modules/.pnpm/supertest@7.1.4/node_modules/supertest/lib/test.js:152:11

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/22]⎯

 FAIL  tests/unit/errorResponse.test.js > Error Response Utilities > formatZodError > should format Zod validation errors
AssertionError: expected undefined to be 'VALIDATION_ERROR' // Object.is equality

- Expected:
"VALIDATION_ERROR"

+ Received:
undefined

 ❯ tests/unit/errorResponse.test.js:181:32
    179|         const formatted = formatZodError(zodError);
    180|
    181|         expect(formatted.code).toBe(ERROR_CODES.VALIDATION_ERROR);
       |                                ^
    182|         expect(formatted.message).toBe('Validation failed');
    183|         expect(formatted.details.errors).toHaveLength(2);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/22]⎯

 FAIL  tests/unit/errorResponse.test.js > Error Response Utilities > formatZodError > should handle nested field paths
TypeError: Cannot read properties of undefined (reading 'errors')
 ❯ tests/unit/errorResponse.test.js:203:34
    201|         const formatted = formatZodError(zodError);
    202|
    203|         expect(formatted.details.errors[0].field).toBe('user.profile.name');
       |                                  ^
    204|       }
    205|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/22]⎯

 FAIL  tests/unit/gracefulDegradation.test.js > Service Availability Tracking > should allow retry after cooldown period
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/unit/gracefulDegradation.test.js:41:50
     39|     // Advance time past cooldown
     40|     vi.advanceTimersByTime(1001);
     41|     expect(isServiceAvailable(ServiceFlags.TTS)).toBe(true);
       |                                                  ^
     42|
     43|     vi.useRealTimers();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/22]⎯

 FAIL  tests/unit/gracefulDegradation.test.js > withGracefulDegradation > should use custom cooldown period
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/unit/gracefulDegradation.test.js:158:54
    156|
    157|     vi.advanceTimersByTime(2001);
    158|     expect(isServiceAvailable(ServiceFlags.WHISPER)).toBe(true);
       |                                                      ^
    159|
    160|     vi.useRealTimers();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/22]⎯

 FAIL  tests/unit/logSanitization.test.js > Log Sanitization > API Key Sanitization > should redact Bearer tokens
AssertionError: expected 'Authorization: [REDACTED] eyJhbGciOiJ…' not to contain 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

Expected: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
Received: "Authorization: [REDACTED] eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

 ❯ tests/unit/logSanitization.test.js:19:29
     17|
     18|       expect(sanitized).toContain('[REDACTED]');
     19|       expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
       |                             ^
     20|       expect(sanitized).not.toContain('Bearer eyJ'); // Verify Bearer token part is gone
     21|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/22]⎯

 FAIL  tests/unit/paths.test.js > Paths Configuration > Platform Compatibility > should handle absolute paths correctly
TypeError: The "path" argument must be of type string. Received an instance of Object
 ❯ tests/unit/paths.test.js:241:21
    239|     it('should handle absolute paths correctly', () => {
    240|       Object.values(paths).forEach(p => {
    241|         expect(path.isAbsolute(p)).toBe(true);
       |                     ^
    242|       });
    243|     });
 ❯ tests/unit/paths.test.js:240:28

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22/22]⎯

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

Vitest caught 5 unhandled errors during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Error: 401 Incorrect API key provided: sk-proj-********************************************************************_COM. You can find your API key at https://platform.openai.com/account/api-keys.
 ❯ Function.generate ../../node_modules/.pnpm/openai@6.7.0_zod@4.1.12/node_modules/openai/core/error.mjs:44:20
 ❯ OpenAI.makeStatusError ../../node_modules/.pnpm/openai@6.7.0_zod@4.1.12/node_modules/openai/client.mjs:162:32
 ❯ OpenAI.makeRequest ../../node_modules/.pnpm/openai@6.7.0_zod@4.1.12/node_modules/openai/client.mjs:330:30
 ❯ processTicksAndRejections node:internal/process/task_queues:105:5
 ❯ AIService.generateWithOpenAI src/services/aiService.js:151:24
    149|
    150|   async generateWithOpenAI(prompt) {
    151|     const completion = await this.openaiClient.chat.completions.create({
       |                        ^
    152|       model: 'gpt-4o-mini',
    153|       messages: [
 ❯ retryWithBackoff src/utils/retryHandler.js:54:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { status: 401, headers: { constructor: 'Function<Headers>', append: 'Function<append>', delete: 'Function<delete>', get: 'Function<get>', has: 'Function<has>', set: 'Function<set>', getSetCookie: 'Function<getSetCookie>', keys: 'Function<keys>', values: 'Function<values>', entries: 'Function<entries>', forEach: 'Function<forEach>' }, requestID: 'req_045552e86ef844249307bb1d7fdad166', error: { message: 'Incorrect API key provided: sk-proj-********************************************************************_COM. You can find your API key at https://platform.openai.com/account/api-keys.', type: 'invalid_request_error', param: null, code: 'invalid_api_key' }, code: 'invalid_api_key', param: null }
This error originated in "tests/e2e-pipeline.test.js" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.
The latest test that might've caused the error is "should generate a complete story script". It might mean one of the following:
- The error was thrown, while Vitest was running this test.
- If the error occurred after the test had been completed, this was the last documented test before it was thrown.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Error: 401 Incorrect API key provided: sk-proj-********************************************************************_COM. You can find your API key at https://platform.openai.com/account/api-keys.
 ❯ Function.generate ../../node_modules/.pnpm/openai@6.7.0_zod@4.1.12/node_modules/openai/core/error.mjs:44:20
 ❯ OpenAI.makeStatusError ../../node_modules/.pnpm/openai@6.7.0_zod@4.1.12/node_modules/openai/client.mjs:162:32
 ❯ OpenAI.makeRequest ../../node_modules/.pnpm/openai@6.7.0_zod@4.1.12/node_modules/openai/client.mjs:330:30
 ❯ processTicksAndRejections node:internal/process/task_queues:105:5
 ❯ AIService.generateWithOpenAI src/services/aiService.js:151:24
    149|
    150|   async generateWithOpenAI(prompt) {
    151|     const completion = await this.openaiClient.chat.completions.create({
       |                        ^
    152|       model: 'gpt-4o-mini',
    153|       messages: [
 ❯ retryWithBackoff src/utils/retryHandler.js:54:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { status: 401, headers: { constructor: 'Function<Headers>', append: 'Function<append>', delete: 'Function<delete>', get: 'Function<get>', has: 'Function<has>', set: 'Function<set>', getSetCookie: 'Function<getSetCookie>', keys: 'Function<keys>', values: 'Function<values>', entries: 'Function<entries>', forEach: 'Function<forEach>' }, requestID: 'req_f57a222c38b2440988da4bd3c8e37787', error: { message: 'Incorrect API key provided: sk-proj-********************************************************************_COM. You can find your API key at https://platform.openai.com/account/api-keys.', type: 'invalid_request_error', param: null, code: 'invalid_api_key' }, code: 'invalid_api_key', param: null }
This error originated in "tests/ai.test.js" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.
The latest test that might've caused the error is "should generate script with valid input". It might mean one of the following:
- The error was thrown, while Vitest was running this test.
- If the error occurred after the test had been completed, this was the last documented test before it was thrown.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: [400 Bad Request] API key not valid. Please pass a valid API key. [{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"API_KEY_INVALID","domain":"googleapis.com","metadata":{"service":"generativelanguage.googleapis.com"}},{"@type":"type.googleapis.com/google.rpc.LocalizedMessage","locale":"en-US","message":"API key not valid. Please pass a valid API key."}]
 ❯ handleResponseNotOk ../../node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11
 ❯ processTicksAndRejections node:internal/process/task_queues:105:5
 ❯ makeRequest ../../node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9
 ❯ generateContent ../../node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22
 ❯ AIService.generateWithGemini src/services/aiService.js:174:20
    172|     const model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    173|
    174|     const result = await model.generateContent([
       |                    ^
    175|       `${prompt}\n\nRespond with JSON containing: script (string), hooks (array of 3 compelling opening lines)…
    176|     ]);
 ❯ retryWithBackoff src/utils/retryHandler.js:54:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { status: 400, statusText: 'Bad Request', errorDetails: [ { '@type': 'type.googleapis.com/google.rpc.ErrorInfo', reason: 'API_KEY_INVALID', domain: 'googleapis.com', metadata: { service: 'generativelanguage.googleapis.com' } }, { '@type': 'type.googleapis.com/google.rpc.LocalizedMessage', locale: 'en-US', message: 'API key not valid. Please pass a valid API key.' } ] }
This error originated in "tests/e2e-pipeline.test.js" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.
The latest test that might've caused the error is "should generate a complete story script". It might mean one of the following:
- The error was thrown, while Vitest was running this test.
- If the error occurred after the test had been completed, this was the last documented test before it was thrown.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Error: ETIMEDOUT
 ❯ tests/unit/retryHandler.test.js:51:19
     49|
     50|   it('should throw after exhausting all retries', async () => {
     51|     const error = new Error('ETIMEDOUT');
       |                   ^
     52|     const operation = vi.fn().mockRejectedValue(error);
     53|
 ❯ ../../node_modules/.pnpm/@vitest+runner@4.0.6/node_modules/@vitest/runner/dist/index.js:157:11
 ❯ ../../node_modules/.pnpm/@vitest+runner@4.0.6/node_modules/@vitest/runner/dist/index.js:753:26
 ❯ ../../node_modules/.pnpm/@vitest+runner@4.0.6/node_modules/@vitest/runner/dist/index.js:1636:20
 ❯ runWithTimeout ../../node_modules/.pnpm/@vitest+runner@4.0.6/node_modules/@vitest/runner/dist/index.js:1602:10
 ❯ runTest ../../node_modules/.pnpm/@vitest+runner@4.0.6/node_modules/@vitest/runner/dist/index.js:1309:12
 ❯ runSuite ../../node_modules/.pnpm/@vitest+runner@4.0.6/node_modules/@vitest/runner/dist/index.js:1468:8
 ❯ runSuite ../../node_modules/.pnpm/@vitest+runner@4.0.6/node_modules/@vitest/runner/dist/index.js:1468:8
 ❯ runFiles ../../node_modules/.pnpm/@vitest+runner@4.0.6/node_modules/@vitest/runner/dist/index.js:1526:3

This error originated in "tests/unit/retryHandler.test.js" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.
The latest test that might've caused the error is "should throw after exhausting all retries". It might mean one of the following:
- The error was thrown, while Vitest was running this test.
- If the error occurred after the test had been completed, this was the last documented test before it was thrown.

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Unhandled Rejection ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Error: [GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent: [400 Bad Request] API key not valid. Please pass a valid API key. [{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"API_KEY_INVALID","domain":"googleapis.com","metadata":{"service":"generativelanguage.googleapis.com"}},{"@type":"type.googleapis.com/google.rpc.LocalizedMessage","locale":"en-US","message":"API key not valid. Please pass a valid API key."}]
 ❯ handleResponseNotOk ../../node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:432:11
 ❯ processTicksAndRejections node:internal/process/task_queues:105:5
 ❯ makeRequest ../../node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:401:9
 ❯ generateContent ../../node_modules/.pnpm/@google+generative-ai@0.24.1/node_modules/@google/generative-ai/dist/index.mjs:865:22
 ❯ AIService.generateWithGemini src/services/aiService.js:174:20
    172|     const model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    173|
    174|     const result = await model.generateContent([
       |                    ^
    175|       `${prompt}\n\nRespond with JSON containing: script (string), hooks (array of 3 compelling opening lines)…
    176|     ]);
 ❯ retryWithBackoff src/utils/retryHandler.js:54:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
Serialized Error: { status: 400, statusText: 'Bad Request', errorDetails: [ { '@type': 'type.googleapis.com/google.rpc.ErrorInfo', reason: 'API_KEY_INVALID', domain: 'googleapis.com', metadata: { service: 'generativelanguage.googleapis.com' } }, { '@type': 'type.googleapis.com/google.rpc.LocalizedMessage', locale: 'en-US', message: 'API key not valid. Please pass a valid API key.' } ] }
This error originated in "tests/ai.test.js" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.
The latest test that might've caused the error is "should generate script with valid input". It might mean one of the following:
- The error was thrown, while Vitest was running this test.
- If the error occurred after the test had been completed, this was the last documented test before it was thrown.
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯


 Test Files  12 failed | 6 passed | 2 skipped (20)
      Tests  22 failed | 284 passed | 37 skipped (343)
     Errors  5 errors
   Start at  12:29:37
   Duration  6.46s (transform 5.39s, setup 376ms, collect 26.20s, tests 7.19s, environment 4ms, prepare 687ms)

 FAIL  Tests failed. Watching for file changes...
       press h to show help, press q to quit
D:\playground\Aplicatia\apps\orchestrator:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @app/orchestrator@1.0.0 test: `vitest`
Exit status 1
 ELIFECYCLE  Command failed with exit code 1.
 ELIFECYCLE  Command failed with exit code 1.