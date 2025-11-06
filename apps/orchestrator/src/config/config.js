import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (parent of apps/orchestrator)
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

const DEFAULT_CORS_ORIGINS = [
  'http://127.0.0.1:1421',
  'http://localhost:1421',
  'http://localhost:5173',
  'http://localhost:1420',
  'tauri://localhost'
];

const parseOrigins = (origins) => {
  if (!origins) return DEFAULT_CORS_ORIGINS;
  return origins.split(',').map((origin) => origin.trim()).filter(Boolean);
};

export function loadConfig() {
  const env = process.env.NODE_ENV || 'development';
  const port = Number(process.env.PORT || 4545);
  const host = process.env.HOST || '127.0.0.1';

  // Restrict CORS origins in production
  const corsOrigins = env === 'production'
    ? ['tauri://localhost'] // Only Tauri app in production
    : parseOrigins(process.env.CORS_ORIGINS);

  return {
    env,
    isProduction: env === 'production',
    port,
    host,
    version: process.env.APP_VERSION || '1.0.0',
    cors: {
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    bodyParser: {
      jsonLimit: process.env.JSON_BODY_LIMIT || '50mb',
      urlencodedLimit: process.env.URLENCODED_BODY_LIMIT || '50mb'
    },
    directories: {
      data: path.resolve(__dirname, '../../../data'),
      static: path.resolve(__dirname, '../../../data'),
      cache: path.resolve(__dirname, '../../../data/cache'),
      assets: {
        backgrounds: path.resolve(__dirname, '../../../data/assets/backgrounds'),
        audio: path.resolve(__dirname, '../../../data/assets/audio')
      }
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      enableHttpLogging: process.env.ENABLE_HTTP_LOGGING !== 'false'
    },
    // Stock Media APIs
    stockMedia: {
      pexelsApiKey: process.env.PEXELS_API_KEY || '',
      pixabayApiKey: process.env.PIXABAY_API_KEY || '',
      unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || '',
      enabled: !!(process.env.PEXELS_API_KEY || process.env.PIXABAY_API_KEY || process.env.UNSPLASH_ACCESS_KEY),
    },
    
    // AI APIs
    ai: {
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      geminiApiKey: process.env.GEMINI_API_KEY || '',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      provider: process.env.AI_PROVIDER || 'mock', // 'openai', 'gemini', 'anthropic', 'mock'
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
      timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
    },
    
    // TTS Settings
    tts: {
      defaultVoice: process.env.DEFAULT_TTS_VOICE || 'en_US-amy-medium',
      defaultSpeed: parseFloat(process.env.DEFAULT_TTS_SPEED || '1.0'),
      defaultPitch: parseFloat(process.env.DEFAULT_TTS_PITCH || '1.0'),
    },
    
    // Whisper Settings
    whisper: {
      provider: process.env.WHISPER_PROVIDER || 'mock', // 'whisper', 'mock'
      model: process.env.WHISPER_MODEL || 'base',
      language: process.env.WHISPER_LANGUAGE || 'en',
    },
    
    // Cleanup Settings
    cleanup: {
      enabled: process.env.CLEANUP_ENABLED !== 'false',
      interval: Number.parseInt(process.env.CLEANUP_INTERVAL || '3600000', 10), // 1 hour
      maxAge: Number.parseInt(process.env.CLEANUP_MAX_AGE || '86400000', 10), // 24 hours
    },
    
    // Legacy integrations (kept for backwards compatibility)
    integrations: {
      pexels: {
        apiKey: process.env.PEXELS_API_KEY || ''
      },
      pixabay: {
        apiKey: process.env.PIXABAY_API_KEY || ''
      }
    },
    security: {
      // Allowed directories for file operations
      // All paths in API requests must be within these directories
      allowedDirectories: {
        // Read/write directories for media processing
        data: [
          'data/assets',      // Imported video/audio assets
          'data/cache',       // Temporary processing files
          'data/exports',     // Final video outputs
          'data/tts',         // Generated voice files
          'data/subs'         // Subtitle files
        ],
        // Read-only directories (for models, executables)
        tools: [
          'tools/piper',      // TTS models and binary
          'tools/whisper',    // Speech-to-text models
          'tools/ffmpeg',     // Video processing binary
          'tools/godot'       // Voxel generator
        ],
        // All allowed directories combined
        all: [
          'data/assets',
          'data/cache',
          'data/exports',
          'data/tts',
          'data/subs',
          'tools/piper',
          'tools/whisper',
          'tools/ffmpeg',
          'tools/godot'
        ]
      }
    }
  };
}
