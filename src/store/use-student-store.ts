'use client';

import { create } from 'zustand';

export interface DashboardVM {
  kpis: {
    chapters: { 
      physics: { done: number; total: number };
      chemistry: { done: number; total: number };
      biology: { done: number; total: number };
    };
    totalQuestions: { value: number; delta: number };
    examsTaken: { value: number; delta: number };
    accuracy: { value: number; delta: number };
  };
  strategy: {
    tasks: { id: string; task: string; reason: string; impact: string; priority: 'urgent' | 'high' | 'medium' | 'low' }[];
    summary: string;
  };
  psychProfile: {
    anxiety: number;
    confidence: number;
    focus: number;
    burnout: number;
    interpretation: string;
    level: 'low' | 'moderate' | 'high';
  };
  revisionQueue: {
    id: string;
    topic: string;
    lastAttempted: string;
    accuracyTrend: number;
    priority: string;
  }[];
  weaknessSnapshot: {
    chapters: { name: string; accuracy: number; severity: 'critical' | 'moderate' | 'slight' }[];
    questionType: { name: string; accuracy: number };
  };
  errorPatterns: {
    guessing: number;
    conceptGap: number;
    inefficiency: number;
    insight: string;
  };
  timeManagement: {
    avgTimePerQuestion: number;
    heavyPercentage: number;
    rushedPercentage: number;
    status: 'optimal' | 'rushing' | 'slow';
    interpretation: string;
  };
  insight: string;
}

export interface RevisionItemVM {
  id: string;
  intelligenceId: string;
  topic: string;
  subject: string;
  retention: number;
  priority: 'high' | 'medium' | 'low';
  forgettingETA: string;
  behavioralInsight: string;
}

export interface RevisionVM {
  high: RevisionItemVM[];
  medium: RevisionItemVM[];
  low: RevisionItemVM[];
  overallStrategy: string;
}

export interface WeakAreaVM {
  clusters: {
    title: string;
    accuracyTrend: number;
    errorFrequency: number;
    linkedTopics: string[];
    interpretation: string;
    suggestedAction: string;
  }[];
  repeatedErrors: {
    patternName: string;
    occurrenceCount: number;
    insight: string;
  }[];
  overallDiagnostic: string;
}

export interface RecommendationVM {
  id: string;
  title: string;
  reasoning: string;
  type: 'practice' | 'review' | 'rest_and_recharge' | 'strategic_study' | 'topic_deep_dive' | 'conceptual_clarity' | 'test_simulation';
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

interface StudentState {
  examContext: string;
  dashboard: DashboardVM | null;
  revision: RevisionVM | null;
  weakAreas: WeakAreaVM | null;
  baseline: any | null;
  recommendations: RecommendationVM[];
  setExamContext: (exam: string) => void;
  setDashboard: (data: DashboardVM) => void;
  setRevision: (data: RevisionVM) => void;
  setWeakAreas: (data: WeakAreaVM) => void;
  setBaseline: (data: any) => void;
  setRecommendations: (recs: RecommendationVM[]) => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  examContext: 'neet',
  dashboard: null,
  revision: null,
  weakAreas: null,
  baseline: null,
  recommendations: [],
  setExamContext: (exam) => set({ examContext: exam }),
  setDashboard: (data) => set({ dashboard: data }),
  setRevision: (data) => set({ revision: data }),
  setWeakAreas: (data) => set({ weakAreas: data }),
  setBaseline: (data) => set({ baseline: data }),
  setRecommendations: (recs) => set({ recommendations: recs }),
}));
