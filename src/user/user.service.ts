import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByOAuthId(oauthId: string) {
    return this.prisma.user.findUnique({
      where: { oauthId },
    });
  }

  async createOAuthUser(data: { oauthId: string; email: string }) {
    return this.prisma.user.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
