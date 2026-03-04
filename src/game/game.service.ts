import { BadRequestException, Injectable } from '@nestjs/common';

import { GameResult } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma.service';
import { ScoreService } from '../score/score.service';
import { Difficulty, GameMark } from './enums/game.enums';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoreService: ScoreService,
  ) {}

  async play(
    userId: string,
    board: GameMark[],
    position: number,
    difficulty: Difficulty = Difficulty.MEDIUM,
  ) {
    if (board[position]) {
      throw new BadRequestException('Invalid move');
    }

    board[position] = GameMark.X;

    let result = this.checkGameResult(board);

    if (!result) {
      this.makeBotMove(board, difficulty);
      result = this.checkGameResult(board);
    }

    if (result) {
      await this.completeGame(userId, board, result);
    }

    return { board, result };
  }

  private async completeGame(
    userId: string,
    board: GameMark[],
    result: GameResult,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.game.create({
        data: {
          userId,
          result,
          board,
        },
      });

      const existing = await tx.score.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      const { score, streak } = this.scoreService.calculateScore(
        existing.score,
        existing.winStreak,
        result,
      );

      await tx.score.update({
        where: { userId },
        data: {
          score,
          winStreak: streak,
        },
      });
    });
  }

  private makeBotMove(
    board: (GameMark | null)[],
    difficulty: Difficulty,
  ): void {
    const bestIndex = this.getBestMove(board, difficulty);
    if (bestIndex !== -1) board[bestIndex] = GameMark.O;
  }

  private checkGameResult(board: GameMark[]): GameResult | null {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const pattern of winPatterns) {
      const winner = this.checkWinningLine(board, pattern);
      if (winner) {
        return winner === GameMark.X ? GameResult.WIN : GameResult.LOSE;
      }
    }

    const isDraw = board.every((cell) => cell);
    if (isDraw) {
      return GameResult.DRAW;
    }

    return null;
  }

  private checkWinningLine(
    board: GameMark[],
    [first, second, third]: number[],
  ) {
    const mark = board[first];
    return mark && mark === board[second] && mark === board[third]
      ? mark
      : null;
  }

  private getBestMove(
    board: (GameMark | null)[],
    difficulty: Difficulty,
  ): number {
    const rand = Math.random();

    // easy = random 70%, medium = random 30%, hard = always minimax
    const randomChance = {
      [Difficulty.EASY]: 0.7,
      [Difficulty.MEDIUM]: 0.3,
      [Difficulty.HARD]: 0,
    }[difficulty];

    if (rand < randomChance) {
      const empty = board
        .map((cell, i) => (cell === null ? i : null))
        .filter((v) => v !== null) as number[];
      return empty[Math.floor(Math.random() * empty.length)] ?? -1;
    }

    let bestScore = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < board.length; i++) {
      if (board[i]) continue;
      board[i] = GameMark.O;
      const score = this.minimax(board, 0, false);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  private minimax(
    board: (GameMark | null)[],
    depth: number,
    isMaximizing: boolean,
  ): number {
    const result = this.checkGameResult(board);
    if (result === GameResult.LOSE) return 10 - depth;
    if (result === GameResult.WIN) return depth - 10;
    if (result === GameResult.DRAW) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i]) continue;
        board[i] = GameMark.O;
        best = Math.max(best, this.minimax(board, depth + 1, false));
        board[i] = null;
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i]) continue;
        board[i] = GameMark.X;
        best = Math.min(best, this.minimax(board, depth + 1, true));
        board[i] = null;
      }
      return best;
    }
  }
}
