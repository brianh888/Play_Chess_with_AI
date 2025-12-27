
import React from 'react';
import { PIECE_ASSETS } from '../constants';
import { Piece as PieceType } from '../types';

interface PieceProps {
  piece: PieceType;
  square: string;
  onDragStart: (square: string) => void;
  isDraggable: boolean;
}

const Piece: React.FC<PieceProps> = ({ piece, square, onDragStart, isDraggable }) => {
  const pieceKey = `${piece.color}-${piece.type}`;
  const asset = PIECE_ASSETS[pieceKey];

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }
    onDragStart(square);
    // Create a ghost image if needed, but default is fine
    e.dataTransfer.setData('sourceSquare', square);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={`w-full h-full flex items-center justify-center p-1 piece-3d ${
        isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      <div className="w-10 h-10 md:w-14 md:h-14 piece-shadow">
        {asset}
      </div>
    </div>
  );
};

export default Piece;
