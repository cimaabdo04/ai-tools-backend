import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET environment variable is required');
  return {
    secret,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'ai-tools-directory',
    audience: process.env.JWT_AUDIENCE || 'ai-tools-directory-users',
  };
});
