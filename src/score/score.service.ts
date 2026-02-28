import { Injectable } from '@nestjs/common';

import { GameResult } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyScore(userId: string) {
    return this.prisma.score.findUnique({
      where: { userId },
    });
  }

  async getAllScores() {
    return this.prisma.score.findMany({
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: {
        score: 'desc',
      },
    });
  }

  public calculateScore(
    currentScore: number,
    currentStreak: number,
    result: GameResult,
  ) {
    let score = currentScore;
    let streak = currentStreak;

    if (result === GameResult.WIN) {
      streak++;
      score++;

      if (streak === 3) {
        score++;
        streak = 0;
      }
    } else if (result === GameResult.LOSE) {
      score--;
      streak = 0;
    }

    return { score, streak };
  }
}
