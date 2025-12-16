
import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_VERSES, CATEGORIES, GITA_CHAPTER_COUNTS } from '../data';
import { GitaVerse, VerseCategory, Theme } from '../types';
import VerseCard from './VerseCard';
import VerseDetail from './VerseDetail';
import { generateMoreVerses, getSpecificVerse } from '../services/geminiService';
import { Loader2, Plus, Dices, Search, CloudDownload, ChevronDown, X } from 'lucide-react';

interface LibraryProps {
  savedVerses: GitaVerse[];
  onToggleSave: (verse: GitaVerse) => void;
  setGlobalLoading?: (loading: boolean) => void;
  currentTheme: Theme;
  onToggleTheme: () => void;
  onVerseRead: () => void; // New prop to bubble up read events
}

// Custom Dhanush (Bow) Icon
const DhanushIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Bow Curve */}
        <path d="M18 3c-5.5 0-10 4.5-10 10s4.5 10 10 10" />
        {/* Bow String (Faint) */}
        <path d="M18 3v20" opacity="0.3" strokeDasharray="2 2" />
        {/* Arrow Shaft */}
        <path d="M2 13h16" />
        {/* Arrow Head */}
        <path d="M15 10l3 3-3 3" />
        {/* Arrow Fletching */}
        <path d="M5 10l-3 3 3 3" />
    </svg>
);

