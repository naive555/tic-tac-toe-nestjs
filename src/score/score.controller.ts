import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { User } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScoreService } from './score.service';

@ApiTags('Score')
@Controller('scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyScore(@CurrentUser() user: User) {
    return this.scoreService.getMyScore(user.id);
  }

  @Get()
  async getLeaderboard() {
    return this.scoreService.getAllScores();
  }
}
