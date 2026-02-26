import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { GameResult } from '../../generated/prisma/enums';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScoreService } from './score.service';

class ProcessGameDto {
  result: GameResult;
}

@Controller('scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @UseGuards(JwtAuthGuard)
  @Post('result')
  async processResult(@Req() req: any, @Body() body: ProcessGameDto) {
    const userId = req.user.id;

    return this.scoreService.processGameResult(userId, body.result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyScore(@Req() req: any) {
    const userId = req.user.id;
    return this.scoreService.getMyScore(userId);
  }

  @Get()
  async getLeaderboard() {
    return this.scoreService.getAllScores();
  }
}
