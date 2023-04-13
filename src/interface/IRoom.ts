import IChecker from "./IChecker";

interface IRoom {
  roomId: string;
  players: Array<string>;
  checkers: Array<Array<IChecker>>;
  checkersCount: number;
  gameOver: boolean;
}

export default IRoom;
