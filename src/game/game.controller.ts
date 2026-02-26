import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/auth.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayMoveDto } from './dto/play-move.dto';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(JwtAuthGuard)
  @Post('play')
  play(@CurrentUser() user: any, @Body() dto: PlayMoveDto) {
    return this.gameService.play(user.id, dto.board, dto.position);
  }
}
