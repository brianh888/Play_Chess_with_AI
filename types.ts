
export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  address: string; // e.g., 'a1'
  piece: Piece | null;
}

export enum Difficulty {
  BEGINNER = 'Beginner',
  GRANDMASTER = 'Grandmaster'
}

export interface GameState {
  fen: string;
  turn: PieceColor;
  isCheck: boolean;
  isGameOver: boolean;
  winner: PieceColor | 'draw' | null;
  moveHistory: string[];
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

export interface Advice {
  move: string;
  explanation: string;
  from?: string;
  to?: string;
}
