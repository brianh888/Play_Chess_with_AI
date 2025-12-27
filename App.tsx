
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChessLogic } from './services/chessLogic';
import { getGeminiMove, getGeminiAdvice } from './services/geminiService';
import { Difficulty, PieceColor, Advice } from './types';
import Board from './components/Board';
import Showcase from './components/Showcase';
import { Trophy, RotateCcw, Settings, BrainCircuit, User, Lightbulb, Sparkles, Loader2, Undo2, Presentation, AlertCircle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [game, setGame] = useState(new ChessLogic());
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isFetchingAdvice, setIsFetchingAdvice] = useState(false);
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showShowcase, setShowShowcase] = useState(false);
  
  // Guard to prevent double-calling AI for the same board state
  const processingFenRef = useRef<string>("");
  const [tick, setTick] = useState(0);

  const forceUpdate = useCallback(() => {
    setTick(t => t + 1);
    setAdvice(null);
  }, []);

  const handleAiMove = useCallback(async () => {
    const currentFen = game.getFen();

    // STRICT GUARD: If we are already processing this EXACT board state, do not fire again.
    if (isAiThinking || game.isGameOver() || processingFenRef.current === currentFen) return;
    
    setIsAiThinking(true);
    setError(null);
    processingFenRef.current = currentFen; // Lock this FEN

    try {
      const moveSan = await getGeminiMove(currentFen, difficulty);
      
      const moveResult = game.makeMove(moveSan);
      
      if (!moveResult) {
        throw new Error("Invalid SAN returned by AI");
      }
      forceUpdate();

    } catch (err: any) {
      console.error("AI Move failed", err);
      // Clear the lock so we aren't stuck forever
      processingFenRef.current = "";

      // --- FALLBACK MECHANISM ---
      // If AI times out or fails, play a random legal move so the game continues.
      const legalMoves = game.getLegalMoves();
      
      if (legalMoves.length > 0) {
        const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        game.makeMove(randomMove);
        
        // Suppress UI error for fallback moves to keep interface clean
        console.warn("AI Timeout/Error. Played fallback move silently.");
        forceUpdate();
      } else {
        // This usually means Checkmate or Stalemate was reached during thinking
        setError("Game ended.");
      }

    } finally {
      setIsAiThinking(false);
    }
  }, [game, difficulty, isAiThinking, forceUpdate]);

  const handleGetAdvice = async () => {
    if (isFetchingAdvice || isAiThinking || game.isGameOver()) return;
    
    setIsFetchingAdvice(true);
    setError(null);
    try {
      const hint = await getGeminiAdvice(game.getFen());
      const testMove = game.makeMove(hint.move);
      if (testMove) {
        hint.from = testMove.from;
        hint.to = testMove.to;
        game.undo();
      }
      setAdvice(hint);
    } catch (err: any) {
      setError("Strategy engine is offline. Check your credentials.");
    } finally {
      setIsFetchingAdvice(false);
    }
  };

  useEffect(() => {
    if (!isGameStarted) return;
    
    const isAiTurn = game.getTurn() !== playerColor;
    if (isAiTurn && !game.isGameOver() && !isAiThinking) {
      // Small delay for UX, but the Ref guard in handleAiMove prevents double execution
      const timer = setTimeout(() => handleAiMove(), 500);
      return () => clearTimeout(timer);
    }
  }, [tick, playerColor, isGameStarted, isAiThinking, game, handleAiMove]);

  const onPlayerMove = (from: string, to: string) => {
    if (isAiThinking || game.isGameOver()) return;
    const move = game.makeMove({ from, to, promotion: 'q' });
    if (move) {
      forceUpdate();
    }
  };

  const handleUndo = () => {
    if (isAiThinking) return;
    const turn = game.getTurn();
    if (turn !== playerColor) {
      game.undo();
    } else {
      game.undo();
      game.undo();
    }
    // Clear the lock so AI can play this turn again if we undid to it
    processingFenRef.current = ""; 
    forceUpdate();
  };

  const resetGame = () => {
    game.reset();
    setIsGameStarted(true);
    setError(null);
    setIsAiThinking(false);
    setAdvice(null);
    processingFenRef.current = ""; // Clear lock
    forceUpdate();
  };

  const toggleDifficulty = () => {
    setDifficulty(prev => prev === Difficulty.BEGINNER ? Difficulty.GRANDMASTER : Difficulty.BEGINNER);
  };

  if (!isGameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 text-slate-100">
        <div className="bg-slate-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-700/50 text-center">
          <h1 className="text-5xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Grandmaster AI</h1>
          <p className="text-slate-400 mb-10 text-lg">Challenge a world-class AI in a premium 3D chess arena.</p>
          
          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center p-5 bg-slate-700/50 rounded-2xl border border-white/5">
              <span className="text-slate-200 font-bold">Play As</span>
              <div className="flex bg-slate-900/50 rounded-xl p-1.5 border border-white/5">
                <button 
                  onClick={() => setPlayerColor('w')}
                  className={`px-5 py-2.5 rounded-lg transition-all font-bold ${playerColor === 'w' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-500 hover:text-white'}`}
                >
                  White
                </button>
                <button 
                  onClick={() => setPlayerColor('b')}
                  className={`px-5 py-2.5 rounded-lg transition-all font-bold ${playerColor === 'b' ? 'bg-slate-700 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                >
                  Black
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-5 bg-slate-700/50 rounded-2xl border border-white/5">
              <span className="text-slate-200 font-bold">Challenge Level</span>
              <button 
                onClick={toggleDifficulty}
                className="flex items-center gap-2.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 font-bold"
              >
                {difficulty === Difficulty.BEGINNER ? <User size={20} /> : <BrainCircuit size={20} />}
                {difficulty}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => {
                setIsGameStarted(true);
                forceUpdate();
              }}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
            >
              Enter Arena
            </button>
            <button 
              onClick={() => setShowShowcase(true)}
              className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border border-white/5"
            >
              <Presentation size={20} /> Feature Showcase
            </button>
          </div>
        </div>

        {showShowcase && <Showcase onClose={() => setShowShowcase(false)} />}
      </div>
    );
  }

  const winner = game.getWinner();
  const isGameOver = game.isGameOver();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row p-4 md:p-8 gap-8 items-center justify-center overflow-y-auto">
      
      {/* Sidebar Left: Game Status */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6 order-2 lg:order-1">
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-yellow-500/10 rounded-2xl">
              <Trophy className="text-yellow-500" size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Match Info</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
              <span className="text-slate-400 font-medium">Turn</span>
              <span className={`px-4 py-1.5 rounded-xl text-sm font-black shadow-2xl border border-white/10 ${game.getTurn() === 'w' ? 'bg-white text-slate-900' : 'bg-slate-800 text-white'}`}>
                {game.getTurn() === 'w' ? 'White' : 'Black'}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
              <span className="text-slate-400 font-medium">AI Level</span>
              <span className="text-indigo-400 font-black">{difficulty}</span>
            </div>

            {isAiThinking && (
              <div className="flex items-center gap-4 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <BrainCircuit size={24} className="text-indigo-400 animate-spin-slow" />
                <span className="text-sm font-black text-indigo-300 tracking-wider animate-pulse uppercase">AI Strategizing...</span>
              </div>
            )}

            {game.isCheck() && !isGameOver && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-200 px-4 py-3 rounded-2xl text-center font-black tracking-[0.2em] animate-pulse">
                CHECK
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl flex-1 max-h-[350px] overflow-hidden flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-500/10 rounded-2xl">
              <RotateCcw size={24} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Ledger</h2>
          </div>
          <div className="overflow-y-auto space-y-2 flex-1 pr-3 custom-scrollbar">
            {game.getHistory().map((move, i) => (
              <div key={i} className="flex gap-4 py-2.5 border-b border-white/5 text-sm font-mono items-center">
                <span className="text-slate-600 w-8 font-bold text-right">{Math.floor(i / 2) + 1}.</span>
                <span className={`px-3 py-1 rounded-lg ${i % 2 === 0 ? 'bg-white/10 text-white' : 'text-slate-400 font-medium'}`}>{move}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main: Chess Board */}
      <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2 w-full max-w-[650px]">
        {isGameOver && (
          <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="bg-[#1e293b] p-12 rounded-[48px] border border-white/10 shadow-3xl text-center max-w-md w-full scale-in-center">
              <div className="bg-yellow-500/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-yellow-500/30">
                <Trophy size={48} className="text-yellow-500" />
              </div>
              <h2 className="text-5xl font-black text-white mb-4 tracking-tight">Match Over</h2>
              <p className="text-slate-400 text-2xl mb-12 font-medium">
                {winner === 'draw' ? "Stalemate" : `${winner === 'w' ? 'White' : 'Black'} has conquered.`}
              </p>
              <button onClick={resetGame} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xl transition-all shadow-2xl shadow-indigo-500/40 active:scale-95">
                New Conquest
              </button>
            </div>
          </div>
        )}

        <div className="relative w-full p-4">
           <Board 
            gameState={game} 
            playerColor={playerColor} 
            onMove={onPlayerMove}
            isAiThinking={isAiThinking}
            suggestedMove={advice ? { from: advice.from!, to: advice.to! } : null}
          />
          
          {error && (
            <div className="mt-12 animate-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col items-center gap-4 bg-red-500/10 py-6 px-8 rounded-3xl border border-red-500/30 backdrop-blur-md shadow-2xl max-w-md mx-auto">
                <div className="flex items-center gap-3 text-red-400 font-black text-lg">
                  <AlertCircle size={24} />
                  <span>{error.includes("Game ended") ? "Game Status" : "Connection Difficulty"}</span>
                </div>
                <p className="text-center text-sm font-medium leading-relaxed text-red-100/80">
                  {error}
                </p>
                {/* Only show refresh if it wasn't a game-ending fallback event */}
                {!error.includes("Played a fallback move") && !error.includes("Game ended") && (
                  <button 
                    onClick={() => {
                      processingFenRef.current = ""; // Unlock to retry
                      handleAiMove();
                    }}
                    className="flex items-center gap-2.5 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-black text-white transition-all active:scale-95 shadow-lg shadow-red-500/30"
                  >
                    <RefreshCw size={16} /> Re-establish Link
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Right: Controls & AI Strategist */}
      <div className="w-full lg:w-1/4 flex flex-col gap-6 order-3">
        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-yellow-400/10 rounded-2xl">
              <Lightbulb className="text-yellow-400" size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">AI Advisor</h2>
          </div>
          <div className="space-y-6">
            {advice && (
              <div className="p-5 bg-slate-950/80 rounded-2xl border border-emerald-500/30 shadow-inner animate-in fade-in zoom-in-95 duration-500">
                <span className="text-emerald-400 font-black block mb-3 text-xs uppercase tracking-[0.2em]">Optimal Line: {advice.move}</span>
                <p className="text-slate-200 text-sm font-medium italic leading-relaxed">"{advice.explanation}"</p>
              </div>
            )}
            <button 
              onClick={handleGetAdvice}
              disabled={isFetchingAdvice || isAiThinking || game.getTurn() !== playerColor}
              className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                isFetchingAdvice 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 active:scale-95'
              }`}
            >
              {isFetchingAdvice ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={22} />}
              {isFetchingAdvice ? 'Consulting...' : 'Request Insight'}
            </button>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-500/10 rounded-2xl">
              <Settings className="text-slate-300" size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Commands</h2>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleUndo}
                disabled={isAiThinking || game.getHistory().length === 0}
                className="py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 border border-white/5"
              >
                <Undo2 size={20} /> Undo
              </button>
              <button 
                onClick={resetGame}
                className="py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 border border-white/5"
              >
                <RotateCcw size={20} /> Reset
              </button>
            </div>
            <button 
              onClick={toggleDifficulty}
              className="w-full py-4 bg-indigo-900/40 border border-indigo-500/40 text-indigo-100 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-900/60 transition-all shadow-lg"
            >
              <BrainCircuit size={20} /> Mode: {difficulty}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
