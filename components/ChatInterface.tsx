
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Volume2, StopCircle, User, Mic, MicOff, Smile, ArrowUp, AlertCircle } from 'lucide-react';
import { streamChatResponse, generateSpeech } from '../services/geminiService';
import { playPcmData, AudioController } from '../utils/audio';
import { ChatMessage } from '../types';

// Simple Markdown Parser Component
const MarkdownText: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const parseBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-saffron-600 dark:text-saffron-400 font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listItems.push(
        <li key={`li-${index}`} className="ml-4 mb-1">
          {parseBold(trimmed.substring(2))}
        </li>
      );
    } else {
      if (listItems.length > 0) {
        renderedElements.push(<ul key={`ul-${index}`} className="list-disc mb-3 space-y-1">{listItems}</ul>);
        listItems = [];
      }
      if (trimmed) {
        renderedElements.push(
           <p key={`p-${index}`} className="mb-3 leading-relaxed last:mb-0">
             {parseBold(line)}
           </p>
        );
      }
    }
  });

  if (listItems.length > 0) {
    renderedElements.push(<ul key="ul-end" className="list-disc mb-3 space-y-1">{listItems}</ul>);
  }

  return <div className="font-sans text-[0.95rem] md:text-base">{renderedElements}</div>;
};

// Bow Icon for Send Button
const BowIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2C6.5 2 2 6.5 2 12c0 5.5 4.5 10 10 10" />
        <path d="M22 2l-10 10" />
        <path d="M22 2l-3 0" />
        <path d="M22 2l0 3" />
        <path d="M2 12l20 0" strokeDasharray="2 2" opacity="0.5" />
    </svg>
);

interface ChatInterfaceProps {
    setGlobalLoading?: (loading: boolean) => void;
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ setGlobalLoading, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioCache = useRef<Map<string, string>>(new Map());
  const currentAudioController = useRef<AudioController | null>(null);
  const recognitionRef = useRef<any>(null);

