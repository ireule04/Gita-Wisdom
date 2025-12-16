
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Library from './components/Library';
import ChatInterface from './components/ChatInterface';
import Profile from './components/Profile';
import CelebrationOverlay from './components/CelebrationOverlay'; // New import
import { AppView, Theme, GitaVerse, ChatMessage, Achievement } from './types';
import { INITIAL_VERSES, ACHIEVEMENTS } from './data';
import VerseCard from './components/VerseCard';
import VerseDetail from './components/VerseDetail';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  
  // Carousel State
  const [dailyVerses] = useState(INITIAL_VERSES.slice(0, 5)); // Carousel of 5 verses
  const [activeSlide, setActiveSlide] = useState(0);
  
  const [showDailyDetail, setShowDailyDetail] = useState(false);
  const [selectedDailyVerse, setSelectedDailyVerse] = useState<GitaVerse>(dailyVerses[0]);
  
  const [savedVerses, setSavedVerses] = useState<GitaVerse[]>([]);
  const [theme, setTheme] = useState<Theme>('dark');

  // Stats for Achievements
  const [readCount, setReadCount] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [celebrationAchievement, setCelebrationAchievement] = useState<Achievement | null>(null);

  // Lifted Chat State (Persists until refresh)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: "Namaste. I am here to guide you. Ask me about your duty, your sorrows, or your search for peace.",
      timestamp: Date.now()
    }
  ]);

  // Swipe State for Carousel
  const [touchStart, setTouchStart] = useState<{x: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number} | null>(null);

  // Load saved verses, theme, and stats from localStorage on mount
  useEffect(() => {
    // Saved Verses
    const savedData = localStorage.getItem('gita_saved_verses_data');
    if (savedData) {
        try {
            setSavedVerses(JSON.parse(savedData));
        } catch (e) { console.error("Failed to parse saved verses data", e); }
    } else {
        const legacyIds = localStorage.getItem('gita_saved_verses');
        if (legacyIds) {
            try {
                const ids: number[] = JSON.parse(legacyIds);
                const recovered = INITIAL_VERSES.filter(v => ids.includes(v.id));
                setSavedVerses(recovered);
            } catch (e) { console.error(e); }
        }
    }

    // Theme
    const savedTheme = localStorage.getItem('gita_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);

    // Stats
    const count = parseInt(localStorage.getItem('gita_read_count') || '0');
    setReadCount(count);
    
    // Initial Achievement Check (Silent)
    const unlocked = ACHIEVEMENTS.filter(a => a.condition(count, savedData ? JSON.parse(savedData) : [])).map(a => a.id);
    setUnlockedAchievements(unlocked);

  }, []);

  // Achievement Checking Effect
  useEffect(() => {
      const newlyUnlocked: Achievement[] = [];
      const currentUnlockedIds = new Set(unlockedAchievements);

      ACHIEVEMENTS.forEach(achievement => {
          if (!currentUnlockedIds.has(achievement.id)) {
              if (achievement.condition(readCount, savedVerses)) {
                  newlyUnlocked.push(achievement);
              }
          }
      });

      if (newlyUnlocked.length > 0) {
          const newIds = newlyUnlocked.map(a => a.id);
          setUnlockedAchievements(prev => [...prev, ...newIds]);
          // Trigger celebration for the first one found (to avoid stacking overlays)
          setCelebrationAchievement(newlyUnlocked[0]);
      }
  }, [readCount, savedVerses]); // Intentionally omitting unlockedAchievements to avoid loops, relying on ref/logic above

  // Apply theme to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('gita_theme', theme);
  }, [theme]);

  // Robust Toggle Function
  const toggleSavedVerse = (verse: GitaVerse) => {
    setSavedVerses(prev => {
        const exists = prev.some(v => v.id === verse.id);
        const newSaved = exists 
            ? prev.filter(v => v.id !== verse.id)
            : [...prev, verse];
        
        localStorage.setItem('gita_saved_verses_data', JSON.stringify(newSaved));
        return newSaved;
    });
  };

  const handleVerseRead = useCallback(() => {
      setReadCount(prev => {
          const newVal = prev + 1;
          localStorage.setItem('gita_read_count', newVal.toString());
          return newVal;
      });
  }, []);

  const handleToggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'parchment' : 'dark');
  };

  const handleOpenVerse = (verse: GitaVerse) => {
      setSelectedDailyVerse(verse);
      setShowDailyDetail(true);
      handleVerseRead();
  };

  // Carousel Logic
  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % dailyVerses.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + dailyVerses.length) % dailyVerses.length);

  // Swipe Handlers for Carousel
  const onTouchStart = (e: React.TouchEvent) => {
      setTouchEnd(null);
      setTouchStart({ x: e.targetTouches[0].clientX });
  };
  const onTouchMove = (e: React.TouchEvent) => {
      setTouchEnd({ x: e.targetTouches[0].clientX });
  };
  const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart.x - touchEnd.x;
      const minSwipeDistance = 50;
      if (distance > minSwipeDistance) nextSlide();
      if (distance < -minSwipeDistance) prevSlide();
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.LIBRARY:
        return (
            <Library 
                savedVerses={savedVerses}
                onToggleSave={toggleSavedVerse} 
                setGlobalLoading={setIsGlobalLoading}
                currentTheme={theme}
                onToggleTheme={handleToggleTheme}
                onVerseRead={handleVerseRead}
            />
        );
      case AppView.CHAT:
        return (
            <ChatInterface 
                setGlobalLoading={setIsGlobalLoading} 
                messages={chatMessages}
                setMessages={setChatMessages}
            />
        );
      case AppView.PROFILE:
        return (
            <Profile 
                savedVerses={savedVerses}
                onToggleSave={toggleSavedVerse}
                currentTheme={theme}
                onToggleTheme={handleToggleTheme}
                readCount={readCount}
                unlockedAchievements={unlockedAchievements}
            />
        );
      case AppView.HOME:
      default:
        return (
          <>
            <Hero 
              onStart={() => setCurrentView(AppView.CHAT)} 
              onExplore={() => setCurrentView(AppView.LIBRARY)} 
            />
            
            {/* Daily Verse Section - Carousel */}
            <div className="w-full bg-paper-200 dark:bg-deep-900 text-ink-900 dark:text-white relative transition-colors duration-700">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/5 dark:to-deep-950 opacity-100"></div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="text-center mb-10">
                  <span className="text-saffron-600 dark:text-saffron-500 font-bold tracking-widest uppercase text-xs mb-2 block">Verses of the Day</span>
                  <h2 className="text-3xl md:text-4xl font-epic font-bold text-ink-900 dark:text-white tracking-wide">Daily Inspiration</h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-transparent via-saffron-500 to-transparent mx-auto mt-4 rounded-full"></div>
                </div>

                {/* Carousel Container */}
                <div 
                    className="max-w-4xl mx-auto relative group"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    {/* Arrow Left */}
                    <button 
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 text-ink-500 dark:text-gray-400 hover:text-saffron-600 dark:hover:text-saffron-400 transition-all md:opacity-0 md:group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    {/* Slides Window */}
                    <div className="overflow-hidden rounded-xl">
                        <div 
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                        >
                            {dailyVerses.map((verse, index) => (
                                <div key={verse.id} className="w-full flex-shrink-0 px-2 md:px-0">
                                    <div className="transform hover:-translate-y-1 transition-transform duration-300 h-full">
                                        <VerseCard 
                                          verse={verse} 
                                          onClick={() => handleOpenVerse(verse)} 
                                          isSaved={savedVerses.some(v => v.id === verse.id)}
                                          onToggleSave={() => toggleSavedVerse(verse)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Arrow Right */}
                    <button 
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 text-ink-500 dark:text-gray-400 hover:text-saffron-600 dark:hover:text-saffron-400 transition-all md:opacity-0 md:group-hover:opacity-100"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Dots Pagination */}
                    <div className="flex justify-center mt-6 space-x-2">
                        {dailyVerses.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveSlide(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    idx === activeSlide 
                                        ? 'bg-saffron-600 w-6' 
                                        : 'bg-ink-300 dark:bg-deep-700 hover:bg-saffron-400'
                                }`}
                            />
                        ))}
                    </div>
                </div>
              </div>
            </div>

            {/* Features Grid - Adaptive Theme */}
            <div className="bg-paper-300 dark:bg-deep-950 py-20 border-t border-ink-500/10 dark:border-deep-800 relative overflow-hidden transition-colors duration-700">
               {/* Decorative background glow */}
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-saffron-600/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Feature 1 */}
                  <div className="p-8 bg-paper-100 dark:bg-deep-900 rounded-2xl shadow-lg border border-ink-500/10 dark:border-deep-800 text-center hover:border-saffron-500/30 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-white dark:bg-deep-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-inner border border-ink-500/10 dark:border-deep-700">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-ink-900 dark:text-gray-100 mb-3 font-serif">Original Sanskrit</h3>
                    <p className="text-ink-600 dark:text-gray-400 leading-relaxed text-sm">Experience the raw power of the original verses with precise transliterations and authentic pronunciation.</p>
                  </div>

                  {/* Feature 2 */}
                  <div className="p-8 bg-paper-100 dark:bg-deep-900 rounded-2xl shadow-lg border border-ink-500/10 dark:border-deep-800 text-center hover:border-saffron-500/30 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-white dark:bg-deep-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-inner border border-ink-500/10 dark:border-deep-700">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3M3.343 15.657l-.707-.707m16.5 0l-.707.707M6.343 4.939l-.707-.707m2.121 16.97a6 6 0 005.192-9.172 6 6 0 00-8.283 0 6 6 0 003.091 9.172z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-ink-900 dark:text-gray-100 mb-3 font-serif">Modern Application</h3>
                    <p className="text-ink-600 dark:text-gray-400 leading-relaxed text-sm">Actionable advice on how to apply ancient wisdom to 21st-century problems like stress and leadership.</p>
                  </div>

                  {/* Feature 3 */}
                  <div className="p-8 bg-paper-100 dark:bg-deep-900 rounded-2xl shadow-lg border border-ink-500/10 dark:border-deep-800 text-center hover:border-saffron-500/30 transition-all duration-300 group">
                    <div className="w-16 h-16 bg-white dark:bg-deep-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shadow-inner border border-ink-500/10 dark:border-deep-700">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-ink-900 dark:text-gray-100 mb-3 font-serif">Listen & Learn</h3>
                    <p className="text-ink-600 dark:text-gray-400 leading-relaxed text-sm">Listen to the verses chanted and explained using advanced AI text-to-speech technology.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {showDailyDetail && (
              <VerseDetail 
                verse={selectedDailyVerse} 
                onClose={() => setShowDailyDetail(false)}
                isSaved={savedVerses.some(v => v.id === selectedDailyVerse.id)}
                onToggleSave={() => toggleSavedVerse(selectedDailyVerse)}
                isDarkTheme={theme === 'dark'}
                onToggleTheme={handleToggleTheme}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-paper-200 dark:bg-deep-900 text-ink-900 dark:text-gray-100 font-sans selection:bg-saffron-200 dark:selection:bg-saffron-900 selection:text-ink-900 dark:selection:text-saffron-100 flex flex-col transition-colors duration-700 ease-in-out relative">
      <Navbar currentView={currentView} setView={setCurrentView} isLoading={isGlobalLoading} />
      
      <main className="flex-grow">
        {renderContent()}
      </main>

      {/* Celebration Overlay */}
      {celebrationAchievement && (
          <CelebrationOverlay 
              achievement={celebrationAchievement} 
              onClose={() => setCelebrationAchievement(null)} 
          />
      )}
      
      <footer className="bg-paper-300 dark:bg-deep-950 border-t border-ink-500/10 dark:border-deep-800 py-12 mt-auto transition-colors duration-700">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-saffron-500 to-saffron-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-serif font-bold text-lg border border-saffron-500/50 shadow-glow">ॐ</div>
          <p className="font-serif text-ink-600 dark:text-gray-500 italic text-base mb-6">"You are what you believe in. You become that which you believe you can become."</p>
          <div className="flex justify-center space-x-6 mb-6 text-sm text-ink-500 dark:text-gray-400">
             <button className="hover:text-saffron-600 dark:hover:text-saffron-500 transition-colors">About</button>
             <button className="hover:text-saffron-600 dark:hover:text-saffron-500 transition-colors">Teachings</button>
             <button className="hover:text-saffron-600 dark:hover:text-saffron-500 transition-colors">Privacy</button>
          </div>
          <p className="text-xs text-ink-400 dark:text-deep-700 flex items-center justify-center gap-1">
             Gita Wisdom © 2024 • Reule <span className="text-sm">☮</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
