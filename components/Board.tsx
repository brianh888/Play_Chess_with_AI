
import React, { useState, useMemo } from 'react';
import { COLUMNS, ROWS } from '../constants';
import Piece from './Piece';
import { PieceColor } from '../types';

interface BoardProps {
  gameState: any; // Chess logic instance
  playerColor: PieceColor;
  onMove: (from: string, to: string) => void;
  isAiThinking: boolean;
  suggestedMove?: { from: string; to: string } | null;
}

const Board: React.FC<BoardProps> = ({ gameState, playerColor, onMove, isAiThinking, suggestedMove }) => {
  const [sourceSquare, setSourceSquare] = useState<string | null>(null);
  const [dragOverSquare, setDragOverSquare] = useState<string | null>(null);

  const boardData = gameState.getBoard();
  const currentTurn = gameState.getTurn();
  const isPlayerTurn = currentTurn === playerColor && !isAiThinking;

  // Calculate legal moves for the piece being dragged
  const legalMovesForSource = useMemo(() => {
    if (!sourceSquare || !isPlayerTurn) return [];
    return gameState.getLegalMoves(sourceSquare);
  }, [sourceSquare, gameState, isPlayerTurn]);

  // Track the last move to highlight it
  const history = gameState.getHistory({ verbose: true });
  const lastMove = history.length > 0 ? history[history.length - 1] : null;

  const handleDragStart = (square: string) => {
    setSourceSquare(square);
  };

  const handleDragOver = (e: React.DragEvent, square: string) => {
    e.preventDefault();
    if (square !== dragOverSquare) {
      setDragOverSquare(square);
    }
  };

  const handleDrop = (e: React.DragEvent, targetSquare: string) => {
    e.preventDefault();
    const from = e.dataTransfer.getData('sourceSquare');
    if (from && from !== targetSquare) {
      onMove(from, targetSquare);
    }
    setSourceSquare(null);
    setDragOverSquare(null);
  };

  const renderSquares = () => {
    const squares = [];
    const displayRows = playerColor === 'w' ? ROWS : [...ROWS].reverse();
    const displayCols = playerColor === 'w' ? COLUMNS : [...COLUMNS].reverse();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const rowIdx = playerColor === 'w' ? r : 7 - r;
        const colIdx = playerColor === 'w' ? c : 7 - c;
        
        const piece = boardData[rowIdx][colIdx];
        const squareAddress = `${COLUMNS[colIdx]}${ROWS[rowIdx]}`;
        const isBlack = (rowIdx + colIdx) % 2 !== 0;
        
        const isHighlighted = dragOverSquare === squareAddress;
        
        // Check if this square is a legal destination for the current drag
        const isLegalTarget = legalMovesForSource.some((m: any) => m.to === squareAddress);
        
        // Highlight last move squares
        const isLastMoveFrom = lastMove?.from === squareAddress;
        const isLastMoveTo = lastMove?.to === squareAddress;

        // Highlight suggested move squares
        const isSuggestedFrom = suggestedMove?.from === squareAddress;
        const isSuggestedTo = suggestedMove?.to === squareAddress;

        squares.push(
          <div
            key={squareAddress}
            onDragOver={(e) => handleDragOver(e, squareAddress)}
            onDrop={(e) => handleDrop(e, squareAddress)}
            className={`
              relative w-full aspect-square flex items-center justify-center
              ${isBlack ? 'chess-square-black' : 'chess-square-white'}
              ${isHighlighted ? 'ring-4 ring-inset ring-indigo-400 z-10' : ''}
              ${(isLastMoveFrom || isLastMoveTo) ? 'bg-yellow-400/20' : ''}
              ${isSuggestedFrom ? 'bg-emerald-500/30' : ''}
              ${isSuggestedTo ? 'bg-emerald-500/50' : ''}
            `}
          >
            {/* Coordinates */}
            {c === 0 && (
              <span className={`absolute left-0.5 top-0.5 text-[10px] font-bold ${isBlack ? 'text-slate-400' : 'text-slate-500'}`}>
                {ROWS[rowIdx]}
              </span>
            )}
            {r === 7 && (
              <span className={`absolute right-0.5 bottom-0.5 text-[10px] font-bold ${isBlack ? 'text-slate-400' : 'text-slate-500'}`}>
                {COLUMNS[colIdx]}
              </span>
            )}

            {/* Hint Markers */}
            {(isSuggestedFrom || isSuggestedTo) && (
              <div className="absolute inset-0 ring-4 ring-emerald-400/60 ring-inset animate-pulse z-0 pointer-events-none" />
            )}

            {/* Legal Move Indicator Dot */}
            {isLegalTarget && (
              <div className={`absolute w-3 h-3 rounded-full pointer-events-none z-20 ${piece ? 'ring-4 ring-slate-400/50' : 'bg-slate-400/30'}`} />
            )}

            {piece && (
              <Piece
                piece={piece}
                square={squareAddress}
                onDragStart={handleDragStart}
                isDraggable={isPlayerTurn && piece.color === playerColor}
              />
            )}
          </div>
        );
      }
    }
    return squares;
  };

  return (
    <div className="board-container w-full max-w-[600px] aspect-square mx-auto">
      <div className="board-inner grid grid-cols-8 border-4 border-slate-800 rounded shadow-2xl overflow-hidden">
        {renderSquares()}
      </div>
    </div>
  );
};

export default Board;
