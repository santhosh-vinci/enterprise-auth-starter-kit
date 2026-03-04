import type { Request, Response } from 'express';
import { posts } from '../data/store';
import { generateId } from '../utils/ids';

export const getPosts = (_req: Request, res: Response): void => {
  res.status(200).json({ data: posts });
};

export const createPost = (req: Request, res: Response): void => {
  const { title, body } = req.body as { title: string; body: string };

  const post = {
    id: generateId('post'),
    title,
    body,
    createdBy: req.user?.id ?? 'unknown',
  };
  posts.push(post);

  res.status(201).json({ data: post });
};

export const updatePost = (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const post = posts.find((entry) => entry.id === id);

  if (!post) {
    res.status(404).json({ message: 'Post not found.' });
    return;
  }

  const payload = req.body as { title?: string; body?: string };
  if (payload.title) post.title = payload.title;
  if (payload.body) post.body = payload.body;

  res.status(200).json({ data: post });
};

export const deletePost = (req: Request, res: Response): void => {
  const { id } = req.params as { id: string };
  const index = posts.findIndex((entry) => entry.id === id);

  if (index === -1) {
    res.status(404).json({ message: 'Post not found.' });
    return;
  }

  posts.splice(index, 1);
  res.status(200).json({ message: 'Post deleted.' });
};
