import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GameService } from './game.service';
import { PrismaService } from '../prisma.service';
import { ScoreService } from '../score/score.service';
import { GameResult } from '../../generated/prisma/enums';
import { GameMark } from './enums/game.enums';

describe('GameService', () => {
  let service: GameService;
  let prisma: PrismaService;
  let scoreService: ScoreService;

  const mockPrisma = {
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

  const emptyBoard = (): GameMark[] => Array(9).fill(null);

  it('should throw if board length is invalid', async () => {
    await expect(service.play('user-1', [null], 0)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if position out of range', async () => {
    await expect(service.play('user-1', emptyBoard(), 99)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if position already taken', async () => {
    const board = emptyBoard();
    board[0] = GameMark.X;

    await expect(service.play('user-1', board, 0)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should return WIN when player completes row', async () => {
    const board = emptyBoard();
    board[0] = GameMark.X;
    board[1] = GameMark.X;

    mockPrisma.$transaction.mockResolvedValue(undefined);

    const result = await service.play('user-1', board, 2);

    expect(result.result).toBe(GameResult.WIN);
  });

  it('should return DRAW when board full with no winner', async () => {
    const board: GameMark[] = [
      GameMark.X,
      GameMark.O,
      GameMark.X,
      GameMark.X,
      GameMark.O,
      GameMark.O,
      GameMark.O,
      GameMark.X,
      null,
    ];

    mockPrisma.$transaction.mockResolvedValue(undefined);

    const result = await service.play('user-1', board, 8);

    expect(result.result).toBe(GameResult.DRAW);
  });

  it('should continue game when no winner', async () => {
    const board = emptyBoard();

    const result = await service.play('user-1', board, 0);

    expect(result.result).toBeNull();
    expect(result.board[0]).toBe(GameMark.X);
  });

  it('should call transaction when game finished', async () => {
    const board = emptyBoard();
    board[0] = GameMark.X;
    board[1] = GameMark.X;

    mockPrisma.$transaction.mockImplementation(async (cb) =>
      cb({
        game: { create: jest.fn() },
        score: {
          upsert: jest.fn().mockResolvedValue({
            score: 1,
            winStreak: 1,
          }),
          update: jest.fn(),
        },
      }),
    );

    mockScoreService.calculateScore.mockReturnValue({
      score: 2,
      streak: 0,
    });

    await service.play('user-1', board, 2);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(scoreService.calculateScore).toHaveBeenCalled();
  });
});
