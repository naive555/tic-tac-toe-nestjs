import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Difficulty, User } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayMoveDto, StartGameDto } from './dto/play-move.dto';
import { GameService } from './game.service';

@ApiTags('Game')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({ summary: 'Start a new Tic Tac Toe game' })
  @ApiResponse({
    status: 201,
    description: 'Game created',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      difficulty: Difficulty.MEDIUM,
      board: Array(9).fill(null),
      result: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  })
  @Post('start')
  start(@CurrentUser() user: User, @Body() dto: StartGameDto) {
    return this.gameService.startGame(user.id, dto.difficulty);
  }

  @ApiOperation({ summary: 'Make a move' })
  @ApiResponse({
    status: 201,
    description: 'Move applied',
    example: {
      board: ['X', null, null, null, 'O', null, null, null, null],
      result: null,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid move / Game already finished',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Game not found' })
  @Post(':id/move')
  move(
    @CurrentUser() user: User,
    @Param('id') gameId: string,
    @Body() dto: PlayMoveDto,
  ) {
    return this.gameService.move(user.id, gameId, dto.position);
  }
}
