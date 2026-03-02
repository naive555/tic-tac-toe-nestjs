import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import * as jwksRsa from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: configService.get('oauth.issuer'),
      audience: configService.get('oauth.audience'),
      algorithms: ['RS256'],
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: `${configService.get('oauth.issuer')}.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    // Custom claim from auth0
    const customClaim = this.configService.get('oauth.customClaim');

    return this.authService.validateOAuthUser({
      oauthId: payload.sub,
      email: payload[`${customClaim}/email`],
      name: payload[`${customClaim}/name`],
    });
  }
}
