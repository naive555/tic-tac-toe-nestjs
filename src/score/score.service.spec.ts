import { Test, TestingModule } from '@nestjs/testing';
import { ScoreService } from './score.service';
import { PrismaService } from '../prisma.service';
import { GameResult } from '../../generated/prisma/enums';

describe('ScoreService', () => {
  let service: ScoreService;
  let prisma: {
    $transaction: jest.Mock;
    score: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      score: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
  });

  describe('processGameResult', () => {
    it('should increase score and streak on WIN', async () => {
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          score: {
            upsert: jest.fn().mockResolvedValue({
              userId: 'u1',
              score: 0,
              winStreak: 0,
            }),
            update: jest.fn().mockResolvedValue({
              userId: 'u1',
              score: 1,
              winStreak: 1,
            }),
          },
        };
        return callback(tx);
      });

      const result = await service.processGameResult('u1', GameResult.WIN);

      expect(result.score).toBe(1);
      expect(result.winStreak).toBe(1);
    });

    it('should give bonus point on 3rd WIN streak', async () => {
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          score: {
            upsert: jest.fn().mockResolvedValue({
              userId: 'u1',
              score: 2,
              winStreak: 2,
            }),
            update: jest.fn().mockResolvedValue({
              userId: 'u1',
              score: 4, // +1 win +1 bonus
              winStreak: 0,
            }),
          },
        };
        return callback(tx);
      });

      const result = await service.processGameResult('u1', GameResult.WIN);

      expect(result.score).toBe(4);
      expect(result.winStreak).toBe(0);
    });

    it('should decrease score and reset streak on LOSE', async () => {
      prisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          score: {
            upsert: jest.fn().mockResolvedValue({
              userId: 'u1',
              score: 5,
              winStreak: 2,
            }),
            update: jest.fn().mockResolvedValue({
              userId: 'u1',
              score: 4,
              winStreak: 0,
            }),
          },
        };
        return callback(tx);
      });

      const result = await service.processGameResult('u1', GameResult.LOSE);

      expect(result.score).toBe(4);
      expect(result.winStreak).toBe(0);
    });
  });

  describe('getMyScore', () => {
    it('should return user score', async () => {
      prisma.score.findUnique.mockResolvedValue({
        userId: 'u1',
        score: 10,
        winStreak: 1,
      });

      const result = await service.getMyScore('u1');

      expect(prisma.score.findUnique).toHaveBeenCalledWith({
        where: { userId: 'u1' },
      });
      expect(result.score).toBe(10);
    });
  });

  describe('getAllScores', () => {
    it('should return ordered scores with user email', async () => {
      prisma.score.findMany.mockResolvedValue([
        {
          userId: 'u1',
          score: 10,
          user: { email: 'test@mail.com' },
        },
      ]);

      const result = await service.getAllScores();

      expect(prisma.score.findMany).toHaveBeenCalledWith({
        include: {
          user: {
            select: { email: true },
          },
        },
        orderBy: {
          score: 'desc',
        },
      });

      expect(result[0].score).toBe(10);
    });
  });
});
