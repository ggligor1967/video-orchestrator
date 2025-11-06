import { z } from 'zod';

// Example schema for a User
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  createdAt: z.date(),
});

// Example schema for a Video
export const VideoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url(),
  uploadedAt: z.date(),
});

// Example schema for a Comment
export const CommentSchema = z.object({
  id: z.string().uuid(),
  videoId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1),
  createdAt: z.date(),
});

// Export all schemas
export type User = z.infer<typeof UserSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type Comment = z.infer<typeof CommentSchema>;