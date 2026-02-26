import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthService, JwtStrategy, UserService, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
