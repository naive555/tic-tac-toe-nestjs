import { Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateOAuthUser(payload: any) {
    const { oauthId, email } = payload;

    let user = await this.userService.findByOAuthId(oauthId);

    if (!user) {
      user = await this.userService.createOAuthUser({
        oauthId,
        email,
      });
    }

    return user;
  }
}
