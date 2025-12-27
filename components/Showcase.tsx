
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, BrainCircuit, MousePointer2, Lightbulb, Trophy, Sparkles } from 'lucide-react';

interface ShowcaseProps {
  onClose: () => void;
}

const slides = [
  {
    title: "Grandmaster AI Chess",
    subtitle: "The Ultimate Battle of Wits",
    content: "Step into a sophisticated digital arena where tradition meets cutting-edge technology. Experience chess like never before with a platform designed for both mastery and learning.",
    icon: <Sparkles className="text-emerald-400 w-20 h-20" />,
    gradient: "from-slate-800 to-slate-900"
  },
  {
    title: "Tactile 3D Gameplay",
    subtitle: "Modern Staunton Design",
    content: "Operate beautiful, standard Staunton pieces with a fluid drag-and-drop interface. Every move feels weighted and deliberate on our 3D-perspective 8x8 board.",
    icon: <MousePointer2 className="text-indigo-400 w-20 h-20" />,
    gradient: "from-indigo-900/40 to-slate-900"
  },
  {
    title: "Powered by Gemini 3",
    subtitle: "Adaptive Intelligence",
    content: "Face off against Google's latest AI models. Whether you choose 'Beginner' for a casual game or 'Grandmaster' for a world-class challenge, the AI adapts to your level.",
    icon: <BrainCircuit className="text-purple-400 w-20 h-20" />,
    gradient: "from-purple-900/40 to-slate-900"
  },
  {
    title: "Real-time Strategist",
    subtitle: "Your Personal Chess Coach",
    content: "Never feel lost again. Our built-in AI Strategist analyzes the board state and provides tactical move advice with clear, concise explanations to sharpen your skills.",
    icon: <Lightbulb className="text-yellow-400 w-20 h-20" />,
    gradient: "from-amber-900/40 to-slate-900"
  },
  {
    title: "The Thrill of Victory",
    subtitle: "End Game Excellence",
    isVictorySlide: true,
    icon: <Trophy className="text-yellow-500 w-20 h-20" />,
    gradient: "from-emerald-900/40 to-slate-900"
  }
];

const Showcase: React.FC<ShowcaseProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => setCurrentSlide((s) => Math.min(s + 1, slides.length - 1));
  const prev = () => setCurrentSlide((s) => Math.max(s - 1, 0));

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className={`relative w-full max-w-5xl aspect-video bg-gradient-to-br ${slide.gradient} rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-16 transition-all duration-1000`}>
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500" 
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
        >
          <X size={28} />
        </button>

        <div className="absolute top-8 left-12 text-slate-500 font-mono text-lg">
          {String(currentSlide + 1).padStart(2, '0')} <span className="text-slate-700">/ 05</span>
        </div>

        {slide.isVictorySlide ? (
          <div className="flex flex-col items-center animate-in zoom-in-95 fade-in duration-700">
            <div className="bg-[#1e293b] p-14 rounded-[3rem] shadow-2xl border border-white/5 text-center max-w-sm w-full">
              <div className="flex justify-center mb-8">
                 <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                   <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                   <path d="M4 22h16"></path>
                   <path d="M10 14.66V17c0 .55.47.98.97 1.21C11.47 18.44 12 19 12 19s.53-.56 1.03-.79c.5-.23.97-.66.97-1.21v-2.34"></path>
                   <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"></path>
                 </svg>
              </div>
              <h2 className="text-5xl font-black text-white mb-4">Game Over</h2>
              <p className="text-slate-400 text-2xl mb-12">White wins!</p>
              <div className="w-full py-5 bg-[#4f46e5] text-white rounded-2xl font-bold text-xl shadow-lg shadow-indigo-500/20">
                Play Again
              </div>
            </div>
          </div>
        ) : (
          <div key={currentSlide} className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex justify-center transform hover:scale-110 transition-transform duration-500">
              {slide.icon}
            </div>
            <div className="space-y-6">
              <h3 className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-sm">{slide.subtitle}</h3>
              <h2 className="text-6xl md:text-7xl font-black text-white tracking-tight">{slide.title}</h2>
              <p className="text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
                {slide.content}
              </p>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center">
          <div className="flex gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-12 bg-indigo-500' : 'w-2 bg-slate-800 hover:bg-slate-700'}`} 
              />
            ))}
          </div>
          
          <div className="flex gap-6">
            <button 
              onClick={prev}
              disabled={currentSlide === 0}
              className={`p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all ${currentSlide === 0 ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={currentSlide === slides.length - 1 ? onClose : next}
              className="group px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xl flex items-center gap-3 transition-all shadow-2xl hover:shadow-indigo-500/40 active:scale-95"
            >
              {currentSlide === slides.length - 1 ? "Start Your Legend" : "Next Chapter"}
              {currentSlide !== slides.length - 1 && <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Showcase;
