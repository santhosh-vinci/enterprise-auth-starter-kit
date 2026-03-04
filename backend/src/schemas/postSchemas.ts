import { z } from 'zod';

export const postParamsSchema = z.object({
  id: z.string().min(1),
});

export const createPostSchema = z.object({
  title: z.string().min(3).max(120),
  body: z.string().min(5).max(5000),
});

export const updatePostSchema = createPostSchema.partial().refine(
  (value) => typeof value.title === 'string' || typeof value.body === 'string',
  { message: 'At least one field (title or body) must be provided.' },
);
