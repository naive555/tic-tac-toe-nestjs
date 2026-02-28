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
  @IsArray()
  @ArrayMinSize(9)
  @ArrayMaxSize(9)
  board: GameMark[];

  @IsNumber()
  @Min(0)
  @Max(8)
  position: number;
}
