
import React from 'react';

export const COLUMNS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const ROWS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const PieceBase = ({ color, children, id }: { color: 'w' | 'b', children?: React.ReactNode, id: string }) => (
  <svg viewBox="0 0 45 45" className="w-full h-full">
    <defs>
      <linearGradient id={`grad-${id}`} x1="0%" x2="100%" y1="0%" y2="100%">
        {color === 'w' ? (
          <>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
          </>
        ) : (
          <>
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="40%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </>
        )}
      </linearGradient>
      <filter id={`glow-${id}`}>
        <feGaussianBlur stdDeviation="0.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g 
      fill={`url(#grad-${id})`} 
      stroke={color === 'w' ? '#64748b' : '#94a3b8'} 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ filter: `url(#glow-${id})` }}
    >
      {children}
    </g>
  </svg>
);

export const PIECE_ASSETS: Record<string, React.ReactElement> = {
  'w-p': (
    <PieceBase color="w" id="wp">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
    </PieceBase>
  ),
  'w-r': (
    <PieceBase color="w" id="wr">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
      <path d="M34 14l-3 3H14l-3-3" />
      <path d="M31 17v12.5l-2 1.5H16l-2-1.5V17" />
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
      <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
    </PieceBase>
  ),
  'w-n': (
    <PieceBase color="w" id="wn">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
      <path d="M24 18c.38 2.43-4.63 1.85-5 3-.38 1.15 2.13 1.85 3 3 1.15 1.54-2.31 1.92-2 3.5.31 1.58 2.69 1.15 3 3" />
      <path d="M9.5 25.5A.5.5 0 1 1 9 25.5a.5.5 0 1 1 .5 0z" />
      <path d="M15 15.5c4.5 2 7 14 7 14" />
    </PieceBase>
  ),
  'w-b': (
    <PieceBase color="w" id="wb">
      <g strokeLinecap="butt">
        <path d="M9 36c3.39-.97 10.11.3 13.5-2 3.39 2.3 10.11 1.03 13.5 2 0 0 0 3-13.5 3S9 36 9 36z" />
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
      </g>
      <path d="M17.5 26h10M15 30h15" fill="none" />
    </PieceBase>
  ),
  'w-q': (
    <PieceBase color="w" id="wq">
      <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z" />
      <path d="M9 26c0 2 1.5 2 2.5 4 2.5 4 2.5 10 2.5 10h22s0-6 2.5-10c1-2 2.5-2 2.5-4 0 0-5-2-15-2s-15 2-15 2z" />
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
    </PieceBase>
  ),
  'w-k': (
    <PieceBase color="w" id="wk">
      <path d="M22.5 11.63V6M20 8h5" fill="none" />
      <path d="M22.5 25s4.5-7.5 3-10c-1.5-2.5-6-2.5-6 0-1.5 2.5 3 10 3 10z" />
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-4-1-4s-3 3-3.5 3c-1 0-1.5-1.5-1.5-1.5s-1.5 1.5-2 1.5c-.5 0-3-3-3-3s0 3-1 3c-1 0-1-1-1-1s-.5 1-1 1c-1 0-2-2-2-2s-1 2-2 2c-.5 0-1-1-1-1s0 1-1 1c-1 0-3-3-3-3s-2 3-3 3c-.5 0-2-1.5-2-1.5s.5 2-3.5 3c-3 6 6 10.5 6 10.5v7z" />
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" />
    </PieceBase>
  ),
  'b-p': (
    <PieceBase color="b" id="bp">
      <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
    </PieceBase>
  ),
  'b-r': (
    <PieceBase color="b" id="br">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
      <path d="M34 14l-3 3H14l-3-3" />
      <path d="M31 17v12.5l-2 1.5H16l-2-1.5V17" />
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
      <path d="M11 14h23" fill="none" strokeLinejoin="miter" />
    </PieceBase>
  ),
  'b-n': (
    <PieceBase color="b" id="bn">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
      <path d="M24 18c.38 2.43-4.63 1.85-5 3-.38 1.15 2.13 1.85 3 3 1.15 1.54-2.31 1.92-2 3.5.31 1.58 2.69 1.15 3 3" />
      <path d="M9.5 25.5A.5.5 0 1 1 9 25.5a.5.5 0 1 1 .5 0z" />
      <path d="M15 15.5c4.5 2 7 14 7 14" />
    </PieceBase>
  ),
  'b-b': (
    <PieceBase color="b" id="bb">
      <g strokeLinecap="butt">
        <path d="M9 36c3.39-.97 10.11.3 13.5-2 3.39 2.3 10.11 1.03 13.5 2 0 0 0 3-13.5 3S9 36 9 36z" />
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
      </g>
      <path d="M17.5 26h10M15 30h15" fill="none" />
    </PieceBase>
  ),
  'b-q': (
    <PieceBase color="b" id="bq">
      <path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM11 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM38 20a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-13.5V25l-7-11 2 12z" />
      <path d="M9 26c0 2 1.5 2 2.5 4 2.5 4 2.5 10 2.5 10h22s0-6 2.5-10c1-2 2.5-2 2.5-4 0 0-5-2-15-2s-15 2-15 2z" />
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
    </PieceBase>
  ),
  'b-k': (
    <PieceBase color="b" id="bk">
      <path d="M22.5 11.63V6M20 8h5" fill="none" />
      <path d="M22.5 25s4.5-7.5 3-10c-1.5-2.5-6-2.5-6 0-1.5 2.5 3 10 3 10z" />
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-1-4-1-4s-3 3-3.5 3c-1 0-1.5-1.5-1.5-1.5s-1.5 1.5-2 1.5c-.5 0-3-3-3-3s0 3-1 3c-1 0-1-1-1-1s-.5 1-1 1c-1 0-2-2-2-2s-1 2-2 2c-.5 0-1-1-1-1s0 1-1 1c-1 0-3-3-3-3s-2 3-3 3c-.5 0-2-1.5-2-1.5s.5 2-3.5 3c-3 6 6 10.5 6 10.5v7z" />
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" />
    </PieceBase>
  ),
};
