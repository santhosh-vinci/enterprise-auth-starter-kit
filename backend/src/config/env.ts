import dotenv from 'dotenv';

dotenv.config();

const requireEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientOrigin: requireEnv('CLIENT_ORIGIN', 'http://localhost:5173'),
  accessTokenSecret: requireEnv('ACCESS_TOKEN_SECRET', 'dev-access-secret-change-me'),
  refreshTokenSecret: requireEnv('REFRESH_TOKEN_SECRET', 'dev-refresh-secret-change-me'),
};
