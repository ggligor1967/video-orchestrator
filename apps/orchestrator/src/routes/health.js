import { Router } from 'express';

export function createHealthRoutes({ healthService }) {
  const router = Router();

  // Basic health check
  router.get('/', async (req, res) => {
    try {
      const health = await healthService.getHealthStatus();
      
      const statusCode = {
        healthy: 200,
        degraded: 200,
        unhealthy: 503
      }[health.status] || 503;

      // Return format expected by tests: flat structure with status, timestamp, uptime, tools
      res.status(statusCode).json({
        status: health.status === 'healthy' ? 'ok' : health.status,
        timestamp: health.timestamp,
        uptime: health.system ? Number.parseFloat(health.system.uptime) : process.uptime(),
        tools: health.tools ? {
          ffmpeg: health.tools.tools.ffmpeg.available,
          piper: health.tools.tools.piper.available,
          whisper: health.tools.tools.whisper.available,
          godot: health.tools.tools.godot?.available || false
        } : {},
        system: health.system,
        api: {
          version: '1.0.0',
          endpoints: ['/health', '/ai', '/video', '/audio', '/tts', '/subs', '/export']
        }
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // Tools verification endpoint
  router.get('/tools', async (req, res) => {
    try {
      const tools = await healthService.verifyTools();
      
      res.status(200).json({
        success: true,
        data: tools
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'TOOLS_CHECK_FAILED',
          message: error.message
        }
      });
    }
  });

  // System information endpoint
  router.get('/system', async (req, res) => {
    try {
      const system = await healthService.getSystemInfo();
      
      res.status(200).json({
        success: true,
        data: system
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SYSTEM_INFO_FAILED',
          message: error.message
        }
      });
    }
  });

  return router;
}