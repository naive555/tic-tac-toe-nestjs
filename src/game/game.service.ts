import { BadRequestException, Injectable } from '@nestjs/common';

import { GameResult } from '../../generated/prisma/enums';
import { ScoreService } from '../score/score.service';
import { GameMark } from './enums/game.enums';

@Injectable()
export class GameService {
  constructor(private readonly scoreService: ScoreService) {}

  async play(userId: string, board: GameMark[], position: number) {
    this.validateInput(board, position);

    if (board[position]) {
      throw new BadRequestException('Invalid move');
    }

    board[position] = GameMark.X;

    let result = this.checkGameResult(board);

    if (!result) {
      this.makeBotMove(board);
      result = this.checkGameResult(board);
    }

    if (result) {
      await this.scoreService.processGameResult(userId, result);
    }

    return { board, result };
  }

  private validateInput(board: GameMark[], position: number) {
    if (!Array.isArray(board) || board.length !== 9) {
      throw new BadRequestException('Board must have 9 cells');
    }

    if (position < 0 || position > 8) {
      throw new BadRequestException('Position must be between 0-8');
    }
  }

  private makeBotMove(board: GameMark[]) {
    const emptyIndexes = board
      .map((cell, index) => (!cell ? index : null))
      .filter((v) => v !== null) as number[];

    if (emptyIndexes.length === 0) return;

    const randomIndex =
      emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

    board[randomIndex] = GameMark.O;
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
}
