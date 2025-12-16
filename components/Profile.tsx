
import React, { useState, useEffect } from 'react';
import { GitaVerse, Theme, Achievement } from '../types';
import VerseCard from './VerseCard';
import VerseDetail from './VerseDetail';
import { ACHIEVEMENTS } from '../data';
import { User, BookMarked, Award, Edit2, Trophy, Lock, CheckCircle2, Moon, Scroll, Sparkles, BookOpen, Star, Crown, X, Download } from 'lucide-react';

interface ProfileProps {
  savedVerses: GitaVerse[]; 
  onToggleSave: (verse: GitaVerse) => void;
  currentTheme: Theme;
  onToggleTheme: () => void;
  readCount: number; // New Prop
  unlockedAchievements: string[]; // New Prop
}

// Certificate Component
const CertificateModal: React.FC<{ 
    userName: string; 
    levelTitle: string; 
    onClose: () => void; 
}> = ({ userName, levelTitle, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative bg-[#fdfbf7] w-full max-w-2xl p-2 shadow-[0_0_50px_rgba(255,160,0,0.5)] rounded-lg animate-in zoom-in slide-in-from-bottom-8 duration-500 overflow-hidden">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 z-20 text-ink-500 hover:text-red-600 transition-colors bg-white/50 rounded-full p-1">
                    <X className="w-6 h-6" />
                </button>

                {/* Ornamental Border Inner */}
                <div className="border-[12px] border-double border-saffron-700 h-full p-8 md:p-12 text-center relative">
                    {/* Corner Ornaments */}
                    <div className="absolute top-2 left-2 w-16 h-16 border-t-4 border-l-4 border-saffron-500 rounded-tl-3xl"></div>
                    <div className="absolute top-2 right-2 w-16 h-16 border-t-4 border-r-4 border-saffron-500 rounded-tr-3xl"></div>
                    <div className="absolute bottom-2 left-2 w-16 h-16 border-b-4 border-l-4 border-saffron-500 rounded-bl-3xl"></div>
                    <div className="absolute bottom-2 right-2 w-16 h-16 border-b-4 border-r-4 border-saffron-500 rounded-br-3xl"></div>

                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <div className="w-64 h-64 rounded-full border-[20px] border-black"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="mb-4 text-saffron-600 font-bold uppercase tracking-[0.3em] text-xs">Certificate of Spiritual Merit</div>
                        
                        <h2 className="font-epic text-4xl md:text-5xl text-ink-900 mb-2">Gita Wisdom</h2>
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-saffron-500 to-transparent mx-auto mb-8"></div>
                        
                        <p className="text-ink-600 font-serif italic text-lg mb-4">This certifies that</p>
                        
                        <h3 className="font-antique text-3xl md:text-4xl text-saffron-700 font-bold mb-4 capitalize decoration-double underline decoration-saffron-300 underline-offset-8">
                            {userName}
                        </h3>
                        
                        <p className="text-ink-600 font-serif italic text-lg mb-8 max-w-md mx-auto">
                            Has diligently pursued the path of knowledge and attained the illustrious rank of
                        </p>
                        
                        <div className="inline-block px-8 py-3 bg-saffron-100 border border-saffron-300 rounded-full mb-10">
                            <div className="flex items-center gap-3">
                                <Crown className="w-6 h-6 text-saffron-600" />
                                <span className="font-epic font-bold text-2xl text-ink-800 uppercase tracking-wide">{levelTitle}</span>
                                <Crown className="w-6 h-6 text-saffron-600" />
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-ink-200 pt-6 mt-4">
                            <div className="text-left">
                                <p className="font-serif font-bold text-ink-800 text-sm">Sri Krishna</p>
                                <p className="text-[10px] uppercase text-ink-400 tracking-wider">The Supreme Guide</p>
                            </div>
                            <div className="w-16 h-16 text-saffron-500 opacity-80">
                                <div className="w-full h-full border-2 border-current rounded-full flex items-center justify-center font-serif font-bold text-2xl rotate-12">ॐ</div>
                            </div>
                            <div className="text-right">
                                <p className="font-serif font-bold text-ink-800 text-sm">{new Date().toLocaleDateString()}</p>
                                <p className="text-[10px] uppercase text-ink-400 tracking-wider">Date of Issue</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Profile: React.FC<ProfileProps> = ({ savedVerses, onToggleSave, currentTheme, onToggleTheme, readCount, unlockedAchievements }) => {
  const [name, setName] = useState('Seeker');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<GitaVerse | null>(null);
  const [activeTab, setActiveTab] = useState<'saved' | 'achievements'>('saved');
  const [showCertificate, setShowCertificate] = useState(false);
  
  useEffect(() => {
    const storedName = localStorage.getItem('gita_username');
    if (storedName) setName(storedName);
  }, []);

  const handleNameSave = () => {
    localStorage.setItem('gita_username', name);
    setIsEditing(false);
  };

  const handleOpenVerse = (verse: GitaVerse) => {
      setSelectedVerse(verse);
  };

  // Expanded User Level Logic based on readCount
  const getLevel = (count: number) => {
      if (count < 10) return { title: "Seeker", subtitle: "Jijnasu", icon: User, desc: "A soul beginning to ask questions.", canCertify: false };
      if (count < 30) return { title: "Disciple", subtitle: "Sadhaka", icon: BookOpen, desc: "One who practices with discipline.", canCertify: true };
      if (count < 70) return { title: "Yogi", subtitle: "Yogi", icon: Sparkles, desc: "Connected to the deeper truth.", canCertify: true };
      if (count < 150) return { title: "Sage", subtitle: "Muni", icon: Star, desc: "A reservoir of silence and wisdom.", canCertify: true };
      return { title: "Paramahamsa", subtitle: "Divine Swan", icon: Crown, desc: "Liberated while living.", canCertify: true };
  };

  const levelInfo = getLevel(readCount);

  // Use props for achievement status
  const achievementsList = ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: unlockedAchievements.includes(a.id)
  }));

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;
  const progressPercent = Math.min(100, (unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Profile Header */}
      <div className="bg-paper-100 dark:bg-deep-900 rounded-2xl shadow-lg border border-ink-500/10 dark:border-deep-800 p-8 mb-8 relative overflow-hidden group transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron-500 to-saffron-700"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-saffron-500/10 transition-colors duration-700"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between relative z-10 gap-8">
          
          {/* User Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 flex-1">
            <div className="relative">
                <div className="w-28 h-28 bg-white dark:bg-deep-800 rounded-full flex items-center justify-center border-4 border-paper-200 dark:border-deep-700 shadow-xl relative group/avatar overflow-hidden transition-colors duration-500 z-10">
                    <levelInfo.icon className="w-12 h-12 text-saffron-500 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-saffron-900/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-saffron-500/20 group-hover/avatar:border-saffron-500/50 transition-colors"></div>
                </div>
                {/* Rank Badge */}
                <div className="absolute -bottom-2 -right-2 z-20 bg-saffron-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md border-2 border-white dark:border-deep-900 uppercase tracking-wider">
                   Lvl {Math.floor(readCount / 5) + 1}
                </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                {isEditing ? (
                    <div className="flex items-center space-x-2">
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="border-b-2 border-saffron-500 focus:outline-none text-3xl font-serif font-bold text-ink-900 dark:text-white bg-transparent"
                        autoFocus
                    />
                    <button 
                        onClick={handleNameSave}
                        className="text-xs bg-saffron-600 text-white px-3 py-1 rounded-full hover:bg-saffron-700 shadow-sm"
                    >
                        Save
                    </button>
                    </div>
                ) : (
                    <>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink-900 dark:text-white tracking-wide transition-colors duration-500">{name}</h1>
                    <button onClick={() => setIsEditing(true)} className="text-ink-500 dark:text-gray-500 hover:text-saffron-600 dark:hover:text-saffron-500 transition-colors">
                        <Edit2 className="w-5 h-5" />
                    </button>
                    </>
                )}
                </div>
                <p className="text-ink-600 dark:text-gray-400 text-lg mb-2 transition-colors duration-500 italic">"{levelInfo.desc}"</p>
                
                {/* Level Indicator & Certificate Button */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                    <div className="inline-flex items-center space-x-3 bg-white dark:bg-deep-800 px-4 py-2 rounded-full text-sm font-medium text-ink-700 dark:text-gray-300 border border-ink-500/10 dark:border-deep-700 shadow-inner transition-colors duration-500">
                        <Trophy className="w-4 h-4 text-saffron-500" />
                        <span className="font-bold tracking-wide uppercase text-xs">{levelInfo.title}</span>
                        <span className="w-1 h-1 rounded-full bg-ink-300 dark:bg-deep-600"></span>
                        <span className="font-serif italic text-saffron-600 dark:text-saffron-400">{levelInfo.subtitle}</span>
                    </div>

                    {levelInfo.canCertify && (
                        <button 
                            onClick={() => setShowCertificate(true)}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-saffron-100 to-amber-100 dark:from-saffron-900/30 dark:to-amber-900/30 border border-saffron-200 dark:border-saffron-700/50 rounded-full text-saffron-800 dark:text-saffron-200 text-xs font-bold uppercase tracking-wider hover:shadow-md transition-all active:scale-95"
                        >
                            <Scroll className="w-4 h-4" />
                            <span>View Certificate</span>
                        </button>
                    )}
                </div>
            </div>
          </div>

          {/* Right Side: Stats & Theme */}
          <div className="flex flex-col gap-6 items-end w-full md:w-auto">
             <div className="flex space-x-4 w-full md:w-auto justify-center md:justify-end">
                <div className="text-center p-4 bg-white dark:bg-deep-800 rounded-2xl shadow-sm border border-ink-500/10 dark:border-deep-700 min-w-[100px] hover:shadow-md transition-all duration-300">
                    <div className="text-2xl font-bold text-saffron-600 dark:text-saffron-500">{savedVerses.length}</div>
                    <div className="text-[10px] text-ink-400 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Saved</div>
                </div>
                <div className="text-center p-4 bg-white dark:bg-deep-800 rounded-2xl shadow-sm border border-ink-500/10 dark:border-deep-700 min-w-[100px] hover:shadow-md transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{readCount}</div>
                    <div className="text-[10px] text-ink-400 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Read</div>
                </div>
            </div>

            {/* Redesigned Theme Switcher */}
            <div className="flex items-center p-1 bg-ink-200/50 dark:bg-deep-800/50 rounded-lg border border-ink-500/10 dark:border-deep-700 mx-auto md:mx-0">
                 <button
                    onClick={() => currentTheme !== 'parchment' && onToggleTheme()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 ${
                        currentTheme === 'parchment' 
                        ? 'bg-white text-ink-900 shadow-sm' 
                        : 'text-ink-500 hover:text-ink-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                 >
                     <Scroll className="w-4 h-4" />
                     <span>Parchment</span>
                 </button>
                 <button
                    onClick={() => currentTheme !== 'dark' && onToggleTheme()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-bold transition-all duration-300 ${
                        currentTheme === 'dark' 
                        ? 'bg-deep-700 text-white shadow-sm' 
                        : 'text-ink-500 hover:text-ink-900 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                 >
                     <Moon className="w-4 h-4" />
                     <span>Dark</span>
                 </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Sections */}
      <div className="flex space-x-8 border-b border-ink-500/10 dark:border-deep-700 mb-8 transition-colors duration-500">
        <button 
            onClick={() => setActiveTab('saved')}
            className={`pb-4 text-lg font-medium flex items-center space-x-2 transition-colors relative ${activeTab === 'saved' ? 'text-saffron-600 dark:text-saffron-500' : 'text-ink-500 dark:text-gray-500 hover:text-ink-800 dark:hover:text-gray-300'}`}
        >
            <BookMarked className="w-5 h-5" />
            <span>Saved Verses</span>
            {activeTab === 'saved' && <span className="absolute bottom-0 left-0 w-full h-1 bg-saffron-600 dark:bg-saffron-500 rounded-t-full shadow-[0_0_10px_rgba(255,193,7,0.5)]"></span>}
        </button>
        <button 
            onClick={() => setActiveTab('achievements')}
            className={`pb-4 text-lg font-medium flex items-center space-x-2 transition-colors relative ${activeTab === 'achievements' ? 'text-saffron-600 dark:text-saffron-500' : 'text-ink-500 dark:text-gray-500 hover:text-ink-800 dark:hover:text-gray-300'}`}
        >
            <Award className="w-5 h-5" />
            <span>Achievements</span>
            {activeTab === 'achievements' && <span className="absolute bottom-0 left-0 w-full h-1 bg-saffron-600 dark:bg-saffron-500 rounded-t-full shadow-[0_0_10px_rgba(255,193,7,0.5)]"></span>}
        </button>
      </div>

      {/* Saved Verses Content */}
      {activeTab === 'saved' && (
          savedVerses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
              {savedVerses.map(verse => (
                <VerseCard 
                  key={verse.id} 
                  verse={verse} 
                  onClick={() => handleOpenVerse(verse)} 
                  isSaved={true}
                  onToggleSave={() => onToggleSave(verse)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-paper-100 dark:bg-deep-900 rounded-2xl border-2 border-dashed border-ink-500/20 dark:border-deep-700 transition-colors duration-500">
              <BookMarked className="w-16 h-16 text-ink-300 dark:text-deep-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-ink-800 dark:text-gray-300">No saved verses yet</h3>
              <p className="text-ink-500 dark:text-gray-500 mt-2 max-w-md mx-auto">Click the bookmark icon on any verse to save it here for quick reflection.</p>
            </div>
          )
      )}

      {/* Achievements Content */}
      {activeTab === 'achievements' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 bg-paper-100 dark:bg-deep-800 text-ink-900 dark:text-white p-6 md:p-8 rounded-xl shadow-lg border border-ink-500/10 dark:border-deep-700 relative overflow-hidden transition-colors duration-500 group">
                   <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-saffron-500/5 dark:from-saffron-900/10 to-transparent"></div>
                   
                   <div className="flex justify-between items-end mb-4 relative z-10">
                      <div>
                          <h3 className="text-xl font-bold mb-1 font-epic text-ink-900 dark:text-saffron-100 flex items-center gap-2">
                             Your Journey <span className="text-xs font-sans font-normal text-ink-400 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">Rank: {levelInfo.title}</span>
                          </h3>
                          <p className="text-ink-500 dark:text-gray-400 text-sm">Unlock divine badges by immersing yourself in wisdom.</p>
                      </div>
                      <div className="text-right">
                          <div className="text-3xl font-bold text-saffron-600 dark:text-saffron-400 leading-none">{unlockedCount} <span className="text-lg text-ink-400 dark:text-gray-500 font-normal">/ {achievementsList.length}</span></div>
                      </div>
                   </div>
                   
                   {/* Enhanced Progress Bar */}
                   <div className="relative">
                       <div className="w-full h-4 bg-ink-200 dark:bg-deep-900/50 rounded-full overflow-hidden border border-ink-300 dark:border-deep-700/50 relative z-10 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-400 shadow-[0_0_15px_rgba(255,160,0,0.6)] transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${progressPercent}%` }}
                          >
                              {/* Glint Animation */}
                              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-[shimmer_2s_infinite]"></div>
                          </div>
                       </div>
                       
                       {/* Milestones markers */}
                       <div className="absolute top-5 w-full flex justify-between text-[9px] font-bold text-ink-400 uppercase tracking-wider px-1">
                           <span>Start</span>
                           <span>Disciple</span>
                           <span>Sage</span>
                           <span>Moksha</span>
                       </div>
                   </div>
                   
                   <style>{`
                      @keyframes shimmer {
                          0% { transform: translateX(-150%); }
                          100% { transform: translateX(150%); }
                      }
                   `}</style>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                  {achievementsList.map((achievement, index) => (
                      <div 
                        key={achievement.id} 
                        className={`relative p-6 rounded-xl border transition-all duration-500 overflow-hidden group 
                            ${achievement.unlocked 
                                ? `bg-gradient-to-br ${achievement.color} shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(0,0,0,0.15)]` 
                                : 'bg-paper-100/40 dark:bg-deep-900/40 border-ink-200 dark:border-deep-800/50 grayscale-[0.8] opacity-70 hover:opacity-100'
                            }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                          {/* Unlocked Shine Effect */}
                          {achievement.unlocked && (
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 dark:via-white/5 to-white/0 skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                          )}

                          <div className="flex items-start space-x-4 relative z-10">
                              <div className={`p-4 rounded-full border shadow-inner transition-transform duration-300 group-hover:scale-110 ${achievement.unlocked ? 'bg-white/50 dark:bg-deep-900/30 border-white/10' : 'bg-paper-200 dark:bg-deep-950 border-ink-200 dark:border-deep-800'}`}>
                                  <achievement.icon className={`w-6 h-6 ${achievement.unlocked ? 'text-ink-900 dark:text-white drop-shadow-md' : 'text-ink-400 dark:text-gray-600'}`} />
                              </div>
                              
                              <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <h4 className={`font-bold font-serif text-lg ${achievement.unlocked ? 'text-ink-900 dark:text-white' : 'text-ink-400 dark:text-gray-400 group-hover:text-ink-600 dark:group-hover:text-gray-300'}`}>
                                              {achievement.name}
                                          </h4>
                                          {achievement.sanskritName && (
                                              <p className={`text-xs font-serif italic mb-1 ${achievement.unlocked ? 'text-ink-700 dark:text-gray-300' : 'text-ink-400 dark:text-gray-500'}`}>{achievement.sanskritName}</p>
                                          )}
                                      </div>
                                      {achievement.unlocked ? (
                                         <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 fill-green-100 dark:fill-green-900/30 animate-in zoom-in duration-300" />
                                      ) : (
                                         <Lock className="w-4 h-4 text-ink-400 dark:text-gray-600" />
                                      )}
                                  </div>
                                  
                                  <p className={`text-sm mt-2 leading-relaxed font-light ${achievement.unlocked ? 'text-ink-800 dark:text-gray-300' : 'text-ink-400 dark:text-gray-500'}`}>
                                      {achievement.description}
                                  </p>
                                  
                                  <div className={`mt-4 text-[10px] font-bold uppercase tracking-widest px-2 py-1 inline-block rounded border ${
                                      achievement.unlocked 
                                      ? 'text-ink-900/80 dark:text-white/80 border-black/10 dark:border-white/20 bg-white/20 dark:bg-white/10' 
                                      : 'text-ink-400 dark:text-gray-600 border-ink-300 dark:border-deep-700 bg-paper-200 dark:bg-deep-950'
                                  }`}>
                                      {achievement.unlocked ? 'Unlocked' : 'Locked'}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {selectedVerse && (
        <VerseDetail 
          verse={selectedVerse} 
          onClose={() => setSelectedVerse(null)} 
          isSaved={savedVerses.some(v => v.id === selectedVerse.id)}
          onToggleSave={() => onToggleSave(selectedVerse)}
          isDarkTheme={currentTheme === 'dark'}
          onToggleTheme={onToggleTheme}
        />
      )}

      {/* Certificate Modal */}
      {showCertificate && (
          <CertificateModal 
            userName={name} 
            levelTitle={levelInfo.title} 
            onClose={() => setShowCertificate(false)} 
          />
      )}
    </div>
  );
};

export default Profile;
