import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { User } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayMoveDto } from './dto/play-move.dto';
import { GameService } from './game.service';

@ApiTags('Game')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({ summary: 'Play Tic Tac Toe against bot' })
  @ApiResponse({ status: 201, example: { board: [], result: null } })
  @Post('play')
  play(@CurrentUser() user: User, @Body() dto: PlayMoveDto) {
    return this.gameService.play(user.id, dto.board, dto.position);
  }
}
