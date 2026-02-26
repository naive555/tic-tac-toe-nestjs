import { registerAs } from '@nestjs/config';

export default registerAs('common', () => ({
  name: process.env.NAME || 'Tic Tac Toe: API',
  version: process.env.VERSION || '0.1.0',
  environment: process.env.NODE_ENV || 'local',
  port: +process.env.PORT || 3000,
  cors: process.env.CORS === 'true',
  corsDomains: process.env.CORS_DOMAINS || [],
}));
