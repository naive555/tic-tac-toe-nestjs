import { BadRequestException } from '@nestjs/common';
import { GameService } from './game.service';
import { ScoreService } from '../score/score.service';
import { GameMark } from './enums/game.enums';
import { GameResult } from '../../generated/prisma/enums';

describe('GameService', () => {
  let gameService: GameService;
  let scoreService: jest.Mocked<ScoreService>;

  beforeEach(() => {
    scoreService = {
      processGameResult: jest.fn(),
    } as any;

    gameService = new GameService(scoreService);
  });

  describe('play', () => {
    it('should throw if board length is not 9', async () => {
      await expect(
        gameService.play('user1', [] as GameMark[], 0),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if position is out of range', async () => {
      const board = Array(9).fill(null);
      await expect(gameService.play('user1', board, 9)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if position already occupied', async () => {
      const board = Array(9).fill(null);
      board[0] = GameMark.X;

      await expect(gameService.play('user1', board, 0)).rejects.toThrow(
        'Invalid move',
      );
    });

    it('should return WIN when player completes a line', async () => {
      const board = [
        GameMark.X,
        GameMark.X,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ] as GameMark[];

      const result = await gameService.play('user1', board, 2);

      expect(result.result).toBe(GameResult.WIN);
      expect(scoreService.processGameResult).toHaveBeenCalledWith(
        'user1',
        GameResult.WIN,
      );
    });

    it('should return DRAW when board is full without winner', async () => {
      const board = [
        GameMark.X,
        GameMark.O,
        GameMark.X,
        GameMark.X,
        GameMark.O,
        GameMark.O,
        GameMark.O,
        GameMark.X,
        null,
      ] as GameMark[];

      const result = await gameService.play('user1', board, 8);

      expect(result.result).toBe(GameResult.DRAW);
      expect(scoreService.processGameResult).toHaveBeenCalledWith(
        'user1',
        GameResult.DRAW,
      );
    });

    it('should not call scoreService if no result yet', async () => {
      const board = Array(9).fill(null);

      const result = await gameService.play('user1', board, 0);

      expect(result.result).toBeNull();
      expect(scoreService.processGameResult).not.toHaveBeenCalled();
    });
  });
});
