import { Router } from 'express';
import { createPost, deletePost, getPosts, updatePost } from '../controllers/postController';
import { authenticateAccessToken, authorizeRoles } from '../middleware/auth';
import { validateResource } from '../middleware/validateResource';
import { createPostSchema, postParamsSchema, updatePostSchema } from '../schemas/postSchemas';

const postRoutes = Router();

postRoutes.use(authenticateAccessToken());
postRoutes.get('/', authorizeRoles('User', 'Admin'), getPosts);
postRoutes.post('/', authorizeRoles('Admin'), validateResource({ body: createPostSchema }), createPost);
postRoutes.put(
  '/:id',
  authorizeRoles('Admin'),
  validateResource({ params: postParamsSchema, body: updatePostSchema }),
  updatePost,
);
postRoutes.delete('/:id', authorizeRoles('Admin'), validateResource({ params: postParamsSchema }), deletePost);

export { postRoutes };
