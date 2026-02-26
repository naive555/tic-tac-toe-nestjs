import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { ScoreService } from '../score/score.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GameController],
  providers: [GameService, ScoreService, PrismaService],
})
export class GameModule {}
