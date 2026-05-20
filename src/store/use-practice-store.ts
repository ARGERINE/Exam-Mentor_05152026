'use client';

import { create } from 'zustand';

export type AttemptType = 'Mock' | 'Sectional' | 'Practice' | 'Revision';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Adaptive';
export type ConfidenceLevel = 'confident' | 'somewhat' | 'guess';

interface PracticeSessionState {
  sessionId: string | null;
  selectedSubject: string | null;
  selectedTopic: string | null;
  attemptType: AttemptType;
  difficulty: DifficultyLevel;
  currentQuestionIndex: number;
  isSessionActive: boolean;
  sessionStats: {
    correct: number;
    total: number;
    startTime: number;
    avgTime: number;
  };
  
  setSubject: (subject: string | null) => void;
  setTopic: (topic: string | null) => void;
  setAttemptType: (type: AttemptType) => void;
  setDifficulty: (level: DifficultyLevel) => void;
  startSession: (id: string) => void;
  endSession: () => void;
  nextQuestion: (isCorrect: boolean, timeTaken: number) => void;
}

export const usePracticeStore = create<PracticeSessionState>((set) => ({
  sessionId: null,
  selectedSubject: null,
  selectedTopic: null,
  attemptType: 'Practice',
  difficulty: 'Adaptive',
  currentQuestionIndex: 0,
  isSessionActive: false,
  sessionStats: {
    correct: 0,
    total: 0,
    startTime: 0,
    avgTime: 0,
  },

  setSubject: (subject) => set({ selectedSubject: subject }),
  setTopic: (topic) => set({ selectedTopic: topic }),
  setAttemptType: (type) => set({ attemptType: type }),
  setDifficulty: (level) => set({ difficulty: level }),
  
  startSession: (id) => set({ 
    sessionId: id, 
    isSessionActive: true, 
    currentQuestionIndex: 0,
    sessionStats: { correct: 0, total: 0, startTime: Date.now(), avgTime: 0 }
  }),
  
  endSession: () => set({ 
    isSessionActive: false, 
    sessionId: null, 
    selectedSubject: null, 
    selectedTopic: null 
  }),
  
  nextQuestion: (isCorrect, timeTaken) => set((state) => ({ 
    currentQuestionIndex: state.currentQuestionIndex + 1,
    sessionStats: {
      ...state.sessionStats,
      correct: state.sessionStats.correct + (isCorrect ? 1 : 0),
      total: state.sessionStats.total + 1,
      avgTime: (state.sessionStats.avgTime * state.sessionStats.total + timeTaken) / (state.sessionStats.total + 1)
    }
  })),
}));
