
import React from 'react';
import { BookOpen, MessageCircle, Home, Menu, X, User } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isLoading?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isLoading = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { label: 'Home', view: AppView.HOME, icon: Home },
    { label: 'Library', view: AppView.LIBRARY, icon: BookOpen },
    { label: 'Ask Krishna', view: AppView.CHAT, icon: MessageCircle },
    { label: 'Profile', view: AppView.PROFILE, icon: User },
  ];

  return (
    <nav className="bg-paper-200/90 dark:bg-deep-950/80 backdrop-blur-xl sticky top-0 z-50 border-b border-ink-500/10 dark:border-deep-800 shadow-[0_4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => setView(AppView.HOME)}>
            <div className={`w-10 h-10 bg-gradient-to-br from-saffron-500 to-saffron-700 rounded-full flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(255,160,0,0.6)] border border-saffron-400/50 transition-transform duration-300 ${isLoading ? 'animate-spin-slow' : 'group-hover:scale-110'}`}>
              <span className="text-white font-bold font-serif text-lg">ॐ</span>
            </div>
            <span className={`font-epic font-bold text-2xl tracking-tight transition-all duration-1000 ${
                isLoading 
                ? 'text-saffron-500 drop-shadow-[0_0_10px_rgba(255,179,0,0.8)] animate-pulse' 
                : 'text-ink-900 dark:text-gray-100 group-hover:text-saffron-600 dark:group-hover:text-saffron-400'
            }`}>
                Gita Wisdom
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setView(item.view)}
                className={`relative flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 text-sm font-medium border border-transparent group ${
                  currentView === item.view
                    ? 'text-saffron-600 dark:text-saffron-400 bg-white dark:bg-deep-800/80 border-ink-500/10 dark:border-deep-700 shadow-[0_0_15px_rgba(255,160,0,0.1)]'
                    : 'text-ink-500 dark:text-gray-400 hover:text-ink-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-deep-800/50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${currentView === item.view ? 'animate-pulse' : ''}`} />
                <span>{item.label}</span>
                {/* Magical Underline for active state */}
                {currentView === item.view && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-saffron-500 rounded-full shadow-[0_0_8px_rgba(255,160,0,1)]"></span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ink-500 dark:text-gray-300 hover:text-saffron-600 dark:hover:text-saffron-500 p-2 transition-colors"
            >
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-paper-100 dark:bg-deep-950 border-t border-ink-500/10 dark:border-deep-800 animate-in slide-in-from-top-2 shadow-2xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setView(item.view);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-base font-medium transition-colors ${
                  currentView === item.view
                    ? 'text-saffron-600 dark:text-saffron-400 bg-white dark:bg-deep-800 border border-ink-500/10 dark:border-deep-700'
                    : 'text-ink-500 dark:text-gray-400 hover:text-ink-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-deep-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
