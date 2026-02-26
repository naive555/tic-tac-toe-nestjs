import { Injectable } from '@nestjs/common';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateOAuthUser(payload: any) {
    const { sub, email } = payload;

    let user = await this.userService.findByOAuthId(sub);

    if (!user) {
      user = await this.userService.createOAuthUser({
        oauthId: sub,
        email,
      });
    }

    return user;
  }
}
