export type GameId = string;
export type UserId = string;
export type BoardValue = "X" | "O" | null;

export type Game = {
  id: GameId;
  player1: UserId;
  player2: UserId | null;
  state: BoardState;
  outcome: GameOutcome | null;
  turn: UserId;
  winner?: UserId;
};

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export type BoardState = Array<BoardValue>;
// Gender
export enum GameOutcome {
  WIN = "WIN",
  TIE = "TIE",
  IN_PROGRESS = "IN_PROGRESS",
}
