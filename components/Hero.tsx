import React from 'react';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
  onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart, onExplore }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-deep-900 text-white pt-16 transition-colors duration-500 group theme-transition">
      
      {/* Immersive Background: Cosmic Vishvarupa representation (Dark Mode) */}
      <div className="absolute inset-0 z-0 opacity-0 dark:opacity-100 transition-opacity duration-1000">
        <img 
            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop" 
            alt="Cosmic Golden Nebula" 
            className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-950 via-deep-900/80 to-deep-950"></div>
        {/* Animated Particles/Stars */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 animate-pulse"></div>
      </div>

      {/* Immersive Background: Golden Temple (Parchment Mode) */}
      <div className="absolute inset-0 z-0 opacity-100 dark:opacity-0 transition-opacity duration-1000 bg-[#f5f0e6]">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-80"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-saffron-100/30 via-transparent to-paper-300/80"></div>
         {/* Sun Rays Effect */}
         <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(255,160,0,0.1)_0%,transparent_70%)] animate-pulse"></div>
      </div>

      {/* Rotating Chakra Effect - Behind everything */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1200px] h-[800px] md:h-[1200px] opacity-10 pointer-events-none z-0">
         <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow text-saffron-600 dark:text-saffron-500">
            {/* Sudarshana Chakra Design */}
            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.2" fill="none" />
            <path d="M50 2 L50 98 M2 50 L98 50 M14 14 L86 86 M14 86 L86 14" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
            <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="2 1" />
            <path d="M50 10 L60 30 L50 50 L40 30 Z" fill="currentColor" opacity="0.1" />
            <path d="M50 90 L40 70 L50 50 L60 70 Z" fill="currentColor" opacity="0.1" />
            <path d="M90 50 L70 40 L50 50 L70 60 Z" fill="currentColor" opacity="0.1" />
            <path d="M10 50 L30 60 L50 50 L30 40 Z" fill="currentColor" opacity="0.1" />
         </svg>
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="mb-8 animate-in slide-in-from-top-8 duration-1000 delay-100">
             <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full border border-saffron-500/40 bg-white/60 dark:bg-black/40 text-saffron-700 dark:text-saffron-300 text-xs md:text-sm font-bold uppercase tracking-[0.25em] backdrop-blur-md shadow-[0_0_20px_rgba(255,160,0,0.2)] hover:bg-saffron-100/50 dark:hover:bg-saffron-900/20 transition-colors cursor-default">
                 <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-saffron-600 dark:text-saffron-400" />
                 <span>The Eternal Song</span>
                 <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-saffron-600 dark:text-saffron-400" />
             </div>
          </div>

          {/* Main Title */}
          <h1 className="font-epic text-5xl md:text-7xl lg:text-9xl font-bold tracking-tight text-ink-900 dark:text-white mb-8 drop-shadow-sm dark:drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-1000 leading-tight transition-colors">
            Arise, <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 via-saffron-500 to-saffron-600 dark:from-saffron-200 dark:via-saffron-500 dark:to-saffron-200 animate-pulse relative inline-block">
                Arjuna
                {/* Text Glow */}
                <span className="absolute inset-0 bg-saffron-500 blur-2xl opacity-20 -z-10"></span>
            </span>
          </h1>

          <p className="mt-2 max-w-2xl text-lg md:text-2xl text-ink-700 dark:text-gray-200 leading-relaxed font-serif font-light mb-12 animate-in slide-in-from-bottom-4 duration-1000 delay-300 drop-shadow-lg opacity-90 transition-colors">
            The battlefield isn't just in history—it's in your mind. 
            <br className="hidden md:block" />
            Find your <span className="text-saffron-700 dark:text-saffron-300 font-bold italic">Dharma</span> in the chaos of modern life.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center animate-in slide-in-from-bottom-8 duration-1000 delay-500">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-saffron-700 to-saffron-500 hover:from-saffron-600 hover:to-saffron-400 text-white font-bold text-lg shadow-[0_0_40px_rgba(255,160,0,0.4)] hover:shadow-[0_0_60px_rgba(255,160,0,0.6)] transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center group ring-1 ring-saffron-300/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="mr-3 tracking-wide relative z-10">Ask Krishna</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
            
            <button
              onClick={onExplore}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-saffron-600/30 dark:border-saffron-500/30 hover:bg-saffron-100/50 dark:hover:bg-saffron-900/20 text-ink-900 dark:text-saffron-100 font-medium text-lg transition-all flex items-center justify-center group hover:border-saffron-600/60 dark:hover:border-saffron-500/60 hover:shadow-[0_0_30px_rgba(255,160,0,0.1)]"
            >
              <BookOpen className="w-5 h-5 mr-3 text-saffron-700 dark:text-saffron-400 group-hover:text-saffron-800 dark:group-hover:text-saffron-200 transition-colors" />
              Explore Library
            </button>
          </div>
      </div>

      {/* Temple Archway Silhouette (Footer Decoration) */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-10 opacity-30 text-ink-900 dark:text-black transition-colors duration-1000">
         <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-32 md:h-64 fill-current">
            <path d="M0,320 L1440,320 L1440,200 C1200,200 1200,100 1000,100 C800,100 800,180 720,180 C640,180 640,100 440,100 C240,100 240,200 0,200 Z" />
            {/* Intricate details simulation */}
            <path d="M0,320 L1440,320 L1440,280 L0,280 Z" fillOpacity="0.5"/>
         </svg>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce opacity-40 hover:opacity-100 transition-opacity cursor-pointer z-30">
          <div className="w-6 h-10 rounded-full border-2 border-saffron-600/50 dark:border-saffron-400/50 flex justify-center p-2 shadow-[0_0_10px_rgba(255,160,0,0.3)]">
              <div className="w-1 h-2 bg-saffron-600 dark:bg-saffron-400 rounded-full"></div>
          </div>
      </div>
    </div>
  );
};

export default Hero;