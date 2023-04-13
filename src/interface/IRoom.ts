import IChecker from "./IChecker";

interface IRoom {
  roomId: string;
  players: Array<string>;
  checkers: Array<Array<IChecker>>;
}

export default IRoom;
