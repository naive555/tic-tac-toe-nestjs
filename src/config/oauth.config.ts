import { registerAs } from '@nestjs/config';

export default registerAs('oauth', () => ({
  issuer: process.env.OAUTH_ISSUER,
  audience: process.env.OAUTH_AUDIENCE,
  customClaim: process.env.OAUTH_CUSTOM_CLAIM_KEY,
}));
