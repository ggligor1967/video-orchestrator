import { z } from 'zod';

const videoMethodSchema = z.enum(['pictory', 'kapwing']);
const aspectRatioSchema = z.enum(['9:16', '16:9', '1:1']);
const safeStringSchema = z.string().min(1).max(1000).regex(/^[a-zA-Z0-9\s\-_.,!?'"()]+$/);
const safePathSchema = z.string().min(1).max(500).regex(/^[a-zA-Z0-9\\/\-_.]+$/);

export const processVideoSchema = z.object({
  method: videoMethodSchema,
  script: safeStringSchema.optional(),
  name: safeStringSchema,
  voiceId: z.string().max(100).optional(),
  aspectRatio: aspectRatioSchema.optional(),
  brandKit: z.object({
    id: z.string().max(100),
    logoPath: safePathSchema.optional(),
    colors: z.object({
      primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
    }).optional()
  }).optional(),
  backgroundPath: safePathSchema.optional(),
  audioPath: safePathSchema.optional(),
  subtitles: z.array(z.object({
    text: safeStringSchema,
    startTime: z.number().min(0).max(3600),
    endTime: z.number().min(0).max(3600)
  })).max(1000).optional(),
  captionStyle: z.string().max(100).optional(),
  duration: z.number().min(1).max(600).optional()
});

export const batchProcessSchema = z.object({
  videos: z.array(processVideoSchema).min(1).max(50),
  method: videoMethodSchema.optional()
});

export const stockSearchSchema = z.object({
  query: safeStringSchema,
  count: z.number().min(1).max(100).default(10)
});

export const smartResizeSchema = z.object({
  videoUrl: z.string().url().max(2000),
  targetRatio: aspectRatioSchema.optional()
});