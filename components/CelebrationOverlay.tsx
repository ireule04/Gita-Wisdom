
import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { X, Share2, Sparkles } from 'lucide-react';

interface CelebrationOverlayProps {
    achievement: Achievement;
    onClose: () => void;
}

const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ achievement, onClose }) => {
    const [petals, setPetals] = useState<any[]>([]);

    useEffect(() => {
        // Create 50 petals
        const newPetals = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 3 + Math.random() * 4,
            rotation: Math.random() * 360,
            color: ['#ffc107', '#ff9800', '#f44336', '#e91e63'][Math.floor(Math.random() * 4)],
            type: Math.random() > 0.5 ? '🌸' : '🏵️'
        }));
        setPetals(newPetals);

        const timer = setTimeout(onClose, 6000); // Auto close after animation
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            {/* Confetti Container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {petals.map((petal) => (
                    <div
                        key={petal.id}
                        className="absolute top-[-10%] text-2xl opacity-80"
                        style={{
                            left: `${petal.left}%`,
                            animation: `fall ${petal.duration}s linear ${petal.delay}s forwards`,
                            color: petal.color,
                            transform: `rotate(${petal.rotation}deg)`
                        }}
                    >
                        {petal.type}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fall {
                    0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
                }
                @keyframes scaleUp {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>

            <div className="relative bg-paper-100 dark:bg-deep-900 border-2 border-saffron-500 p-8 rounded-3xl shadow-[0_0_50px_rgba(255,160,0,0.5)] max-w-sm w-full text-center animate-[scaleUp_0.6s_ease-out_forwards]">
                <button onClick={onClose} className="absolute top-4 right-4 text-ink-400 hover:text-ink-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6 relative">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-saffron-500 to-saffron-700 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                        <achievement.icon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-saffron-500/30 blur-xl rounded-full -z-10 animate-pulse"></div>
                </div>

                <div className="mb-2">
                    <span className="text-saffron-600 dark:text-saffron-400 font-bold tracking-widest uppercase text-xs">Achievement Unlocked</span>
                </div>
                
                <h2 className="text-2xl font-epic font-bold text-ink-900 dark:text-white mb-2">{achievement.name}</h2>
                {achievement.sanskritName && <p className="text-sm font-serif italic text-ink-500 dark:text-gray-400 mb-4">"{achievement.sanskritName}"</p>}
                
                <p className="text-ink-600 dark:text-gray-300 mb-8">{achievement.description}</p>
                
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-saffron-500/40 flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" />
                    <span>Claim Divine Grace</span>
                </button>
            </div>
        </div>
    );
};

export default CelebrationOverlay;
