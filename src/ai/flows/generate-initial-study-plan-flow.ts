
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating an initial, strategic study plan 
 * based on a student's baseline profile. It uses reasoning-based personalization to 
 * explain the "What, Why, and Outcome" of every decision.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InitialStudyPlanInputSchema = z.object({
  examType: z.string(),
  hoursPerWeek: z.number(),
  strongSubjects: z.array(z.string()),
  weakSubjects: z.array(z.string()),
  consistencyLevel: z.string(),
  learningStyle: z.string(),
  stressLevel: z.string(),
  academicLevel: z.string().optional(),
  preferredLearningMethod: z.string().optional(),
  practiceMethodPreference: z.string().optional(),
  lifestyleWillingness: z.string().optional(),
  challenges: z.array(z.string()).optional(),
});
export type InitialStudyPlanInput = z.infer<typeof InitialStudyPlanInputSchema>;

const InitialStudyPlanOutputSchema = z.object({
  strategy: z.string().describe('Reasoning-based overarching strategy.'),
  dailyStructure: z.string().describe('Reasoning-based daily time breakdown.'),
  subjectSplit: z.string().describe('Reasoning-based subject distribution logic.'),
  practicePlan: z.string().describe('Reasoning-based practice and drill strategy.'),
  revisionPlan: z.string().describe('Reasoning-based memory recovery strategy.'),
  behaviorInsights: z.string().describe('Reasoning-based mindset and focus guidance.'),
});
export type InitialStudyPlanOutput = z.infer<typeof InitialStudyPlanOutputSchema>;

export async function generateInitialStudyPlan(input: InitialStudyPlanInput): Promise<InitialStudyPlanOutput> {
  return initialStudyPlanFlow(input);
}

const initialStudyPlanPrompt = ai.definePrompt({
  name: 'initialStudyPlanPrompt',
  input: { schema: InitialStudyPlanInputSchema },
  output: { schema: InitialStudyPlanOutputSchema },
  prompt: `You are an expert academic mentor for students preparing for the {{{examType}}} exam. 
A student has shared their diagnostic profile. Your goal is to generate a reasoning-based personalized narrative.

STRICT INSTRUCTIONS for each of the 6 fields:
1. WHAT: State the strategic decision.
2. WHY: Explain the reasoning based specifically on the student's inputs.
3. OUTCOME: Describe how this specific approach will drive score improvement or stability.

MAPPING RULES TO INCORPORATE:
- Learning Style: Visual -> Prioritize diagrams/visual summaries. Reading first -> Front-load theory.
- Constraints: Numerical Ability -> Prioritize accuracy over speed initially. Time management -> Strict session boundaries. Staying focused -> Shorter, high-intensity sessions.
- Anxiety: High -> Avoid early testing, build confidence through progressive difficulty.
- Lifestyle: High Willingness -> Increase study intensity/optimization layers.
- Academic Context: Dropout -> Balance syllabus rebuilding with exam-practice. Class XII -> Align with school flow.
- Subject Strategy: Allocate 60-70% effort to Weak subjects ({{{weakSubjects}}}) while keeping Strong subjects ({{{strongSubjects}}}) in maintenance.

Student Profile:
- Weekly Commitment: {{hoursPerWeek}} hours
- Academic Level: {{academicLevel}}
- Learning Method: {{preferredLearningMethod}}
- Challenges: {{#each challenges}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Anxiety Level: {{stressLevel}}
- Lifestyle Willingness: {{lifestyleWillingness}}

Generate a cohesive, mentor-like narrative. Avoid robotic lists. Make the student feel understood.`
});

const initialStudyPlanFlow = ai.defineFlow(
  {
    name: 'initialStudyPlanFlow',
    inputSchema: InitialStudyPlanInputSchema,
    outputSchema: InitialStudyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await initialStudyPlanPrompt(input);
    if (!output) throw new Error('Failed to generate initial study plan.');
    return output;
  }
);
