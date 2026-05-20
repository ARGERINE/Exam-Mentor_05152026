
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a strategic Weekly Action Plan.
 * It synthesizes mastery levels and recent performance into a structured weekly guide.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WeeklyTaskSchema = z.object({
  topic: z.string(),
  subject: z.string(),
  accuracy: z.number().describe('Current accuracy percentage.'),
  action: z.enum(['revise', 'practice', 'deep_dive', 'mock_test']).describe('The primary mentor recommendation.'),
  reason: z.string().describe('The "why" behind this task.'),
});

const WeeklyPlanInputSchema = z.object({
  examType: z.string(),
  masteryData: z.array(z.object({
    topic: z.string(),
    subject: z.string(),
    accuracy: z.number(),
    masteryLevel: z.string(),
  })),
  recentTrend: z.string().describe('A summary of recent performance trends.'),
});
export type WeeklyPlanInput = z.infer<typeof WeeklyPlanInputSchema>;

const WeeklyPlanOutputSchema = z.object({
  overview: z.object({
    targetAccuracy: z.number(),
    estimatedHours: z.number(),
    priorityFocus: z.string(),
  }),
  insightBanner: z.string().describe('A high-impact mentor-like summary of the week\'s strategy.'),
  subjectGrid: z.array(z.object({
    subject: z.string(),
    tasks: z.array(WeeklyTaskSchema),
  })),
  dailyBreakdown: z.array(z.object({
    day: z.string(),
    focusArea: z.string(),
    tasks: z.array(z.string()),
  })),
});
export type WeeklyPlanOutput = z.infer<typeof WeeklyPlanOutputSchema>;

export async function generateWeeklyActionPlan(input: WeeklyPlanInput): Promise<WeeklyPlanOutput> {
  return weeklyActionPlanFlow(input);
}

const weeklyActionPlanPrompt = ai.definePrompt({
  name: 'weeklyActionPlanPrompt',
  input: { schema: WeeklyPlanInputSchema },
  output: { schema: WeeklyPlanOutputSchema },
  prompt: `You are a high-level academic strategist for the {{{examType}}} exam. 
Create a comprehensive Weekly Action Plan that feels like a roadmap to mastery.

Data Context:
- Mastery Data:
{{#each masteryData}}  * {{{topic}}} ({{{subject}}}): {{accuracy}}% Accuracy, Status: {{{masteryLevel}}}
{{/each}}
- Recent Performance Trend: {{{recentTrend}}}

Guidelines:
1. **Insight Banner**: Create ONE powerful sentence that captures the week's priority (e.g., "This week is about bridging the gap between theory and calculation in Physics").
2. **Strategy**: Prioritize topics with low accuracy (revise) and topics with high accuracy but low practice volume (maintain/practice).
3. **Tone**: Diagnostic, strategic, and encouraging. Focus on the "Why".
4. **Daily Breakdown**: Distribute tasks logically across 7 days.

Avoid robotic lists. Ensure the plan feels adaptive and prioritized.`
});

const weeklyActionPlanFlow = ai.defineFlow(
  {
    name: 'weeklyActionPlanFlow',
    inputSchema: WeeklyPlanInputSchema,
    outputSchema: WeeklyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await weeklyActionPlanPrompt(input);
    if (!output) throw new Error('Failed to generate weekly plan.');
    return output;
  }
);
