
'use server';
/**
 * @fileOverview Provides personalized, human-readable insights into a student's performance.
 *
 * - mentorPerformanceInsight - A function that generates mentor-like performance insights.
 * - MentorPerformanceInsightInput - The input type for the mentorPerformanceInsight function.
 * - MentorPerformanceInsightOutput - The return type for the mentorPerformanceInsight function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MentorPerformanceDataSchema = z.object({
  subject: z.string().describe('The subject area (e.g., Physics, Organic Chemistry).'),
  topic: z
    .string()
    .optional()
    .describe('An optional specific topic within the subject (e.g., Electromagnetism).'),
  accuracy: z
    .number()
    .min(0)
    .max(100)
    .describe('Accuracy percentage for the subject/topic (0-100).'),
  speedScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A relative speed score for the subject/topic (0-100), higher is better.'),
  struggleKeywords: z
    .array(z.string())
    .describe('Keywords or phrases describing common mistakes or difficult question types (e.g., assertion-reason questions, conceptual errors).'),
  strengthKeywords: z
    .array(z.string())
    .describe('Keywords or phrases describing areas of proficiency (e.g., problem-solving, theoretical concepts).'),
});

const MentorPerformanceInsightInputSchema = z.object({
  studentPerformance: z
    .array(MentorPerformanceDataSchema)
    .describe('An array of performance data objects for various subjects/topics.'),
  studentGoal: z
    .string()
    .optional()
    .describe('The student\'s primary goal or target exam (e.g., "NEET", "JEE Main").'),
});

export type MentorPerformanceInsightInput = z.infer<typeof MentorPerformanceInsightInputSchema>;

const SubjectInsightSchema = z.object({
  subject: z.string().describe('The subject or topic name.'),
  strengths: z.array(z.string()).describe('Specific strengths identified in this subject/topic.'),
  weaknesses: z
    .array(z.string())
    .describe('Specific weaknesses or areas needing attention in this subject/topic.'),
  recommendations: z
    .array(z.string())
    .describe('Actionable next steps or study suggestions for this subject/topic.'),
});

const MentorPerformanceInsightOutputSchema = z.object({
  overallAssessment: z
    .string()
    .describe('A high-level, encouraging assessment of the student\'s overall progress and current state, like "You are making excellent progress across the board."'),
  subjectInsights: z
    .array(SubjectInsightSchema)
    .describe('Detailed insights, strengths, weaknesses, and recommendations for each subject/topic.'),
  generalRecommendations: z
    .array(z.string())
    .describe('General actionable recommendations applicable across all subjects or for overall study habits.'),
});

export type MentorPerformanceInsightOutput = z.infer<typeof MentorPerformanceInsightOutputSchema>;

export async function mentorPerformanceInsight(
  input: MentorPerformanceInsightInput
): Promise<MentorPerformanceInsightOutput> {
  return mentorPerformanceInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentorPerformanceInsightPrompt',
  input: { schema: MentorPerformanceInsightInputSchema },
  output: { schema: MentorPerformanceInsightOutputSchema },
  prompt: `You are an experienced and empathetic mentor for students preparing for competitive exams like NEET, JEE, CUET, GATE, CAT. Your goal is to provide insightful, human-readable feedback on their performance, avoiding raw numbers and focusing on interpretation, strengths, weaknesses, and actionable next steps. Your tone should be supportive and encouraging, helping the student understand what is happening, why it is happening, and what they should do next.

Here is the student's performance data:
{{#each studentPerformance}}
Subject: {{{subject}}}
{{#if topic}}Topic: {{{topic}}}{{/if}}
Accuracy: {{accuracy}}%
Speed Score: {{speedScore}}
{{#if struggleKeywords.length}}Areas of Struggle: {{#each struggleKeywords}}- {{{this}}}
{{/each}}{{/if}}
{{#if strengthKeywords.length}}Areas of Strength: {{#each strengthKeywords}}- {{{this}}}
{{/each}}{{/if}}
---
{{/each}}

{{#if studentGoal}}
The student's current goal is to prepare for the '{{{studentGoal}}}' exam.
{{/if}}

Based on this data, provide a comprehensive mentor-like assessment. For each subject/topic, identify specific strengths, areas for improvement (weaknesses), and clear, actionable recommendations. Also, provide an overall assessment and general recommendations applicable across all subjects.

Remember: avoid directly stating raw numbers like accuracy percentages or speed scores in your final insights. Instead, interpret them into qualitative observations. For example, instead of "accuracy: 62%", say "You are performing well in this area, consistently answering questions correctly." or "This area seems to be a consistent challenge." Focus on cause-effect relationships and actionable advice.
`,
});

const mentorPerformanceInsightFlow = ai.defineFlow(
  {
    name: 'mentorPerformanceInsightFlow',
    inputSchema: MentorPerformanceInsightInputSchema,
    outputSchema: MentorPerformanceInsightOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
