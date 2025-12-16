
import { ReactNode, ElementType } from 'react';

export interface GitaVerse {
  id: number;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  coreTeaching: string;
  practicalApplication: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  sanskritName?: string;
  description: string;
  icon: ElementType;
  condition: (readCount: number, savedVerses: GitaVerse[]) => boolean;
  color: string;
}

export enum AppView {
  HOME = 'HOME',
  LIBRARY = 'LIBRARY',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
}

export type Theme = 'dark' | 'parchment';

export type VerseCategory = 'Duty' | 'Devotion' | 'Knowledge' | 'Meditation' | 'Self-Control' | 'All';