const Library: React.FC<LibraryProps> = ({ savedVerses, onToggleSave, setGlobalLoading, currentTheme, onToggleTheme, onVerseRead }) => {
  const [verses, setVerses] = useState<GitaVerse[]>(INITIAL_VERSES);
  const [selectedVerseId, setSelectedVerseId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<VerseCategory | 'All'>('All');
  
  // Search & Filter state
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Precise Selection State
  const [selectedChapter, setSelectedChapter] = useState<number | 'All'>('All');
  const [selectedVerseNum, setSelectedVerseNum] = useState<number | 'All'>('All');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingSpecific, setIsFetchingSpecific] = useState(false);

  // Memoize IDs for quick lookup
  const savedVerseIds = useMemo(() => savedVerses.map(v => v.id), [savedVerses]);

  const chapters = Array.from({length: 18}, (_, i) => i + 1);

  // Derive verses for the selected chapter based on GITA_CHAPTER_COUNTS
  const availableVersesForChapter = useMemo(() => {
      if (selectedChapter === 'All') return [];
      const count = GITA_CHAPTER_COUNTS[selectedChapter as number] || 0;
      return Array.from({length: count}, (_, i) => i + 1);
  }, [selectedChapter]);

  // Reset verse selection when chapter changes
  useEffect(() => {
      setSelectedVerseNum('All');
  }, [selectedChapter]);

  // Debounce search input
  useEffect(() => {
      const handler = setTimeout(() => {
          setSearchQuery(searchInput);
          if (setGlobalLoading) setGlobalLoading(false);
      }, 500); 
      
      if (searchInput && setGlobalLoading) setGlobalLoading(true);

      return () => clearTimeout(handler);
  }, [searchInput, setGlobalLoading]);

  // Advanced Filter & Scoring Logic
  const filteredVerses = useMemo(() => {
      let result = verses;

      // 1. Category Filter (Hard filter)
      if (activeCategory !== 'All') {
          result = result.filter(v => v.tags.some(t => CATEGORIES[activeCategory]?.includes(t) || t === activeCategory));
      }

      // 2. Chapter Filter (Hard filter)
      if (selectedChapter !== 'All') {
          result = result.filter(v => v.chapter === selectedChapter);
      }

      // 3. Verse Number Filter (Hard filter)
      if (selectedVerseNum !== 'All') {
          result = result.filter(v => v.verse === selectedVerseNum);
      }

      // 4. Advanced Search with Relevance Scoring
      if (searchQuery.trim()) {
          const lowerQuery = searchQuery.toLowerCase().trim();
          
          // Split query into terms for better matching
          const terms = lowerQuery.split(/\s+/).filter(t => t.length > 0);

          const scored = result.map(verse => {
              let score = 0;
              const verseRef = `${verse.chapter}.${verse.verse}`;
              
              // 4a. Exact Reference Match (e.g., "2.47") -> Highest Priority
              if (verseRef === lowerQuery) score += 1000;
              
              // 4b. Field Matching with Weights
              const sanskritMatch = verse.sanskrit.toLowerCase().includes(lowerQuery);
              const transliterationMatch = verse.transliteration.toLowerCase().includes(lowerQuery);
              const translationMatch = verse.translation.toLowerCase().includes(lowerQuery);
              const coreMatch = verse.coreTeaching.toLowerCase().includes(lowerQuery);
              const appMatch = verse.practicalApplication.toLowerCase().includes(lowerQuery);

              if (sanskritMatch) score += 100;
              if (transliterationMatch) score += 80; // High value for specific terms like "Karmanye"
              if (translationMatch) score += 50;
              if (coreMatch) score += 30;
              if (appMatch) score += 20;

              // 4c. Fuzzy/Term matching
              // If the full query isn't found, check if individual words are found
              // This allows "Duty Action" to find "Duty and Action"
              let termMatches = 0;
              terms.forEach(term => {
                  if (
                      verse.translation.toLowerCase().includes(term) || 
                      verse.coreTeaching.toLowerCase().includes(term) ||
                      verse.practicalApplication.toLowerCase().includes(term)
                  ) {
                      termMatches++;
                  }
              });
              
              // Bonus for matching all terms
              if (termMatches === terms.length && terms.length > 1) score += 40;
              else if (termMatches > 0) score += (termMatches * 5);

              return { verse, score };
          });

          // Filter out zero relevance results and sort by score descending
          result = scored
              .filter(item => item.score > 0)
              .sort((a, b) => b.score - a.score)
              .map(item => item.verse);
      }

      return result;
  }, [verses, activeCategory, searchQuery, selectedChapter, selectedVerseNum]);

  // Logic to handle specific verse fetching if user selects specific chapter AND verse but it's not in list
  const shouldFetchSpecific = useMemo(() => {
      if (selectedChapter !== 'All' && selectedVerseNum !== 'All') {
          const exists = verses.some(v => v.chapter === selectedChapter && v.verse === selectedVerseNum);
          return !exists;
      }
      return false;
  }, [selectedChapter, selectedVerseNum, verses]);

  const selectedVerse = useMemo(() => 
    verses.find(v => v.id === selectedVerseId) || null
  , [verses, selectedVerseId]);

  // Navigation Logic
  // Find index in FILTERED list to allow logical next/prev based on view
  const currentIndex = selectedVerse ? filteredVerses.findIndex(v => v.id === selectedVerse.id) : -1;
  const hasNext = currentIndex !== -1 && currentIndex < filteredVerses.length - 1;
  const hasPrev = currentIndex > 0;
  
  const nextVerse = hasNext ? filteredVerses[currentIndex + 1] : undefined;

  const handleNext = () => {
      if (hasNext) handleVerseOpen(filteredVerses[currentIndex + 1].id);
  };

  const handlePrev = () => {
      if (hasPrev) handleVerseOpen(filteredVerses[currentIndex - 1].id);
  };

  const handleVerseOpen = (id: number) => {
      setSelectedVerseId(id);
      onVerseRead(); // Notify parent
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    if(setGlobalLoading) setGlobalLoading(true);
    const existingIds = verses.map(v => v.id);
    
    // Pass the activeCategory to the service so verses are relevant
    const newVersesData = await generateMoreVerses(6, existingIds, activeCategory);
    
    if (newVersesData.length > 0) {
       // Use Timestamp based ID to ensure uniqueness across sessions and avoid save collisions
       const baseId = Date.now();
       const formattedNewVerses: GitaVerse[] = newVersesData.map((v, idx) => {
         const effectiveTags = Array.isArray(v.tags) ? v.tags : [];
         
         // Fix: Explicitly add the active category to the tags if it's missing.
         // This ensures the new verses appear immediately in the current filter view.
         if (activeCategory !== 'All' && !effectiveTags.includes(activeCategory)) {
             effectiveTags.push(activeCategory);
         }

         return {
            ...v,
            id: baseId + idx, 
            tags: effectiveTags.length > 0 ? effectiveTags : ["Wisdom"]
         };
       });
       setVerses(prev => [...prev, ...formattedNewVerses]);
    }
    setIsGenerating(false);
    if(setGlobalLoading) setGlobalLoading(false);
  };

  const handleFetchSpecificVerse = async () => {
      if (selectedChapter === 'All' || selectedVerseNum === 'All') return;
      setIsFetchingSpecific(true);
      if(setGlobalLoading) setGlobalLoading(true);
      
      const newVerse = await getSpecificVerse(selectedChapter as number, selectedVerseNum as number);
      
      if (newVerse) {
          setVerses(prev => {
              const exists = prev.find(v => v.chapter === newVerse.chapter && v.verse === newVerse.verse);
              if (exists) {
                  handleVerseOpen(exists.id);
                  return prev;
              }
              return [newVerse, ...prev];
          });
          
          if (!verses.some(v => v.chapter === newVerse.chapter && v.verse === newVerse.verse)) {
              handleVerseOpen(newVerse.id);
          }
      }
      setIsFetchingSpecific(false);
      if(setGlobalLoading) setGlobalLoading(false);
  };

  const handleSurpriseMe = () => {
      if (filteredVerses.length === 0) return;
      const randomIndex = Math.floor(Math.random() * filteredVerses.length);
      handleVerseOpen(filteredVerses[randomIndex].id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500 min-h-screen transition-colors duration-500">
      
      {/* Header */}
      <div className="mb-12 text-center relative">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-4xl md:text-6xl font-epic font-bold text-ink-900 dark:text-gray-100 mb-6 tracking-wide drop-shadow-xl transition-colors duration-500">Library of Wisdom</h1>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mb-4 group z-10">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-ink-400 dark:text-gray-500 group-focus-within:text-saffron-500 transition-colors" />
            </div>
            <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Sanskrit, '2.47', meaning, or concepts..."
                className="block w-full pl-11 pr-4 py-4 bg-white dark:bg-deep-900 border border-ink-500/10 dark:border-deep-700 rounded-full leading-5 text-ink-900 dark:text-gray-200 placeholder-ink-400 dark:placeholder-gray-500 focus:outline-none focus:border-saffron-500 focus:ring-1 focus:ring-saffron-500 transition-all shadow-lg"
            />
            {searchInput && (
                <div className="absolute inset-y-0 right-14 flex items-center">
                     <button onClick={() => setSearchInput('')} className="p-1 text-ink-400 hover:text-ink-600 dark:text-gray-500 dark:hover:text-gray-300">
                         <X className="w-4 h-4" />
                     </button>
                </div>
            )}
            <div className="absolute inset-y-0 right-2 flex items-center">
                 <button 
                    onClick={() => setShowAdvanced(!showAdvanced)} 
                    className={`p-2 rounded-full transition-all duration-500 ${showAdvanced ? 'bg-saffron-100 dark:bg-saffron-900/30 text-saffron-600 rotate-90' : 'text-ink-400 dark:text-gray-500 hover:bg-ink-100 dark:hover:bg-deep-800'}`}
                    title="Divine Search"
                 >
                     <DhanushIcon className="w-6 h-6" />
                 </button>
            </div>
        </div>
        
        {/* Advanced Filters Panel */}
        {showAdvanced && (
            <div className="max-w-xl mx-auto bg-white/50 dark:bg-deep-800/50 backdrop-blur-sm p-4 rounded-2xl border border-ink-500/10 dark:border-deep-700 mb-8 animate-in slide-in-from-top-2 shadow-xl">
                <div className="flex flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-ink-500 dark:text-gray-400 uppercase tracking-wider mb-2">Chapter</label>
                        <div className="relative">
                            <select 
                                value={selectedChapter} 
                                onChange={(e) => setSelectedChapter(e.target.value === 'All' ? 'All' : parseInt(e.target.value))}
                                className="w-full appearance-none bg-white dark:bg-deep-900 border border-ink-500/10 dark:border-deep-700 text-ink-900 dark:text-gray-200 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron-500 text-sm"
                            >
                                <option value="All">All Chapters</option>
                                {chapters.map(c => <option key={c} value={c}>Chapter {c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-ink-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-ink-500 dark:text-gray-400 uppercase tracking-wider mb-2">Verse</label>
                        <div className="relative">
                             <select 
                                value={selectedVerseNum} 
                                onChange={(e) => setSelectedVerseNum(e.target.value === 'All' ? 'All' : parseInt(e.target.value))}
                                className="w-full appearance-none bg-white dark:bg-deep-900 border border-ink-500/10 dark:border-deep-700 text-ink-900 dark:text-gray-200 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-saffron-500 text-sm disabled:opacity-50"
                                disabled={selectedChapter === 'All'}
                            >
                                <option value="All">All Verses</option>
                                {availableVersesForChapter.map(v => <option key={v} value={v}>Verse {v}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-ink-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-center mb-12 gap-8">
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                activeCategory === 'All' 
                  ? 'bg-saffron-600 text-white shadow-[0_0_20px_rgba(255,160,0,0.4)] scale-105 ring-2 ring-saffron-400/20' 
                  : 'bg-white dark:bg-deep-800 text-ink-500 dark:text-gray-400 hover:bg-ink-100 dark:hover:bg-deep-700 hover:text-ink-800 dark:hover:text-gray-200 border border-ink-500/10 dark:border-deep-700'
              }`}
            >
              All
            </button>
            {Object.keys(CATEGORIES).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as VerseCategory)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                  activeCategory === cat 
                    ? 'bg-saffron-600 text-white shadow-[0_0_20px_rgba(255,160,0,0.4)] scale-105 ring-2 ring-saffron-400/20' 
                    : 'bg-white dark:bg-deep-800 text-ink-500 dark:text-gray-400 hover:bg-ink-100 dark:hover:bg-deep-700 hover:text-ink-800 dark:hover:text-gray-200 border border-ink-500/10 dark:border-deep-700'
              }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Random Button */}
           <button
             onClick={handleSurpriseMe}
             className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-full shadow-lg hover:shadow-[0_0_25px_rgba(129,140,248,0.4)] transition-all hover:-translate-y-1 border border-white/10 group"
           >
             <Dices className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
             <span className="text-sm font-bold tracking-wide">Surprise Me</span>
           </button>
      </div>

      {/* Specific Verse Fetch Call to Action */}
      {shouldFetchSpecific && (
          <div className="text-center mb-12 animate-in fade-in zoom-in duration-300">
              <div className="bg-white/50 dark:bg-deep-800/50 p-8 rounded-2xl border border-saffron-500/30 inline-block max-w-lg">
                  <p className="text-lg text-ink-700 dark:text-gray-300 mb-4">Verse <span className="text-saffron-600 dark:text-saffron-400 font-bold">{selectedChapter}.{selectedVerseNum}</span> is not in your current library.</p>
                  <button 
                    onClick={handleFetchSpecificVerse}
                    disabled={isFetchingSpecific}
                    className="flex items-center space-x-3 px-8 py-3 bg-saffron-600 hover:bg-saffron-500 text-white rounded-full font-bold shadow-lg hover:shadow-[0_0_30px_rgba(255,160,0,0.4)] transition-all mx-auto"
                  >
                      {isFetchingSpecific ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudDownload className="w-5 h-5" />}
                      <span>Retrieve from Archives</span>
                  </button>
              </div>
          </div>
      )}

      {/* Grid */}
      {filteredVerses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredVerses.map((verse, index) => (
              <div 
                key={verse.id} 
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }} // Cap delay
              >
                <VerseCard 
                  verse={verse} 
                  onClick={() => handleVerseOpen(verse.id)}
                  isSaved={savedVerseIds.includes(verse.id)}
                  onToggleSave={() => onToggleSave(verse)}
                />
              </div>
            ))}
          </div>
      ) : (
          !shouldFetchSpecific && (
            <div className="text-center py-20">
                <p className="text-ink-400 dark:text-gray-400 text-lg">No teachings found matching your filters.</p>
            </div>
          )
      )}

      {/* Load More Action */}
      {!searchInput && !shouldFetchSpecific && (
        <div className="flex flex-col items-center justify-center pb-20 text-center">
            <button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="group relative flex items-center space-x-3 bg-white dark:bg-deep-800 px-10 py-5 rounded-full shadow-2xl hover:shadow-[0_0_40px_rgba(255,160,0,0.2)] border border-ink-500/10 dark:border-deep-600 hover:border-saffron-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform hover:-translate-y-1"
            >
            {isGenerating && <div className="absolute inset-0 bg-saffron-500/10 animate-pulse" />}
            
            {isGenerating ? (
                <Loader2 className="w-5 h-5 text-saffron-600 dark:text-saffron-500 animate-spin" />
            ) : (
                <Plus className="w-5 h-5 text-saffron-600 dark:text-saffron-500 group-hover:rotate-90 transition-transform duration-300" />
            )}
            <span className="font-bold text-ink-700 dark:text-gray-300 group-hover:text-ink-900 dark:group-hover:text-white text-lg tracking-wide">
                {isGenerating ? `Reveal More ${activeCategory !== 'All' ? activeCategory : ''} Wisdom` : `Reveal More ${activeCategory !== 'All' ? activeCategory : 'Wisdom'}`}
            </span>
            </button>
        </div>
      )}

      {/* Modal */}
      {selectedVerse && (
        <VerseDetail 
          verse={selectedVerse} 
          onClose={() => setSelectedVerseId(null)} 
          isSaved={savedVerseIds.includes(selectedVerse.id)}
          onToggleSave={() => onToggleSave(selectedVerse)}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={hasNext}
          hasPrev={hasPrev}
          nextVerse={nextVerse}
          isDarkTheme={currentTheme === 'dark'}
          onToggleTheme={onToggleTheme}
        />
      )}
    </div>
  );
};

export default Library;
