'use client';

import { create } from 'zustand';
import { WeeklyPlanOutput } from '@/ai/flows/generate-weekly-plan-flow';

interface StudyPlanState {
  plan: WeeklyPlanOutput | null;
  setPlan: (plan: WeeklyPlanOutput) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useStudyPlanStore = create<StudyPlanState>((set) => ({
  plan: null,
  setPlan: (plan) => set({ plan }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
