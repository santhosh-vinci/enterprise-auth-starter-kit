import { Router } from 'express';
import { login, logout, refresh, register } from '../controllers/authController';
import { authenticateRefreshToken } from '../middleware/auth';
import { validateResource } from '../middleware/validateResource';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

const authRoutes = Router();

authRoutes.post('/register', validateResource({ body: registerSchema }), register);
authRoutes.post('/login', validateResource({ body: loginSchema }), login);
authRoutes.post('/refresh', authenticateRefreshToken(), refresh);
authRoutes.post('/logout', authenticateRefreshToken(), logout);

export { authRoutes };
