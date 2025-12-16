
import React, { useState } from 'react';
import { GitaVerse } from '../types';
import { ArrowRight, Bookmark, Share2, Copy, Check } from 'lucide-react';

interface VerseCardProps {
  verse: GitaVerse;
  onClick: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const VerseCard: React.FC<VerseCardProps> = ({ verse, onClick, isSaved = false, onToggleSave }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isSavingLocal, setIsSavingLocal] = useState(false); // For local animation trigger

  const handleShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = `Bhagavad Gita ${verse.chapter}.${verse.verse}\n\n${verse.sanskrit}\n\n"${verse.translation}"\n\nRead more on Gita Wisdom.`;
      
      if (navigator.share) {
          try {
              const shareData: ShareData = {
                  title: 'Gita Wisdom',
                  text: text,
              };
              if (window.location.protocol.startsWith('http')) {
                  shareData.url = window.location.href;
              }
              await navigator.share(shareData);
          } catch (err) {
              console.error("Share failed:", err);
          }
      } else {
          handleCopy(e);
      }
  };

  const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = `${verse.sanskrit}\n\n${verse.translation}\n- Bhagavad Gita ${verse.chapter}.${verse.verse}`;
      navigator.clipboard.writeText(text);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
  };

  const handleSaveInteraction = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSavingLocal(true);
      if (onToggleSave) onToggleSave();
      setTimeout(() => setIsSavingLocal(false), 400);
  };

  return (
    <div 
      className="group relative cursor-pointer h-full perspective-1000"
      onClick={onClick}
    >
      <div className="relative bg-[#f5f0e6] dark:bg-deep-800 rounded-xl overflow-hidden h-full flex flex-col border border-ink-500/10 dark:border-deep-700 transition-all duration-500 ease-out transform group-hover:scale-[1.02] group-hover:-translate-y-1 shadow-md hover:shadow-2xl dark:shadow-none dark:hover:shadow-[0_0_25px_rgba(255,160,0,0.15)] pl-1">
        
        {/* Saffron Accent Border Left */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-saffron-600 via-saffron-400 to-saffron-600"></div>

        {/* Parallax Background Texture */}
        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500 ml-1">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply"></div>
             <div className="absolute inset-0 bg-gradient-to-br from-saffron-500/5 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-5 md:p-6 flex flex-col h-full ml-1">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-4 border-b border-ink-500/10 dark:border-deep-600/50 pb-3">
            <span className="font-epic text-saffron-700 dark:text-saffron-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mt-1">
               Chapter {verse.chapter}
            </span>
            <div className="flex items-center gap-1">
                {/* Copy Button */}
                <button 
                    onClick={handleCopy}
                    className={`p-1.5 rounded-full transition-all duration-300 ${isCopying ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-110' : 'text-ink-300 dark:text-gray-500 hover:text-saffron-600 dark:hover:text-saffron-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                    title="Copy Verse"
                >
                    {isCopying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>

                {/* Share Button */}
                <button 
                    onClick={handleShare}
                    className="p-1.5 rounded-full text-ink-300 dark:text-gray-500 hover:text-saffron-600 dark:hover:text-saffron-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    title="Share Verse"
                >
                    <Share2 className="w-4 h-4" />
                </button>

                {/* Bookmark Button */}
                {onToggleSave && (
                    <button 
                        onClick={handleSaveInteraction}
                        className={`p-1.5 rounded-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 
                            ${isSaved ? 'text-saffron-600 dark:text-saffron-500' : 'text-ink-300 dark:text-gray-500 hover:text-saffron-600 dark:hover:text-saffron-400'}
                            ${isSavingLocal ? 'scale-125 rotate-12' : 'scale-100'}
                        `}
                        title={isSaved ? "Saved" : "Save Verse"}
                    >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                )}
            </div>
          </div>
          
          {/* Sanskrit Text */}
          <div className="mb-4 flex-grow">
             <p className="font-antique text-lg md:text-xl text-ink-900 dark:text-gray-100 leading-loose font-medium line-clamp-2 group-hover:text-saffron-800 dark:group-hover:text-saffron-200 transition-colors duration-300">
                {verse.sanskrit.split('\n')[0]}
             </p>
          </div>

          {/* Translation */}
          <div className="relative pl-4 border-l-2 border-saffron-200 dark:border-deep-600 mb-6">
            <h3 className="font-serif text-sm md:text-base text-ink-600 dark:text-gray-300 leading-relaxed italic line-clamp-3 group-hover:text-ink-900 dark:group-hover:text-white transition-colors duration-300">
                "{verse.translation}"
            </h3>
          </div>
          
          {/* Footer */}
          <div className="mt-auto pt-4 flex justify-between items-center border-t border-ink-500/10 dark:border-deep-600/50">
             <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-ink-400 dark:text-gray-500 font-bold">Verse {verse.verse}</span>
             </div>
             
             <div className="flex items-center gap-2 text-xs font-bold text-saffron-700 dark:text-saffron-400 group-hover:gap-3 transition-all duration-300">
                <span>Read</span>
                <ArrowRight className="w-4 h-4" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerseCard;
