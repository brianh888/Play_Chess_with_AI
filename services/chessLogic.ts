
import { Chess, Move } from 'chess.js';

export class ChessLogic {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  getFen(): string {
    return this.game.fen();
  }

  getTurn(): 'w' | 'b' {
    return this.game.turn();
  }

  getBoard() {
    return this.game.board();
  }

  getLegalMoves(square?: string) {
    // Chess.js expects square address if provided
    return this.game.moves({ square: square as any, verbose: true });
  }

  makeMove(move: string | { from: string; to: string; promotion?: string }): Move | null {
    try {
      return this.game.move(move);
    } catch (e) {
      return null;
    }
  }

  isCheck(): boolean {
    return this.game.inCheck();
  }

  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  getWinner(): 'w' | 'b' | 'draw' | null {
    if (!this.game.isGameOver()) return null;
    if (this.game.isCheckmate()) return this.game.turn() === 'w' ? 'b' : 'w';
    return 'draw';
  }

  undo() {
    return this.game.undo();
  }

  reset() {
    this.game.reset();
  }

  getHistory(options?: { verbose: boolean }) {
    if (options?.verbose) {
      return this.game.history({ verbose: true });
    }
    return this.game.history();
  }
}
