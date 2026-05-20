
'use server';
/**
 * @fileOverview This file implements a Genkit flow that provides proactive, intelligent study nudges
 * based on a student's study patterns. It acts as a mentor, identifying potential burnout,
 * declining focus, or retention decay and offering supportive advice.
 *
 * - proactiveStudyNudges - A wrapper function to call the Genkit flow.
 * - ProactiveStudyNudgesInput - The input type for the flow.
 * - ProactiveStudyNudgesOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProactiveStudyNudgesInputSchema = z.object({
  dailyStudyHours: z.array(z.number().min(0)).describe('An array of daily study hours for the past week, e.g., [2, 3, 1, 4, 0, 2.5, 3]'),
  averageSessionFocusDurationMinutes: z.number().min(0).describe('Average duration a student maintains focus in minutes during study sessions.'),
  recentPracticeScores: z.array(
    z.object({
      topic: z.string().describe('The subject or topic name.'),
      score: z.number().min(0).max(100).describe('Score obtained for the topic (0-100).'),
      date: z.string().datetime().describe('ISO 8601 formatted date of the practice session.'),
    })
  ).describe('Recent scores on practice tests or modules, including topic and date.'),
  commonErrorTypes: z.array(z.string()).describe('A list of observed common error patterns, e.g., ["rushing through assertion questions", "conceptual gaps in organic chemistry"].'),
  lastBreakDurationDays: z.number().min(0).optional().describe('Number of days since the last significant study break (e.g., 2+ days without intense study).'),
  currentConfidenceLevel: z.enum(['low', 'medium', 'high', 'very high']).describe('The student\'s self-assessed current confidence level.'),
});

export type ProactiveStudyNudgesInput = z.infer<typeof ProactiveStudyNudgesInputSchema>;

const ProactiveStudyNudgesOutputSchema = z.object({
  nudgeMessage: z.string().describe('A gentle, human-readable, and actionable study nudge message.'),
  nudgeCategory: z.enum(['burnout_risk', 'focus_improvement', 'retention_decay', 'general_guidance']).describe('The primary category of the generated nudge.'),
});

export type ProactiveStudyNudgesOutput = z.infer<typeof ProactiveStudyNudgesOutputSchema>;

export async function proactiveStudyNudges(input: ProactiveStudyNudgesInput): Promise<ProactiveStudyNudgesOutput> {
  return proactiveStudyNudgesFlow(input);
}

const proactiveStudyNudgesPrompt = ai.definePrompt({
  name: 'proactiveStudyNudgesPrompt',
  input: { schema: ProactiveStudyNudgesInputSchema },
  output: { schema: ProactiveStudyNudgesOutputSchema },
  prompt: `You are ExamMentor AI, a compassionate and experienced mentor for students preparing for high-stakes exams. Your goal is to provide supportive, human-readable insights, not raw statistics.

Analyze the following student data and generate a gentle, actionable nudge. Avoid robotic phrasing or just stating numbers. Focus on conveying understanding and clear next steps, addressing potential burnout, focus issues, or retention decay.

Student Study Data:
- Daily Study Hours (last 7 days): {{#each dailyStudyHours}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
- Average Focus Duration per Session: {{averageSessionFocusDurationMinutes}} minutes
- Recent Practice Scores:
{{#each recentPracticeScores}}  * Topic: {{topic}}, Score: {{score}}, Date: {{date}}
{{/each}}
- Common Error Types:
{{#each commonErrorTypes}}  * {{this}}
{{/each}}
- Days since last significant break: {{lastBreakDurationDays}}
- Current Confidence Level: {{currentConfidenceLevel}}

Based on this data, provide a mentor-like nudge. Your message should be encouraging and focus on a specific area for improvement or a positive reinforcement. Categorize the nudge to indicate its primary focus.

If you detect signs of potential burnout (e.g., consistently high study hours without breaks, declining focus despite effort), suggest resting or varying activities. If focus seems to be an issue (e.g., low average focus duration, specific error types), suggest techniques to improve concentration. If retention decay is evident (e.g., declining scores on previously strong topics), advise reviewing or spaced repetition. Otherwise, offer general positive reinforcement or minor adjustments.`,
});

const proactiveStudyNudgesFlow = ai.defineFlow(
  {
    name: 'proactiveStudyNudgesFlow',
    inputSchema: ProactiveStudyNudgesInputSchema,
    outputSchema: ProactiveStudyNudgesOutputSchema,
  },
  async (input) => {
    const { output } = await proactiveStudyNudgesPrompt(input);
    if (!output) {
      throw new Error('Failed to generate study nudge.');
    }
    return output;
  }
);
