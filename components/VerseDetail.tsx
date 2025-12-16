
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GitaVerse } from '../types';
import { 
  X, Bookmark, Play, Pause, ChevronLeft, ChevronRight, Copy, 
  Volume2, VolumeX, Minimize2, Sparkles, AlertTriangle, Repeat, Gauge, 
  WifiOff, RefreshCw, Maximize2, Hourglass, Lock, Signal, Loader2, Sun, Moon, Share2,
  Activity
} from 'lucide-react';
import { streamSpeech, AUDIO_CACHE } from '../services/geminiService';
import { PcmAudioPlayer, DroneSynthesizer } from '../utils/audio';

interface VerseDetailProps {
  verse: GitaVerse;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  nextVerse?: GitaVerse;
  isDarkTheme?: boolean;
  onToggleTheme?: () => void; 
}

const SAFETY_TIMEOUT_MS = 15000; 

// --- CUSTOM COMPONENTS ---

const DivineAudioLoader: React.FC = () => (
  <div className="flex items-center gap-3 animate-in fade-in duration-500 group cursor-default">
    <div className="relative w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
       {/* Glow Effect */}
       <div className="absolute inset-0 bg-saffron-500/30 rounded-full blur-md animate-pulse"></div>
       
       {/* Rotating Halo - Outer */}
       <div className="absolute inset-0 border-[1.5px] border-dotted border-saffron-700/60 rounded-full animate-[spin_8s_linear_infinite]"></div>
       
       {/* Rotating Halo - Inner (Reverse) */}
       <div className="absolute inset-0 border-[1px] border-dashed border-saffron-500/50 rounded-full animate-[spin_12s_linear_infinite_reverse] scale-75"></div>
       
       {/* Center Om */}
       <div className="relative z-10 animate-[pulse_3s_ease-in-out_infinite] text-saffron-900 drop-shadow-sm transform scale-110">
           <span className="font-serif font-bold text-sm">ॐ</span>
       </div>
    </div>
    <div className="flex flex-col justify-center">
        <span className="text-[10px] font-bold text-saffron-800 tracking-[0.2em] uppercase animate-pulse">Chanting...</span>
    </div>
  </div>
);

// --- CUSTOM ICONS ---

const LotusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.5C12 2.5 15.5 8 16.5 11C17.5 14 15 16.5 12 16.5C9 16.5 6.5 14 7.5 11C8.5 8 12 2.5 12 2.5Z" opacity="0.8"/>
    <path d="M12 16.5C12 16.5 16 16.5 19 14.5C21 13 21 10 21 10C21 10 19 19 12 21.5C5 19 3 10 3 10C3 13 5 14.5C8 16.5 12 16.5 12 16.5Z" />
    <circle cx="12" cy="19" r="1.5" className="animate-pulse" />
  </svg>
);

const SwastikIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4V20 M4 12H20" />
    <path d="M12 4H20 M20 12V20 M12 20H4 M4 12V4" strokeDasharray="0 8 16 0" /> 
    <path d="M12 4H19" />
    <path d="M20 12V19" />
    <path d="M12 20H5" />
    <path d="M4 12V5" />
    <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="16" r="1" fill="currentColor" stroke="none" />
    <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const EyeIcon: React.FC<{ className?: string; isOpen: boolean }> = ({ className, isOpen }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <g className={`transition-all duration-700 ease-in-out origin-center ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-y-0'}`}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" fill="currentColor" className="text-saffron-600 animate-pulse" />
        <circle cx="12" cy="12" r="1" fill="black" />
    </g>
    <g className={`transition-all duration-700 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
        <path d="M2 12s3 5 10 5 10-5 10-5" />
        <path d="M4 14l1 2 M8 16l.5 2.5 M12 17l0 3 M16 16l-.5 2.5 M20 14l-1 2" strokeWidth="1.5" />
    </g>
    <path 
        d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" 
        className={`transition-all duration-700 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-0'}`} 
    />
  </svg>
);

const DiyaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C12 2 10 6 10 9C10 11.5 12 12 12 12C12 12 14 11.5 14 9C14 6 12 2 12 2Z" className="text-orange-500 animate-pulse" />
      <path d="M4 14C4 18.4183 7.58172 22 12 22C16.4183 22 20 18.4183 20 14H4Z" />
      <path d="M4 14L2 13M20 14L22 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const VerseDetail: React.FC<VerseDetailProps> = ({ 
    verse, onClose, isSaved = false, onToggleSave, 
    onNext, onPrev, hasNext, hasPrev, isDarkTheme = false, onToggleTheme 
}) => {
  // Animation Logic
  const prevIdRef = useRef(verse.id);
  const isNavigating = verse.id !== prevIdRef.current;
  const slideClass = isNavigating
      ? (verse.id > prevIdRef.current ? 'animate-in fade-in slide-in-from-right-8' : 'animate-in fade-in slide-in-from-left-8')
      : 'animate-in fade-in slide-in-from-bottom-8';
  
  useEffect(() => {
      prevIdRef.current = verse.id;
  }, [verse.id]);

  // Theme & Transformation Logic
  const [localIsDark, setLocalIsDark] = useState(isDarkTheme);
  const [isTransforming, setIsTransforming] = useState(false);
  
  useEffect(() => {
      setLocalIsDark(isDarkTheme);
  }, [isDarkTheme]);

  const handleThemeToggle = () => {
    if (!onToggleTheme) {
        setLocalIsDark(!localIsDark);
        return;
    }

    setIsTransforming(true);
    PcmAudioPlayer.playBell(); // Play divine bell sound
    
    // The "Divine Flash" Transformation Sequence
    setTimeout(() => {
        onToggleTheme(); // Switch theme while screen is white
    }, 2000);

    setTimeout(() => {
        setIsTransforming(false);
    }, 4000);
  };

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isIslandExpanded, setIsIslandExpanded] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isAnimatingSave, setIsAnimatingSave] = useState(false);
  
  // Sync State
  const [showResync, setShowResync] = useState(false);
  const lastProgressRef = useRef<number>(0);
  const stuckCounterRef = useRef<number>(0);
  
  // Features
  const [isLooping, setIsLooping] = useState(false);
  const isLoopingRef = useRef(isLooping); // Use ref for event callbacks
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  
  // Pranayama
  const [isMeditating, setIsMeditating] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  // Touch
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);

  // Refs
  const playerRef = useRef<PcmAudioPlayer | null>(null);
  const droneRef = useRef<DroneSynthesizer | null>(null);
  const streamSessionRef = useRef<number>(0);
  const safetyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const bgParallaxRef = useRef<HTMLDivElement>(null);

  const isAudioActive = isPlaying || isPaused || isLoadingAudio || (duration > 0) || !!audioError;
  const playerMode = isIslandExpanded ? 'expanded' : (isAudioActive ? 'mini' : 'fab');

  useEffect(() => {
      isLoopingRef.current = isLooping;
  }, [isLooping]);

  useEffect(() => {
      playerRef.current = new PcmAudioPlayer(24000);
      droneRef.current = new DroneSynthesizer();
      
      // Setup Ended Callback safely
      playerRef.current.setOnEnded(() => {
          if (isLoopingRef.current) { 
              playerRef.current?.playFrom(0); 
              setIsPlaying(true); 
              setIsPaused(false);
          } else { 
              setIsPlaying(false); 
              setIsPaused(false); 
              setProgress(0); 
          }
      });

      return () => {
          streamSessionRef.current += 1; 
          playerRef.current?.stop();
          droneRef.current?.stop();
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
          if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      };
  }, []);

  useEffect(() => { stopAudio(); }, [verse.id]);

  useEffect(() => {
      if (isDroneActive) droneRef.current?.start();
      else droneRef.current?.stop();
  }, [isDroneActive]);

  useEffect(() => {
      if (isMeditating) {
          let timer = 0;
          setBreathPhase('Inhale');
          PcmAudioPlayer.playBell();
          breathIntervalRef.current = setInterval(() => {
              timer = (timer + 1) % 12;
              if (timer === 0) { setBreathPhase('Inhale'); PcmAudioPlayer.playBell(); }
              else if (timer === 4) { setBreathPhase('Hold'); }
              else if (timer === 8) { setBreathPhase('Exhale'); PcmAudioPlayer.playBell(); }
          }, 1000);
      } else {
          if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      }
      return () => { if (breathIntervalRef.current) clearInterval(breathIntervalRef.current); };
  }, [isMeditating]);

  const stopAudio = () => {
      streamSessionRef.current += 1;
      playerRef.current?.stop();
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      setIsPlaying(false);
      setIsPaused(false);
      setIsLoadingAudio(false);
      setProgress(0);
      setDuration(0);
      setAudioError(null);
      setIsIslandExpanded(false);
      setShowResync(false);
  };

  const handleSaveClick = () => {
      if (onToggleSave) {
          onToggleSave();
          setIsAnimatingSave(true);
          setTimeout(() => setIsAnimatingSave(false), 300);
      }
  };

  const handleShare = async () => {
      const shareData: ShareData = {
          title: 'Gita Wisdom',
          text: `Bhagavad Gita ${verse.chapter}.${verse.verse}\n\n${verse.sanskrit}\n\n${verse.translation}`,
      };

      if (window.location.protocol.startsWith('http')) {
          shareData.url = window.location.href;
      }

      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              console.error('Error sharing:', err);
          }
      } else {
          navigator.clipboard.writeText(shareData.text || '');
          alert('Verse copied to clipboard!');
      }
  };

  const updateVisuals = () => {
    if (!playerRef.current) return;
    
    // UI State Sync: Check if stalled
    if (isPlaying && !isPaused) {
        const currentTime = playerRef.current.getCurrentTime();
        setProgress(currentTime);
        setDuration(playerRef.current.getDuration() || 0);
        
        // Sync Detection
        if (Math.abs(currentTime - lastProgressRef.current) < 0.01) {
            stuckCounterRef.current++;
            if (stuckCounterRef.current > 30) { // Approx 0.5s stalled
                setShowResync(true);
            }
        } else {
            stuckCounterRef.current = 0;
            setShowResync(false);
        }
        lastProgressRef.current = currentTime;
    }

    if (canvasRef.current && isIslandExpanded) {
        const analyser = playerRef.current.getAnalyser();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (analyser && ctx) {
            if (canvas.width !== canvas.offsetWidth) { 
                canvas.width = canvas.offsetWidth; 
                canvas.height = canvas.offsetHeight; 
            }
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            if (isPlaying && !isPaused) {
                analyser.getByteFrequencyData(dataArray);
            } else {
                const time = Date.now() / 2000;
                const pulse = (Math.sin(time) + 1) * 30 + 10; 
                for(let i=0; i<bufferLength; i++) {
                    dataArray[i] = Math.max(0, pulse - Math.abs(i - bufferLength/2));
                }
            }
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            
            const avg = dataArray.reduce((a,b)=>a+b,0) / bufferLength;
            const maxRadius = Math.max(canvas.width, canvas.height) * 0.6;
            const waveCount = 6;
            const time = Date.now() / 1000;

            for (let i = 0; i < waveCount; i++) {
                const speed = (isPlaying && !isPaused) ? 0.5 : 0.2;
                const waveProgress = ((time * speed) + (i / waveCount)) % 1; 
                const radius = waveProgress * maxRadius;
                
                let alpha = (1 - waveProgress) * (avg / 255); 
                if (isPaused) alpha = (1 - waveProgress) * 0.2; 

                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 179, 0, ${alpha})`;
                ctx.lineWidth = 2 + (avg/255) * 5;
                ctx.stroke();

                if (i===0) {
                    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.6);
                    grad.addColorStop(0, `rgba(255, 200, 50, ${alpha * 0.4})`);
                    grad.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad;
                    ctx.fill();
                }
            }
            
            const coreScale = 1 + (avg / 255) * 0.4;
            ctx.beginPath();
            ctx.arc(cx, cy, 15 * coreScale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 204, 128, ${isPaused ? 0.5 : 0.9})`;
            ctx.shadowBlur = isPaused ? 15 : 30;
            ctx.shadowColor = '#ffb300';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    if (isAudioActive || isIslandExpanded) {
        animationRef.current = requestAnimationFrame(updateVisuals);
    }
  };

  useEffect(() => {
    if ((isAudioActive || isIslandExpanded) && !animationRef.current) {
        animationRef.current = requestAnimationFrame(updateVisuals);
    }
    return () => { 
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }
  }, [isPlaying, isPaused, isIslandExpanded, isAudioActive]);

  const togglePlayback = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAudioError(null);
    if (!playerRef.current) return;
    
    // Case 1: Currently Playing -> Pause
    if (isPlaying && !isPaused) {
        playerRef.current.pause();
        // Force flush state update
        setIsPlaying(false); // Visually stopped
        setIsPaused(true);   // Logically paused
        return;
    }

    // Case 2: Currently Paused -> Resume
    if (isPaused) {
        playerRef.current.resume();
        setIsPlaying(true);
        setIsPaused(false);
        return;
    }

    // Case 3: Start Fresh
    const currentSessionId = Date.now();
    streamSessionRef.current = currentSessionId;
    setIsLoadingAudio(true);
    
    playerRef.current.stop();
    playerRef.current.setPlaybackRate(playbackRate);

    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    safetyTimeoutRef.current = setTimeout(() => {
        if (streamSessionRef.current === currentSessionId && isLoadingAudio) {
            setIsLoadingAudio(false); stopAudio(); setAudioError("Connection timeout. Tap retry."); setIsIslandExpanded(true);
        }
    }, SAFETY_TIMEOUT_MS);

    try {
        const cacheKey = `verse-${verse.id}`;
        
        if (AUDIO_CACHE.has(cacheKey)) {
            const cached = AUDIO_CACHE.get(cacheKey)!;
            playerRef.current.scheduleChunk(cached); 
            playerRef.current.finishStreaming(); 
            playerRef.current.playFrom(0); 
            
            setIsLoadingAudio(false); 
            setIsPlaying(true);
            if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
            return;
        }

        const cleanSanskrit = verse.sanskrit.replace(/[*_#`~]/g, '');
        const cleanTranslation = verse.translation.replace(/[*_#`~]/g, '');
        
        playerRef.current.startStreaming();
        let chunksReceived = 0;

        const fullBase64 = await streamSpeech(`${cleanSanskrit}. ${cleanTranslation}`, (chunk) => {
             if (streamSessionRef.current !== currentSessionId) return;
             if (playerRef.current) {
                 playerRef.current.scheduleChunk(chunk);
                 chunksReceived++;
                 if (chunksReceived === 1) { 
                     setIsLoadingAudio(false); 
                     setIsPlaying(true);
                     if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
                 }
             }
        });

        if (streamSessionRef.current === currentSessionId) {
             if (playerRef.current) playerRef.current.finishStreaming();
             
             if (fullBase64 && chunksReceived > 0) AUDIO_CACHE.set(cacheKey, fullBase64);
             setIsLoadingAudio(false);
             if (fullBase64 && !isPlaying) setIsPlaying(true);
        }

    } catch (error: any) {
        if (streamSessionRef.current === currentSessionId) {
             console.error("Audio playback error:", error);
             stopAudio();
             let msg = "Playback failed.";
             const errStr = error.message || error.toString();
             
             if (errStr.includes("QUOTA") || errStr.includes("429")) {
                 msg = "Daily voice limit reached. Try again later.";
             } else if (error.name === 'NotAllowedError') {
                 msg = "Audio blocked. Tap again.";
             } else if (errStr.includes('Network')) {
                 msg = "Network error.";
             }
             setAudioError(msg); setIsIslandExpanded(true);
        }
    } finally {
        if (streamSessionRef.current === currentSessionId) setIsLoadingAudio(false); 
    }
  };

  const handleResync = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!playerRef.current) return;
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.playFrom(currentTime);
      setIsPlaying(true);
      setIsPaused(false);
      setShowResync(false);
      stuckCounterRef.current = 0;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const t = parseFloat(e.target.value); setProgress(t);
      if (playerRef.current) { playerRef.current.playFrom(t); setIsPlaying(true); setIsPaused(false); }
  };
  const cycleSpeed = () => {
      const rates = [0.75, 1.0, 1.25, 1.5], idx = rates.indexOf(playbackRate), next = rates[(idx + 1) % rates.length];
      setPlaybackRate(next); playerRef.current?.setPlaybackRate(next);
  };
  const fmtTime = (t: number) => { if (isNaN(t) || !isFinite(t)) return "0:00"; const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${s.toString().padStart(2, '0')}`; };

  // Swipe logic
  const onTouchStart = (e: React.TouchEvent) => { if ((e.target as HTMLElement).tagName !== 'INPUT') { setTouchEnd(null); setTouchStart({x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY}); } };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd({x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY}); };
  const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      const dx = touchStart.x - touchEnd.x;
      if (Math.abs(dx) > 50) { if (dx > 0 && hasNext && onNext) onNext(); if (dx < 0 && hasPrev && onPrev) onPrev(); }
  };
  
  // Parallax Effect
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!bgParallaxRef.current || window.innerWidth < 768) return;
      const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 20; 
      const y = ((e.clientY - top) / height - 0.5) * 20;
      bgParallaxRef.current.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
  };

  const renderErrorIcon = () => {
      if (!audioError) return <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-red-400 mb-2 md:mb-3" />;
      if (audioError.includes("Network")) return <WifiOff className="w-8 h-8 md:w-10 md:h-10 text-red-400 mb-2 md:mb-3" />;
      if (audioError.includes("limit")) return <Hourglass className="w-8 h-8 md:w-10 md:h-10 text-saffron-400 mb-2 md:mb-3" />;
      if (audioError.includes("blocked") || audioError.includes("activate")) return <Lock className="w-8 h-8 md:w-10 md:h-10 text-saffron-400 mb-2 md:mb-3" />;
      return <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-red-400 mb-2 md:mb-3" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {isTransforming && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none overflow-hidden">
             <div className="absolute inset-0 bg-white animate-[divineFlash_4s_ease-in-out_forwards] mix-blend-screen z-20"></div>
             <div className="absolute inset-0 bg-saffron-100 animate-[divineFlash_4s_ease-in-out_forwards] mix-blend-plus-lighter opacity-80 z-10"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,1)_0%,rgba(255,215,0,0.6)_40%,transparent_80%)] animate-[divineSource_4s_ease-in-out_forwards] z-30"></div>

             <style>{`
                @keyframes divineFlash {
                    0% { opacity: 0; }
                    40% { opacity: 1; } 
                    60% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes divineSource {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    40% { transform: translate(-50%, -50%) scale(2); opacity: 1; }
                    60% { transform: translate(-50%, -50%) scale(3); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
                }
             `}</style>
          </div>
      )}

      {/* Ancient Torn Scroll Container */}
      <div 
        className={`relative w-full h-full flex flex-col overflow-hidden shadow-2xl transition-all duration-[3000ms] ease-in-out
            bg-[#dcb880]
            ${isZenMode ? 'sepia-[0.3] contrast-110 saturate-[0.8] animate-parchment' : ''}
            ${isTransforming ? 'scale-95 brightness-200 saturate-0' : 'scale-100 brightness-100 saturate-100'}
        `}
        style={{
            boxShadow: "inset 0 0 80px rgba(62, 39, 35, 0.3)"
        }}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onMouseMove={handleMouseMove}
      >
        <div ref={bgParallaxRef} className="absolute inset-0 z-0 pointer-events-none transition-transform duration-100 ease-out will-change-transform" style={{ transform: 'scale(1.1)' }}>
             <div className="absolute inset-0 bg-[#dcb880]"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-100 mix-blend-multiply"></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper-pattern.png')] opacity-60 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,rgba(62,39,35,0.4)_100%)]"></div>
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none" style={{ boxShadow: "inset 0 0 30px #3e2723, inset 0 0 10px #000" }}></div>

        {/* Header - Sticky */}
        <div className={`sticky top-0 z-30 px-4 md:px-8 py-2 flex justify-between items-center shadow-lg bg-[#bcaaa4] border-b-2 border-[#8d6e63] shrink-0 transition-all duration-500 ${isZenMode ? '-translate-y-full opacity-0' : ''}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-70 mix-blend-multiply"></div>
          <div className="flex items-center gap-3 md:gap-4 relative z-10">
             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#3e2723] flex items-center justify-center text-[#ffcc80] font-serif font-bold text-xl md:text-2xl border-2 border-[#8d6e63] shadow-inner">ॐ</div>
             <div key={verse.id} className={`${slideClass} duration-500`}>
                <span className="text-[10px] md:text-xs font-bold text-[#4e342e] tracking-[0.2em] uppercase block mb-1">Bhagavad Gita</span>
                <h2 className="text-lg md:text-2xl font-epic font-bold text-[#2d1b0e]">Chapter {verse.chapter} • Verse {verse.verse}</h2>
             </div>
          </div>
          <div className="flex gap-1 md:gap-2 relative z-10">
            <button onClick={handleThemeToggle} className="p-2 hover:bg-[#8d6e63]/20 rounded-full transition-colors text-[#3e2723]" title="Transform Theme">
                {localIsDark ? <Sun className="w-5 h-5 md:w-6 md:h-6" /> : <Moon className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <button onClick={() => setIsMeditating(true)} className="p-2 hover:bg-[#8d6e63]/20 rounded-full transition-colors text-[#3e2723]" title="Pranayama">
                <EyeIcon className="w-5 h-5 md:w-6 md:h-6" isOpen={!isMeditating} />
            </button>
            <button onClick={() => setIsDroneActive(!isDroneActive)} className={`p-2 hover:bg-[#8d6e63]/20 rounded-full transition-colors ${isDroneActive ? 'text-saffron-700 bg-[#8d6e63]/10' : 'text-[#3e2723]'}`} title="Atmosphere"><DiyaIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
            <button onClick={() => setIsZenMode(!isZenMode)} className="p-2 hover:bg-[#8d6e63]/20 rounded-full transition-colors text-[#3e2723]" title="Zen Mode"><SwastikIcon className="w-6 h-6 md:w-7 md:h-7" /></button>
            <button onClick={onClose} className="p-2 hover:bg-[#8d6e63]/20 rounded-full transition-colors"><X className="w-7 h-7 md:w-8 md:h-8 text-[#3e2723]" /></button>
          </div>
        </div>

        {/* Side Floating Navigation (Next/Prev) */}
        {onPrev && (
            <button 
                onClick={onPrev} 
                disabled={!hasPrev}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-[#3e2723]/80 backdrop-blur-sm rounded-full text-[#ffcc80] border border-[#a1887f] hover:bg-[#3e2723] hover:scale-110 shadow-lg transition-all disabled:opacity-0"
                aria-label="Previous Verse"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
        )}
        {onNext && (
            <button 
                onClick={onNext} 
                disabled={!hasNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 p-3 bg-[#3e2723]/80 backdrop-blur-sm rounded-full text-[#ffcc80] border border-[#a1887f] hover:bg-[#3e2723] hover:scale-110 shadow-lg transition-all disabled:opacity-0"
                aria-label="Next Verse"
            >
                <ChevronRight className="w-6 h-6" />
            </button>
        )}

        {/* Scrollable Content */}
        <div className="flex-grow relative overflow-hidden z-10 flex flex-col">
          {/* Main content area */}
          <div key={verse.id} className={`w-full h-full overflow-y-auto p-3 md:p-4 pb-32 relative ${slideClass} duration-700`}>
              <div className="relative mx-auto max-w-4xl mt-2 text-center group/text">
                <div className={`relative p-4 md:p-6 border-y-2 border-[#5d4037] bg-[#f5f5f5]/50 backdrop-blur-[2px] shadow-[inset_0_0_40px_rgba(62,39,35,0.1)] transition-all duration-700 hover:bg-[#f5f5f5]/60 ${isZenMode ? 'scale-105 border-transparent shadow-none bg-transparent' : ''}`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-40 mix-blend-multiply pointer-events-none"></div>
                    {!isZenMode && (<div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#5d4037] opacity-60"><Sparkles className="w-6 h-6 animate-pulse" /></div>)}
                    <p className="relative z-10 font-antique text-2xl md:text-5xl lg:text-6xl text-[#1a0f0a] leading-[1.6] whitespace-pre-line drop-shadow-sm mb-4" style={{ textShadow: '1px 1px 2px rgba(62, 39, 35, 0.2)' }}>{verse.sanskrit}</p>
                    <div className="flex items-center justify-center my-3 opacity-80 relative z-10">
                        <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent to-[#5d4037]"></div>
                        <div className="mx-4 text-[#5d4037]"><LotusIcon className="w-5 h-5 md:w-6 md:h-6" /></div>
                        <div className="h-px w-16 md:w-24 bg-gradient-to-l from-transparent to-[#5d4037]"></div>
                    </div>
                    
                    <p className="text-lg md:text-2xl text-[#4e342e] font-serif italic opacity-90 relative z-10">{verse.transliteration}</p>
                </div>
              </div>

              <div className={`text-center max-w-5xl mx-auto relative z-10 px-2 md:px-4 mt-4 transition-opacity duration-500`}>
                <p className={`text-xl md:text-3xl text-[#2d1b0e] font-serif leading-relaxed ${isZenMode ? 'opacity-90' : 'opacity-100'}`}>"{verse.translation}"</p>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10 transition-all duration-500 mt-5 max-w-5xl mx-auto ${isZenMode ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                <div className="bg-[#fff8e1]/70 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-[#a1887f] shadow-sm relative overflow-hidden">
                    <h3 className="flex items-center text-xs md:text-sm font-bold text-[#3e2723] uppercase tracking-widest mb-2 border-b-2 border-[#d7ccc8] pb-2">Core Teaching</h3>
                    <p className="text-[#3e2723] leading-relaxed text-base md:text-lg font-serif">{verse.coreTeaching}</p>
                </div>
                <div className="bg-[#fff8e1]/70 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-[#a1887f] shadow-sm relative overflow-hidden">
                    <h3 className="flex items-center text-xs md:text-sm font-bold text-[#3e2723] uppercase tracking-widest mb-2 border-b-2 border-[#d7ccc8] pb-2">Practical Application</h3>
                    <p className="text-[#3e2723] leading-relaxed text-base md:text-lg font-serif">{verse.practicalApplication}</p>
                </div>
              </div>
          </div>
        </div>

        {/* Dynamic Island Player */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out 
              ${isIslandExpanded ? 'w-[95%] md:w-[500px]' : playerMode === 'mini' ? 'w-[95%] md:w-[420px]' : 'w-16 md:w-20'} 
              ${isZenMode ? 'translate-y-full opacity-0 pointer-events-none' : ''}`}
        >
            <div 
                className={`relative w-full overflow-hidden transition-all duration-500
                ${isIslandExpanded ? 'h-auto min-h-[350px] rounded-[32px]' : playerMode === 'mini' ? 'h-20 rounded-2xl' : 'h-16 md:h-20 rounded-full hover:scale-110 shadow-xl'} 
                bg-gradient-to-b from-[#1a0f0a] to-[#3e2723] border-[3px] border-[#ffb300]/40 shadow-2xl`}
                onClick={(e) => { e.stopPropagation(); !isIslandExpanded && playerMode === 'fab' && togglePlayback(e); }}
            >
                {/* 1. FAB State */}
                {!isIslandExpanded && playerMode === 'fab' && (
                     <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
                         {isLoadingAudio && <div className="absolute inset-0 border-2 border-[#ffb300] rounded-full border-t-transparent animate-spin"></div>}
                         <div className="text-[#ffcc80]">{isPlaying && !isPaused ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}</div>
                     </div>
                )}

                {/* 2. Miniplayer State */}
                {playerMode === 'mini' && (
                    <div className="absolute inset-0 flex items-center justify-between px-4 md:px-6 py-2 animate-in fade-in duration-300">
                        <button onClick={(e) => togglePlayback(e)} className="w-10 h-10 rounded-full bg-[#ffca28] text-[#1a0f0a] flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0">
                            {isLoadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : (isPlaying && !isPaused ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />)}
                        </button>
                        <div className="flex-1 mx-4 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-[#ffcc80]/60 uppercase tracking-widest">Chanting Mode</span>
                                {showResync && (
                                    <button onClick={handleResync} className="flex items-center gap-1 text-[9px] text-red-400 font-bold bg-red-900/30 px-1.5 rounded animate-pulse hover:bg-red-900/50" title="Click to fix sync issues">
                                        <Activity className="w-3 h-3"/> Sync
                                    </button>
                                )}
                            </div>
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-[#ffca28] transition-all duration-300 ease-linear" style={{ width: `${(progress / (duration || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setIsIslandExpanded(true); }} className="p-2 text-[#ffcc80]/50 hover:text-[#ffcc80] flex-shrink-0"><Maximize2 className="w-5 h-5" /></button>
                    </div>
                )}

                {/* 3. Expanded Island State */}
                <div className={`w-full h-full flex flex-col p-4 md:p-8 transition-all duration-500 relative z-10 ${isIslandExpanded ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}>
                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-100 pointer-events-none mix-blend-screen" />
                    
                    {audioError ? (
                        <div className="flex flex-col items-center justify-center h-full text-center z-20 animate-in fade-in">
                            {renderErrorIcon()}
                            <p className="text-xs md:text-sm text-[#ffcc80]/90 mb-6 font-medium px-4">{audioError}</p>
                            {!audioError.includes("Daily") && <button onClick={(e) => togglePlayback(e)} className="px-6 py-3 bg-[#ffca28] text-[#1a0f0a] rounded-full text-xs md:text-sm font-bold hover:scale-105 transition-transform flex items-center gap-2"><RefreshCw className="w-4 h-4"/>Retry Playback</button>}
                            <button onClick={(e) => { e.stopPropagation(); setIsIslandExpanded(false); setAudioError(null); }} className="absolute top-4 right-4 text-[#ffcc80]/50 hover:text-[#ffcc80]"><Minimize2 className="w-5 h-5" /></button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center z-10 mb-4">
                                <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${isPaused || !isPlaying ? 'bg-orange-500' : 'bg-green-500 animate-pulse'} shadow-[0_0_5px_currentColor]`}></div><span className="text-[10px] text-[#ffcc80]/60 font-bold uppercase tracking-widest">{isPaused || !isPlaying ? 'Paused' : 'Active'}</span></div>
                                <button onClick={(e) => { e.stopPropagation(); setIsIslandExpanded(false); }} className="text-[#ffcc80]/50 hover:text-[#ffcc80]"><Minimize2 className="w-5 h-5" /></button>
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center z-10 min-h-[150px]">
                                <div className="relative mb-6 md:mb-8">
                                    {isLoadingAudio ? <div className="w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-[#ffca28] border-t-transparent animate-spin"></div> : (
                                        <button onClick={(e) => togglePlayback(e)} className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[#ffca28] to-[#ff6f00] text-[#1a0f0a] flex items-center justify-center shadow-2xl border-4 border-[#1a0f0a] hover:scale-105 transition-transform">
                                            {isPlaying && !isPaused ? <Pause className="w-6 h-6 md:w-10 md:h-10 fill-current" /> : <Play className="w-6 h-6 md:w-10 md:h-10 fill-current ml-1" />}
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-8 md:gap-12">
                                    <button onClick={(e) => { e.stopPropagation(); onPrev?.(); }} disabled={!hasPrev} className="text-[#ffcc80]/50 hover:text-[#ffcc80] disabled:opacity-20 hover:scale-110 transition-transform"><ChevronLeft className="w-6 h-6 md:w-8 md:h-8" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); onNext?.(); }} disabled={!hasNext} className="text-[#ffcc80]/50 hover:text-[#ffcc80] disabled:opacity-20 hover:scale-110 transition-transform"><ChevronRight className="w-6 h-6 md:w-8 md:h-8" /></button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 md:gap-4 z-10 bg-black/30 p-3 md:p-4 rounded-xl border border-[#ffb300]/10 mt-2">
                                <div className="flex justify-between text-[9px] md:text-[10px] text-[#ffcc80]/50 font-mono"><span>{fmtTime(progress)}</span><span>{fmtTime(duration)}</span></div>
                                <input type="range" min="0" max={duration > 0 ? duration : 100} value={progress} onChange={handleSeek} className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#ffcc80] cursor-pointer" />
                                
                                <div className="flex justify-between items-center gap-2">
                                    <div className="flex gap-2 items-center">
                                        <button onClick={(e) => { e.stopPropagation(); cycleSpeed(); }} className="text-[9px] md:text-[10px] font-bold text-[#ffcc80]/70 flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/10 hover:bg-white/10"><Gauge className="w-3 h-3" />{playbackRate}x</button>
                                        <button onClick={(e) => { e.stopPropagation(); setIsLooping(!isLooping); }} className={`p-1 rounded ${isLooping ? 'text-[#1a0f0a] bg-[#ffcc80]' : 'text-[#ffcc80]/30 hover:text-[#ffcc80]/70'}`}><Repeat className="w-4 h-4" /></button>
                                        
                                        {/* Smart Resync Button - Appears when stuck or manual */}
                                        <button 
                                            onClick={handleResync} 
                                            className={`text-[9px] md:text-[10px] font-bold flex items-center gap-1 px-2 py-1 rounded border transition-all ${
                                                showResync 
                                                ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse' 
                                                : 'text-[#ffcc80]/70 bg-white/5 border-white/10 hover:bg-white/10'
                                            }`} 
                                            title="Resync Audio"
                                        >
                                            <RefreshCw className={`w-3 h-3 ${showResync ? 'animate-spin' : ''}`} /> {showResync ? 'Fix Sync' : 'Sync'}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 w-20 md:w-24">{volume===0?<VolumeX className="w-3 h-3 text-[#ffcc80]/50"/>:<Volume2 className="w-3 h-3 text-[#ffcc80]/50"/>}<input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => {setVolume(parseFloat(e.target.value)); playerRef.current?.setVolume(parseFloat(e.target.value))}} className="w-full h-1 bg-white/20 rounded-full appearance-none accent-[#ffcc80]" /></div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Footer Controls */}
        <div className={`sticky bottom-0 bg-[#bcaaa4] border-t-2 border-[#8d6e63] px-4 md:px-6 py-2 flex justify-between items-center z-20 shrink-0 ${isZenMode ? 'translate-y-full opacity-0 pointer-events-none' : ''} transition-all duration-500`}>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-70 mix-blend-multiply"></div>
             
             {/* Left Group: Unique Loading Animation */}
             <div className="relative z-10 flex gap-2 items-center min-w-[100px] h-8">
                 {(isLoadingAudio || (isPlaying && !isPaused)) && <DivineAudioLoader />}
             </div>

             {/* Right Group: Save, Share, Copy */}
             <div className="flex gap-2 md:gap-4 relative z-10 justify-end">
                <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 text-[#3e2723] hover:bg-[#a1887f]/20 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-xs md:text-sm active:scale-95 hover:text-[#5d4037]"
                >
                    <Share2 className="w-4 h-4 md:w-5 md:h-5"/>
                    <span className="hidden md:inline">Share</span>
                </button>
                <button 
                    onClick={handleSaveClick}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 rounded-full font-bold text-xs md:text-sm shadow-md transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(255,204,128,0.4)] relative overflow-visible ${isSaved ? 'bg-[#3e2723] text-[#ffcc80] border-2 border-[#5d4037]' : 'bg-[#d7ccc8] text-[#3e2723] border border-[#a1887f]'}`}
                >
                    <Bookmark className={`w-4 h-4 md:w-5 md:h-5 ${isSaved?'fill-current':''} transition-transform duration-300 ${isAnimatingSave ? 'scale-125' : 'scale-100'}`}/>
                    <span>{isSaved?'Saved':'Save'}</span>
                    
                    {/* Floating Toast Notification */}
                    {isAnimatingSave && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                           {isSaved ? "Saved!" : "Removed"}
                        </span>
                    )}
                </button>
                <button 
                    onClick={() => navigator.clipboard.writeText(`${verse.sanskrit}\n\n${verse.translation}`)} 
                    className="flex items-center gap-2 text-[#3e2723] hover:bg-[#a1887f]/20 px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-xs md:text-sm active:scale-95 hover:text-[#5d4037]"
                >
                    <Copy className="w-4 h-4 md:w-5 md:h-5"/>
                    <span className="hidden md:inline">Copy</span>
                </button>
             </div>
        </div>

        {/* Zen & Pranayama Overlays */}
        {isZenMode && !isMeditating && <button onClick={() => setIsZenMode(false)} className="absolute top-4 right-4 z-[50] p-3 bg-black/20 text-white rounded-full animate-pulse"><Minimize2 className="w-6 h-6" /></button>}
        {isMeditating && (
            <div className="absolute inset-0 z-[60] bg-[#1a0f0a]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in">
                <button onClick={() => setIsMeditating(false)} className="absolute top-6 right-6 text-[#ffcc80]/50 hover:text-[#ffcc80]"><X className="w-8 h-8" /></button>
                <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-[#ffb300]/20 rounded-full animate-ping"></div>
                    <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-saffron-500 shadow-[0_0_50px_rgba(255,160,0,0.4)] flex flex-col items-center justify-center bg-gradient-to-br from-[#3e2723] to-[#1a0f0a] transition-all duration-[4000ms] ease-in-out transform ${breathPhase==='Inhale'?'scale-125 opacity-100':breathPhase==='Hold'?'scale-125 opacity-90':'scale-90 opacity-70'}`}>
                        <span className="text-2xl md:text-3xl font-epic font-bold text-saffron-100 uppercase mb-1">{breathPhase}</span>
                        <span className="text-[10px] md:text-xs text-saffron-400/80 font-serif italic">{breathPhase==='Inhale'?'Prana':breathPhase==='Hold'?'Kumbhaka':'Apana'}</span>
                    </div>
                </div>
                <div className="mt-8 md:mt-12 text-center space-y-2 animate-pulse px-4">
                    <p className="text-[#ffcc80] font-serif text-lg md:text-xl">{breathPhase==='Inhale'?'Draw the wisdom inward...':breathPhase==='Hold'?'Internalize the truth...':'Release all anxiety...'}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default VerseDetail;
