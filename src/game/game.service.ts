import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Difficulty, GameResult } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma.service';
import { ScoreService } from '../score/score.service';
import { GameMark } from './enums/game.enums';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoreService: ScoreService,
  ) {}

  async startGame(userId: string, difficulty: Difficulty) {
    await this.prisma.game.updateMany({
      where: { userId, result: null },
      data: { result: GameResult.ABANDONED },
    });

    return this.prisma.game.create({
      data: { userId, difficulty, board: Array(9).fill(GameMark.Empty) },
    });
  }

  async move(userId: string, gameId: string, position: number) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });

    if (!game) throw new NotFoundException('Game not found');
    if (game.userId !== userId) throw new ForbiddenException();
    if (game.result) throw new BadRequestException('Game already finished');
    if (game.board[position]) throw new BadRequestException('Invalid move');

    const board = game.board as GameMark[];
    board[position] = GameMark.X;

    let result = this.checkGameResult(board);

    if (!result) {
      this.makeBotMove(board, game.difficulty as Difficulty);
      result = this.checkGameResult(board);
    }

    if (result) {
      await this.completeGame(game.id, userId, board, result);
      return { board, result };
    }

    await this.prisma.game.update({
      where: { id: gameId },
      data: { board },
    });

    return { board, result: null };
  }

  private async completeGame(
    gameId: string,
    userId: string,
    board: GameMark[],
    result: GameResult,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.game.update({
        where: { id: gameId },
        data: { board, result },
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
        data: { score, winStreak: streak },
      });
    });
  }

  private makeBotMove(board: GameMark[], difficulty: Difficulty): void {
    const bestIndex = this.getBestMove(board, difficulty);
    if (bestIndex !== -1) board[bestIndex] = GameMark.O;
  }

  private checkGameResult(board: GameMark[]): GameResult {
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
      : GameMark.Empty;
  }

  private getBestMove(board: GameMark[], difficulty: Difficulty): number {
    const rand = Math.random();

    // easy = random 70%, medium = random 30%, hard = always minimax
    const randomChance = {
      [Difficulty.EASY]: 0.7,
      [Difficulty.MEDIUM]: 0.3,
      [Difficulty.HARD]: 0,
    }[difficulty];

    if (rand < randomChance) {
      const empty = board
        .map((cell, i) => (cell === GameMark.Empty ? i : null))
        .filter((v) => v !== null) as number[];
      return empty[Math.floor(Math.random() * empty.length)] ?? -1;
    }

    let bestScore = -Infinity;
    let bestIndex = -1;

    for (let i = 0; i < board.length; i++) {
      if (board[i]) continue;
      board[i] = GameMark.O;
      const score = this.minimax(board, 0, false);
      board[i] = GameMark.Empty;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    return bestIndex;
  }

  private minimax(
    board: GameMark[],
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
        board[i] = GameMark.Empty;
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i]) continue;
        board[i] = GameMark.X;
        best = Math.min(best, this.minimax(board, depth + 1, true));
        board[i] = GameMark.Empty;
      }
      return best;
    }
  }
}
