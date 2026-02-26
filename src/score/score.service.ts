import { Injectable } from '@nestjs/common';

import { GameResult } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async processGameResult(userId: string, result: GameResult) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.score.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          score: 0,
          winStreak: 0,
        },
      });

      const { score, streak } = this.calculateScore(
        existing.score,
        existing.winStreak,
        result,
      );

      return tx.score.update({
        where: { userId },
        data: {
          score,
          winStreak: streak,
        },
      });
    });
  }

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

  private calculateScore(
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
