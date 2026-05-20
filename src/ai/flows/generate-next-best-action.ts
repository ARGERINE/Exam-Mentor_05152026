
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating the "Next Best Action" for a student.
 * It analyzes student progress and mentor insights to provide a single, impactful, and mentor-like recommendation.
 *
 * - generateNextBestAction - A function that generates the next best action.
 * - GenerateNextBestActionInput - The input type for the generateNextBestAction function.
 * - NextBestActionOutput - The return type for the generateNextBestAction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schemas
const StudentProgressInputSchema = z.object({
  examName: z.string().describe('The name of the exam the student is preparing for (e.g., NEET, JEE, CUET, GATE, CAT).'),
  overallScore: z.number().min(0).max(100).describe('The student\'s current overall score or estimated percentile (0-100).'),
  recentAccuracy: z.number().min(0).max(1).describe('The student\'s average accuracy on recent practice questions (0.0-1.0).'),
  timeManagementEfficiency: z.number().min(0).max(1).describe('A score indicating the student\'s time management efficiency (0.0-1.0), where 1.0 is highly efficient.'),
  weakTopics: z.array(z.string()).describe('A list of specific topics or sub-topics where the student consistently performs poorly or struggles.'),
  strongTopics: z.array(z.string()).describe('A list of specific topics or sub-topics where the student consistently performs well.'),
  recentActivitySummary: z.string().describe('A concise summary of the student\'s most recent study activities, including types of questions attempted and areas focused on.'),
});
export type StudentProgressInput = z.infer<typeof StudentProgressInputSchema>;

const MentorInsightsInputSchema = z.object({
  overallAssessment: z.string().describe('A high-level, human-readable mentor\'s assessment of the student\'s current study phase, mindset, and general learning trajectory.'),
  keyStrengths: z.array(z.string()).describe('Specific positive learning patterns or areas identified by the mentor as student strengths.'),
  keyWeaknesses: z.array(z.string()).describe('Specific negative learning patterns or areas identified by the mentor as student weaknesses, often including causal analysis.'),
  potentialAlerts: z.array(z.string()).describe('Any proactive alerts identified, such as "risk of burnout due to high intensity", "focus wavering in longer sessions", or "overconfidence in known topics".'),
  progressNarrativeSnippet: z.string().describe('A brief, evolving story or narrative describing the student\'s recent progress and the underlying reasons for observed trends (the "Why").'),
});
export type MentorInsightsInput = z.infer<typeof MentorInsightsInputSchema>;

const GenerateNextBestActionInputSchema = z.object({
  studentProgress: StudentProgressInputSchema,
  mentorInsights: MentorInsightsInputSchema,
});
export type GenerateNextBestActionInput = z.infer<typeof GenerateNextBestActionInputSchema>;

// Output Schema
const NextBestActionOutputSchema = z.object({
  nextBestAction: z.string().describe('A single, clear, encouraging, and mentor-like phrase (e.g., "It looks like a focused review of Calculus integration techniques is your best next step to solidify those foundations.") suggesting the most impactful study task or resource.'),
  recommendedActionType: z.enum(['practice', 'review', 'rest_and_recharge', 'strategic_study', 'topic_deep_dive', 'conceptual_clarity', 'test_simulation']).describe('The categorized type of action recommended (e.g., practice, review, rest_and_recharge).'),
  reasoning: z.string().describe('A brief, human-readable explanation of why this specific action is recommended, connecting it directly to the student\'s progress and mentor insights.'),
});
export type NextBestActionOutput = z.infer<typeof NextBestActionOutputSchema>;

// Wrapper function
export async function generateNextBestAction(input: GenerateNextBestActionInput): Promise<NextBestActionOutput> {
  return generateNextBestActionFlow(input);
}

// Prompt definition
const generateNextBestActionPrompt = ai.definePrompt({
  name: 'generateNextBestActionPrompt',
  input: { schema: GenerateNextBestActionInputSchema },
  output: { schema: NextBestActionOutputSchema },
  prompt: `You are an experienced and empathetic exam preparation mentor. Your goal is to provide a single, impactful "next best action" for the student.

The tone should be "noticed" and "guiding", never rigid or demanding. Use phrases like:
- "You may benefit from revisiting..."
- "It might be a good time to..."
- "Focusing on [topic] right now could improve your stability."

Avoid robotic phrasing or raw numbers. Frame your advice like a wise mentor answering: "What should I do next?".

Here is the student's current progress:
Exam: {{{studentProgress.examName}}}
Overall Score: {{{studentProgress.overallScore}}}%
Recent Accuracy: {{{studentProgress.recentAccuracy}}}%
Time Management Efficiency: {{{studentProgress.timeManagementEfficiency}}}
Weak Topics:
{{#each studentProgress.weakTopics}} - {{{this}}}
{{/each}}
Strong Topics:
{{#each studentProgress.strongTopics}} - {{{this}}}
{{/each}}
Recent Activity Summary: {{{studentProgress.recentActivitySummary}}}

Mentor Insights:
{{{mentorInsights.overallAssessment}}}
{{{mentorInsights.progressNarrativeSnippet}}}

Identify the single most impactful action. Provide a clear 'nextBestAction' phrase, a 'recommendedActionType', and a 'reasoning'.`
});

// Flow definition
const generateNextBestActionFlow = ai.defineFlow(
  {
    name: 'generateNextBestActionFlow',
    inputSchema: GenerateNextBestActionInputSchema,
    outputSchema: NextBestActionOutputSchema,
  },
  async (input) => {
    const { output } = await generateNextBestActionPrompt(input);
    if (!output) {
      throw new Error('Failed to generate next best action.');
    }
    return output;
  }
);
