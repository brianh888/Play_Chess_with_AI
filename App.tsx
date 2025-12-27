
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChessLogic } from './services/chessLogic';
import { getGeminiMove, getGeminiAdvice } from './services/geminiService';
import { Difficulty, PieceColor, Advice } from './types';
import Board from './components/Board';
import Showcase from './components/Showcase';
import { Trophy, RotateCcw, Settings, BrainCircuit, User, Lightbulb, Sparkles, Loader2, Undo2, Presentation, AlertCircle } from 'lucide-react';

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
  
  const aiMoveAttemptRef = useRef<number>(0);
  const [tick, setTick] = useState(0);

  const forceUpdate = useCallback(() => {
    setTick(t => t + 1);
    setAdvice(null);
  }, []);

  const handleAiMove = useCallback(async () => {
    if (isAiThinking || game.isGameOver()) return;
    
    // Safety check for API Key before calling the service
    if (!process.env.API_KEY || process.env.API_KEY === "") {
      setError("API Key not found. If you just added it to .env, please RESTART your dev server.");
      return;
    }

    setIsAiThinking(true);
    setError(null);
    const currentAttempt = ++aiMoveAttemptRef.current;

    try {
      const moveSan = await getGeminiMove(game.getFen(), difficulty);
      
      if (currentAttempt !== aiMoveAttemptRef.current) return;

      const moveResult = game.makeMove(moveSan);
      
      if (!moveResult) {
        const legalMoves = game.getLegalMoves();
        if (legalMoves.length > 0) {
          game.makeMove(legalMoves[0]);
        }
      }
      forceUpdate();
    } catch (err: any) {
      console.error("AI Move failed", err);
      const errMsg = err.message || "";
      const upperMsg = errMsg.toUpperCase();
      
      if (upperMsg.includes("401") || upperMsg.includes("UNAUTHORIZED") || upperMsg.includes("API_KEY")) {
        setError("Auth Error: Your API key is invalid or unauthorized.");
      } else if (upperMsg.includes("429")) {
        setError("API Quota exceeded. Please wait a moment.");
      } else {
        setError(`AI Error: ${errMsg || "Failed to fetch move"}`);
      }
    } finally {
      setIsAiThinking(false);
    }
  }, [game, difficulty, isAiThinking, forceUpdate]);

  const handleGetAdvice = async () => {
    if (isFetchingAdvice || isAiThinking || game.isGameOver()) return;
    
    if (!process.env.API_KEY || process.env.API_KEY === "") {
      setError("API Key not found. Please restart your dev server.");
      return;
    }

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
      setError("Strategic advice unavailable right now.");
    } finally {
      setIsFetchingAdvice(false);
    }
  };

  useEffect(() => {
    if (!isGameStarted) return;
    
    const isAiTurn = game.getTurn() !== playerColor;
    if (isAiTurn && !game.isGameOver() && !isAiThinking) {
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
    forceUpdate();
  };

  const resetGame = () => {
    game.reset();
    setIsGameStarted(true);
    setError(null);
    setIsAiThinking(false);
    setAdvice(null);
    forceUpdate();
  };

  const toggleDifficulty = () => {
    setDifficulty(prev => prev === Difficulty.BEGINNER ? Difficulty.GRANDMASTER : Difficulty.BEGINNER);
  };

  const winner = game.getWinner();
  const isGameOver = game.isGameOver();

  if (!isGameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 text-slate-100">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 text-center">
          <h1 className="text-4xl font-bold mb-6 tracking-tight">Grandmaster AI</h1>
          <p className="text-slate-400 mb-8">Play chess against a world-class AI with real-time strategic advice.</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-slate-700 rounded-xl">
              <span className="text-slate-200 font-semibold">Play As</span>
              <div className="flex bg-slate-600 rounded-lg p-1">
                <button 
                  onClick={() => setPlayerColor('w')}
                  className={`px-4 py-2 rounded-md transition-all ${playerColor === 'w' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  White
                </button>
                <button 
                  onClick={() => setPlayerColor('b')}
                  className={`px-4 py-2 rounded-md transition-all ${playerColor === 'b' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Black
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-700 rounded-xl">
              <span className="text-slate-200 font-semibold">Difficulty</span>
              <button 
                onClick={toggleDifficulty}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
              >
                {difficulty === Difficulty.BEGINNER ? <User size={18} /> : <BrainCircuit size={18} />}
                {difficulty}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setIsGameStarted(true);
                forceUpdate();
              }}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95"
            >
              Start Game
            </button>
            <button 
              onClick={() => setShowShowcase(true)}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Presentation size={18} /> Feature Showcase
            </button>
          </div>
        </div>

        {showShowcase && <Showcase onClose={() => setShowShowcase(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row p-4 md:p-8 gap-8 items-center justify-center overflow-y-auto">
      
      <div className="w-full lg:w-1/4 flex flex-col gap-6 order-2 lg:order-1">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-yellow-500" />
            <h2 className="text-xl font-bold">Game Status</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Current Turn</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${game.getTurn() === 'w' ? 'bg-white text-slate-900' : 'bg-slate-950 text-white'}`}>
                {game.getTurn() === 'w' ? 'White' : 'Black'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">AI Opponent</span>
              <span className="text-indigo-400 font-medium">{difficulty}</span>
            </div>

            {isAiThinking && (
              <div className="flex items-center gap-3 py-2 text-indigo-400 animate-pulse">
                <BrainCircuit size={20} className="animate-spin-slow" />
                <span className="text-sm font-semibold tracking-wide">AI is thinking...</span>
              </div>
            )}

            {game.isCheck() && !isGameOver && (
              <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-center font-bold animate-pulse">
                CHECK!
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex-1 max-h-[300px] overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw size={20} className="text-slate-400" />
            <h2 className="text-xl font-bold">Move History</h2>
          </div>
          <div className="overflow-y-auto space-y-1 flex-1 pr-2">
            {game.getHistory().map((move, i) => (
              <div key={i} className="flex gap-4 py-1.5 border-b border-slate-700/50 text-sm font-mono">
                <span className="text-slate-500 w-6">{Math.floor(i / 2) + 1}.</span>
                <span className={`flex-1 ${i % 2 === 0 ? 'text-slate-100' : 'text-slate-400'}`}>{move}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center order-1 lg:order-2 w-full max-w-[600px]">
        {isGameOver && (
          <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-[#1e293b] p-10 rounded-[40px] border border-white/5 shadow-2xl text-center max-w-sm w-full">
              <h2 className="text-4xl font-bold text-white mb-2">Game Over</h2>
              <p className="text-slate-400 text-xl mb-10">
                {winner === 'draw' ? "It's a Draw!" : `${winner === 'w' ? 'White' : 'Black'} wins!`}
              </p>
              <button onClick={resetGame} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-lg">
                Play Again
              </button>
            </div>
          </div>
        )}

        <div className="relative w-full">
           <Board 
            gameState={game} 
            playerColor={playerColor} 
            onMove={onPlayerMove}
            isAiThinking={isAiThinking}
            suggestedMove={advice ? { from: advice.from!, to: advice.to! } : null}
          />
          
          {error && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-red-400 font-medium bg-red-900/20 py-3 px-6 rounded-xl border border-red-500/30">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="text-center text-sm">{error}</span>
              </div>
              <button 
                onClick={() => handleAiMove()}
                className="text-xs text-indigo-400 hover:underline"
              >
                Retry AI Move
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-1/4 flex flex-col gap-6 order-3">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="text-yellow-400" />
            <h2 className="text-xl font-bold">AI Strategist</h2>
          </div>
          <div className="space-y-4">
            {advice && (
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <span className="text-emerald-400 font-bold block mb-1">Move: {advice.move}</span>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{advice.explanation}"</p>
              </div>
            )}
            <button 
              onClick={handleGetAdvice}
              disabled={isFetchingAdvice || isAiThinking || game.getTurn() !== playerColor}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                isFetchingAdvice 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95'
              }`}
            >
              {isFetchingAdvice ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
              {isFetchingAdvice ? 'Analyzing...' : 'Get Advice'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-slate-400" />
            <h2 className="text-xl font-bold">Controls</h2>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleUndo}
                disabled={isAiThinking || game.getHistory().length === 0}
                className="py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Undo2 size={18} /> Undo
              </button>
              <button 
                onClick={resetGame}
                className="py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw size={18} /> Reset
              </button>
            </div>
            <button 
              onClick={toggleDifficulty}
              className="w-full py-3 bg-indigo-900/40 border border-indigo-500/30 text-indigo-100 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <BrainCircuit size={18} /> {difficulty}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