  const spiritualEmojis = ["🕉️", "🙏", "🪷", "✨", "🕯️", "🧘", "🕊️", "📿", "☀️", "🌙", "🔥", "🐚", "🐘"];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          
          recognitionRef.current.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setInput(prev => prev + (prev ? ' ' : '') + transcript);
              setIsListening(false);
          };

          recognitionRef.current.onerror = (event: any) => {
              console.error("Speech recognition error", event.error);
              setIsListening(false);
          };
          
          recognitionRef.current.onend = () => {
              setIsListening(false);
          };
      }
      
      return () => {
          if (currentAudioController.current) {
              currentAudioController.current.stop();
          }
      }
  }, []);

  const toggleListening = () => {
      if (!recognitionRef.current) {
          alert("Voice input is not supported in this browser.");
          return;
      }
      
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          try {
              recognitionRef.current.start();
              setIsListening(true);
          } catch(e) {
              console.error(e);
          }
      }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    // Trigger arrow animation
    setIsSending(true);
    setTimeout(() => setIsSending(false), 600);

    if (currentAudioController.current) {
        currentAudioController.current.stop();
        setPlayingAudioId(null);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    if(setGlobalLoading) setGlobalLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const stream = await streamChatResponse(history, userMsg.content);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        isLoading: true
      }]);

      let fullResponse = '';
      
      for await (const chunk of stream) {
        const text = chunk.text;
        
        if (text) {
          fullResponse += text;
          setMessages(prev => prev.map(m => 
            m.id === botMsgId 
              ? { ...m, content: fullResponse, isLoading: false }
              : m
          ));
        }
      }

    } catch (error: any) {
      if (error.message === "QUOTA_EXCEEDED") {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            content: "I apologize, but my divine connection is momentarily overwhelming. Please try again later (Daily Quota Exceeded).",
            timestamp: Date.now()
          }]);
      } else {
          console.error("Chat error", error);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            content: "I apologize, but I am unable to connect at this moment. Please check your connection.",
            timestamp: Date.now()
          }]);
      }
    } finally {
      setIsTyping(false);
      if(setGlobalLoading) setGlobalLoading(false);
    }
  };

  const handlePlayTTS = async (text: string, id: string) => {
    // 1. Stop if playing this same message
    if (playingAudioId === id && currentAudioController.current) {
        currentAudioController.current.stop();
        setPlayingAudioId(null);
        currentAudioController.current = null;
        return;
    }

    // 2. Stop any other message playing
    if (currentAudioController.current) {
        currentAudioController.current.stop();
    }

    setPlayingAudioId(id);

    try {
        let base64 = audioCache.current.get(id);
        
        if (!base64) {
            // Simple cleanup to help TTS engine
            const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            // We limit chars to prevent massive generation wait times, but 400 is reasonable
            base64 = await generateSpeech(cleanText.slice(0, 400));
            
            if (base64) {
                audioCache.current.set(id, base64);
            }
        }

        if (base64) {
            const controller = playPcmData(base64);
            currentAudioController.current = controller;
            await controller.completed;
            
            if (currentAudioController.current === controller) {
                 setPlayingAudioId(null);
                 currentAudioController.current = null;
            }
        } else {
             console.warn("TTS generated empty audio");
             setPlayingAudioId(null);
             alert("Could not generate audio for this message. Please try again.");
        }

    } catch (e: any) {
        setPlayingAudioId(null);
        if (e.message === "QUOTA_EXCEEDED") {
             alert("Daily voice limit reached. Please try again later.");
        } else {
             console.error("Audio Playback Error", e);
             alert("Audio playback failed. Please check your connection.");
        }
    }
  };

  const handleEmojiClick = (emoji: string) => {
      setInput(prev => prev + emoji);
      setShowEmojis(false);
      // Refocus input for better UX
      if (inputRef.current) {
          inputRef.current.focus();
      }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto bg-white/50 dark:bg-deep-900/50 backdrop-blur-sm shadow-2xl rounded-none md:rounded-2xl overflow-hidden my-0 md:my-6 border border-ink-500/10 dark:border-deep-800 animate-in slide-in-from-bottom-4 duration-500 relative transition-colors">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(255,160,0,0.05),_transparent)] opacity-50 animate-spin-slow"></div>
      </div>

      <div className="bg-paper-100/90 dark:bg-deep-900/80 backdrop-blur-md p-4 md:p-6 border-b border-ink-500/10 dark:border-deep-700 flex items-center justify-between relative overflow-hidden z-10 transition-colors">
        <div className="flex items-center space-x-4 relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-saffron-500 to-saffron-700 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,160,0,0.5)] text-white border border-saffron-400/50">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            </div>
            <div>
                <h2 className="font-epic font-bold text-lg md:text-xl text-ink-900 dark:text-saffron-100">Ask Krishna</h2>
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    <p className="text-xs md:text-sm text-ink-500 dark:text-gray-400">Online • Divine Connection</p>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-ink-300 dark:scrollbar-thumb-deep-700 scrollbar-track-transparent relative z-10">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-500`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-paper-200 dark:bg-deep-800 border border-saffron-500/30 flex items-center justify-center mr-3 mt-1 shadow-glow flex-shrink-0 transition-colors">
                    <span className="font-serif text-saffron-600 dark:text-saffron-500 text-xs">ॐ</span>
                </div>
            )}

            <div
              className={`max-w-[85%] md:max-w-[75%] p-5 relative group transition-all duration-300 backdrop-blur-sm filter drop-shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-saffron-600 to-saffron-700 text-white'
                  : 'bg-white/90 dark:bg-deep-800/90 text-ink-800 dark:text-gray-200 border border-ink-500/10 dark:border-deep-700'
              }`}
              style={{
                  clipPath: msg.role === 'user' 
                    ? 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)' 
                    : 'polygon(5% 0%, 100% 0%, 95% 50%, 100% 100%, 5% 100%, 0% 50%)',
                  paddingLeft: msg.role === 'user' ? '2rem' : '2.5rem',
                  paddingRight: msg.role === 'user' ? '2.5rem' : '2rem',
              }}
            >
              {/* Audio Playback Control */}
              {msg.role === 'model' && !msg.isLoading && (
                 <button 
                    onClick={() => handlePlayTTS(msg.content, msg.id)}
                    className={`absolute top-2 right-8 p-1.5 bg-white/20 hover:bg-white/40 rounded-full transition-all z-10 ${playingAudioId === msg.id ? 'text-saffron-600 dark:text-saffron-400' : 'text-gray-400'}`}
                    title="Read Aloud"
                 >
                     {playingAudioId === msg.id ? <StopCircle className="w-3.5 h-3.5 fill-current"/> : <Volume2 className="w-3.5 h-3.5" />}
                 </button>
              )}
              
              {msg.role === 'model' && msg.isLoading && !msg.content ? (
                 <div className="flex space-x-3 items-center text-ink-400 dark:text-gray-400 py-1">
                    <Loader2 className="w-4 h-4 animate-spin text-saffron-500" />
                    <span className="text-sm font-medium italic animate-pulse">Contemplating...</span>
                 </div>
              ) : (
                <MarkdownText text={msg.content} />
              )}
            </div>

            {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-deep-700 border border-deep-600 flex items-center justify-center ml-3 mt-1 shadow-inner flex-shrink-0">
                    <User className="w-4 h-4 text-gray-300" />
                </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-paper-200/90 dark:bg-deep-900/90 border-t border-ink-500/10 dark:border-deep-800 relative z-20 transition-colors">
        {/* Input Bar - REMOVED overflow-hidden to allow Emoji Picker to pop up */}
        <div className="flex items-center space-x-2 bg-white/50 dark:bg-deep-950/50 rounded-full px-2 py-2 border border-ink-500/10 dark:border-deep-700 focus-within:border-saffron-500/50 focus-within:ring-2 focus-within:ring-saffron-500/20 transition-all shadow-inner backdrop-blur-sm relative">
          
          <div className="relative">
              <button 
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className="p-2 text-ink-400 hover:text-saffron-500 dark:text-gray-500 transition-colors"
              >
                  <Smile className="w-5 h-5" />
              </button>
              {showEmojis && (
                  <div className="absolute bottom-12 left-0 bg-white dark:bg-deep-800 p-2 rounded-xl shadow-xl border border-ink-500/10 dark:border-deep-600 grid grid-cols-5 gap-1 animate-in fade-in zoom-in duration-200 w-48 z-50">
                      {spiritualEmojis.map(emoji => (
                          <button 
                              key={emoji} 
                              type="button"
                              onClick={() => handleEmojiClick(emoji)} 
                              className="p-2 hover:bg-ink-100 dark:hover:bg-deep-700 rounded text-xl transition-colors"
                          >
                              {emoji}
                          </button>
                      ))}
                  </div>
              )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : "Type your question here..."}
            className="flex-1 bg-transparent border-none outline-none text-ink-900 dark:text-gray-200 placeholder-ink-400 dark:placeholder-gray-500 px-2 py-2 font-medium"
            disabled={isTyping || isListening}
            autoFocus
          />

          <button
             type="button"
             onClick={toggleListening}
             className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-ink-400 dark:text-gray-500 hover:text-saffron-500'}`}
          >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`p-3 rounded-full transition-all duration-200 relative overflow-hidden active:scale-95 ${
              !input.trim() || isTyping
                ? 'bg-paper-300 dark:bg-deep-800 text-ink-400 dark:text-gray-600'
                : 'bg-gradient-to-r from-saffron-600 to-saffron-500 text-white hover:shadow-[0_0_20px_rgba(255,160,0,0.4)]'
            }`}
          >
            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <div className="relative w-5 h-5 flex items-center justify-center">
                     {/* Static Bow Icon */}
                     <div className={`transition-all duration-300 ${isSending ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                        <BowIcon className="w-5 h-5" />
                     </div>
                     
                     {/* Flying Arrow Animation */}
                     {isSending && (
                         <div className="absolute inset-0 animate-fly-arrow text-white flex items-center justify-center">
                             <ArrowUp className="w-5 h-5" />
                         </div>
                     )}
                </div>
            )}
          </button>
        </div>
        
        {/* Custom Animation for Arrow */}
        <style>{`
            @keyframes fly-arrow {
                0% { 
                    transform: translate(-10px, 15px) rotate(-135deg) scale(0.8); 
                    opacity: 0; 
                }
                20% { 
                    transform: translate(0, 0) rotate(45deg) scale(1.2); 
                    opacity: 1; 
                }
                60% {
                    transform: translate(40px, -60px) rotate(45deg) scale(0.8);
                    opacity: 1;
                }
                100% { 
                    transform: translate(80px, -120px) rotate(45deg) scale(0.4); 
                    opacity: 0; 
                }
            }
            .animate-fly-arrow {
                animation: fly-arrow 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
        `}</style>
        
        <p className="text-center text-[10px] text-ink-400 dark:text-gray-600 mt-3 font-medium tracking-wide uppercase">AI Wisdom • May produce spiritual hallucinations</p>
      </div>
    </div>
  );
};

export default ChatInterface;
