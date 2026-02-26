import { GameMark } from '../enums/game.enums';

export class PlayMoveDto {
  board: GameMark[]; // lenght: 9
  position: number; // 0-8
}
