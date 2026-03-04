import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GameResult, Difficulty } from '../../generated/prisma/enums';
import { ScoreService } from '../score/score.service';
import { PrismaService } from '../prisma.service';
import { GameMark } from './enums/game.enums';
import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;
  let prisma: PrismaService;
  let scoreService: ScoreService;

  const mockPrisma = {
    game: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    score: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockScoreService = {
    calculateScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ScoreService, useValue: mockScoreService },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
    prisma = module.get<PrismaService>(PrismaService);
    scoreService = module.get<ScoreService>(ScoreService);

    jest.clearAllMocks();
  });

  const emptyBoard = () => Array(9).fill('');

  describe('startGame', () => {
    it('should create a new game', async () => {
      const expected = { id: 'game-1', board: emptyBoard(), result: null };
      mockPrisma.game.create.mockResolvedValue(expected);

      const result = await service.startGame('user-1', Difficulty.MEDIUM);

      expect(prisma.game.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          difficulty: Difficulty.MEDIUM,
          board: emptyBoard(),
        },
      });
      expect(result).toEqual(expected);
    });
  });

  describe('move', () => {
    const mockGame = (overrides = {}) => ({
      id: 'game-1',
      userId: 'user-1',
      board: emptyBoard(),
      result: null,
      difficulty: Difficulty.HARD,
      ...overrides,
    });

    it('should throw NotFoundException if game not found', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(null);

      await expect(service.move('user-1', 'game-1', 0)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if game belongs to another user', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(
        mockGame({ userId: 'user-2' }),
      );

      await expect(service.move('user-1', 'game-1', 0)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if game already finished', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(
        mockGame({ result: GameResult.WIN }),
      );

      await expect(service.move('user-1', 'game-1', 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if position already taken', async () => {
      const board = emptyBoard();
      board[0] = GameMark.X;
      mockPrisma.game.findUnique.mockResolvedValue(mockGame({ board }));

      await expect(service.move('user-1', 'game-1', 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update board and return null result when game continues', async () => {
      mockPrisma.game.findUnique.mockResolvedValue(mockGame());
      mockPrisma.game.update.mockResolvedValue(undefined);

      const result = await service.move('user-1', 'game-1', 4);

      expect(result.board[4]).toBe(GameMark.X);
      expect(result.result).toBeNull();
      expect(prisma.game.update).toHaveBeenCalled();
    });

    it('should return WIN when player completes a row', async () => {
      const board = emptyBoard();
      board[0] = GameMark.X;
      board[1] = GameMark.X;
      board[3] = GameMark.O;
      board[4] = GameMark.O;
      board[5] = GameMark.X;
      board[6] = GameMark.X;
      board[7] = GameMark.O;
      board[8] = GameMark.O;

      mockPrisma.game.findUnique.mockResolvedValue(mockGame({ board }));
      mockPrisma.$transaction.mockImplementation(async (cb) =>
        cb({
          game: { update: jest.fn() },
          score: {
            upsert: jest.fn().mockResolvedValue({ score: 0, winStreak: 0 }),
            update: jest.fn(),
          },
        }),
      );
      mockScoreService.calculateScore.mockReturnValue({ score: 10, streak: 1 });

      const result = await service.move('user-1', 'game-1', 2);

      expect(result.result).toBe(GameResult.WIN);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(scoreService.calculateScore).toHaveBeenCalled();
    });

    it('should return DRAW when board is full with no winner', async () => {
      const board: (GameMark | '')[] = [
        GameMark.X,
        GameMark.O,
        GameMark.X,
        GameMark.X,
        GameMark.O,
        GameMark.O,
        GameMark.O,
        GameMark.X,
        '',
      ];

      mockPrisma.game.findUnique.mockResolvedValue(mockGame({ board }));
      mockPrisma.$transaction.mockImplementation(async (cb) =>
        cb({
          game: { update: jest.fn() },
          score: {
            upsert: jest.fn().mockResolvedValue({ score: 0, winStreak: 0 }),
            update: jest.fn(),
          },
        }),
      );
      mockScoreService.calculateScore.mockReturnValue({ score: 0, streak: 0 });

      const result = await service.move('user-1', 'game-1', 8);

      expect(result.result).toBe(GameResult.DRAW);
    });
  });
});
