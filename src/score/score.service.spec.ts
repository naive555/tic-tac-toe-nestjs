import { Test, TestingModule } from '@nestjs/testing';
import { ScoreService } from './score.service';
import { PrismaService } from '../prisma.service';
import { GameResult } from '../../generated/prisma/enums';

describe('ScoreService', () => {
  let service: ScoreService;
  let prisma: PrismaService;

  const mockPrisma = {
    score: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoreService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ScoreService>(ScoreService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('calculateScore', () => {
    it('should increase score and streak on WIN', () => {
      const result = service.calculateScore(5, 1, GameResult.WIN);

      expect(result).toEqual({
        score: 6,
        streak: 2,
      });
    });

    it('should give bonus point and reset streak on 3 consecutive wins', () => {
      const result = service.calculateScore(5, 2, GameResult.WIN);

      expect(result).toEqual({
        score: 7, // +1 win +1 bonus
        streak: 0,
      });
    });

    it('should decrease score and reset streak on LOSE', () => {
      const result = service.calculateScore(5, 2, GameResult.LOSE);

      expect(result).toEqual({
        score: 4,
        streak: 0,
      });
    });

    it('should not change anything on DRAW', () => {
      const result = service.calculateScore(5, 2, GameResult.DRAW);

      expect(result).toEqual({
        score: 5,
        streak: 2,
      });
    });
  });

  describe('getMyScore', () => {
    it('should call prisma.findUnique with correct userId', async () => {
      mockPrisma.score.findUnique.mockResolvedValue({ score: 10 });

      const result = await service.getMyScore('user-1');

      expect(prisma.score.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });

      expect(result).toEqual({ score: 10 });
    });
  });

  describe('getAllScores', () => {
    it('should call prisma.findMany with include and orderBy', async () => {
      mockPrisma.score.findMany.mockResolvedValue([]);

      await service.getAllScores();

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
    });
  });
});
