import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Max, Min } from 'class-validator';

import { Difficulty } from '../../../generated/prisma/enums';

export class StartGameDto {
  @ApiProperty({ enum: Difficulty, default: Difficulty.MEDIUM })
  @IsEnum(Difficulty)
  difficulty: Difficulty = Difficulty.MEDIUM;
}

export class PlayMoveDto {
  @ApiProperty({
    description: 'Position to play (0-8)',
    minimum: 0,
    maximum: 8,
    example: 4,
  })
  @IsNumber()
  @Min(0)
  @Max(8)
  position: number;
}
