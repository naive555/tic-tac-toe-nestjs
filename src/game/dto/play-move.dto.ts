import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { GameMark } from '../enums/game.enums';

export class PlayMoveDto {
  @ApiProperty({
    description: 'Board state (9 cells, index 0-8)',
    enum: GameMark,
    isArray: true,
    minItems: 9,
    maxItems: 9,
    example: [
      GameMark.O,
      GameMark.X,
      null,
      null,
      null,
      GameMark.X,
      null,
      GameMark.O,
      null,
    ],
  })
  @IsArray()
  @ArrayMinSize(9)
  @ArrayMaxSize(9)
  board: GameMark[];

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
