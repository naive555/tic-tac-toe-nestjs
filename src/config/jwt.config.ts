import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    issuer: process.env.JWT_ISS || '',
    audience: process.env.JWT_AUD || '',
    expiresIn: process.env.JWT_EXPIRES_IN
      ? Number(process.env.JWT_EXPIRES_IN)
      : 3600,
  },
}));
