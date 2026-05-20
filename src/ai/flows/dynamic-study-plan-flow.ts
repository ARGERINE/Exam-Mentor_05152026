
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a dynamic, adaptive study plan.
 * It analyzes current retention, performance, and balance to suggest a "why-driven" schedule.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudyBlockSchema = z.object({
  timeSlot: z.string().describe('e.g., "09:00 AM - 10:30 AM"'),
  topic: z.string(),
  subject: z.string(),
  reason: z.string().describe('The mentor-like "why" for this block (e.g., "Declining retention detected").'),
  intensity: z.enum(['low', 'medium', 'high']),
});

const SubjectBalanceSchema = z.object({
  subject: z.string(),
  status: z.enum(['under_allocated', 'optimal', 'over_allocated']),
  currentHours: z.number(),
  targetHours: z.number(),
});

const DynamicStudyPlanInputSchema = z.object({
  examType: z.string(),
  recentPerformance: z.array(z.any()),
  retentionData: z.array(z.any()),
  totalAvailableHours: z.number().default(6),
});
export type DynamicStudyPlanInput = z.infer<typeof DynamicStudyPlanInputSchema>;

const DynamicStudyPlanOutputSchema = z.object({
  dailyTimeline: z.array(StudyBlockSchema),
  subjectBalance: z.array(SubjectBalanceSchema),
  adjustmentAdvice: z.string().describe('A soft mentor-like suggestion for the day.'),
  flexibilityNote: z.string().describe('A note about how the plan can be adapted.'),
});
export type DynamicStudyPlanOutput = z.infer<typeof DynamicStudyPlanOutputSchema>;

export async function generateDynamicStudyPlan(input: DynamicStudyPlanInput): Promise<DynamicStudyPlanOutput> {
  return dynamicStudyPlanFlow(input);
}

const dynamicStudyPlanPrompt = ai.definePrompt({
  name: 'dynamicStudyPlanPrompt',
  input: { schema: DynamicStudyPlanInputSchema },
  output: { schema: DynamicStudyPlanOutputSchema },
  prompt: `You are an expert academic strategist for the {{{examType}}} exam. 
Create a "living" study plan for today. Instead of a rigid timetable, provide a "why-driven" schedule.

Data Context:
- Performance History:
{{#each recentPerformance}}  * Subject: {{subject}}, Accuracy: {{accuracy}}%
{{/each}}
- Memory Decay/Retention:
{{#each retentionData}}  * Topic: {{topicName}}, Retention: {{currentRetention}}%, Difficulty: {{difficultyLevel}}
{{/each}}
- Available Hours: {{totalAvailableHours}}

Tasks:
1. Divide the {{totalAvailableHours}} hours into 3-4 meaningful blocks.
2. For each block, provide a specific 'reason' based on the data (e.g., "Physics is scheduled now because your accuracy is high in the mornings", "Biology revision is critical due to memory decay").
3. Analyze the 'Subject Balance' — are they spending too much time on one subject while neglecting another?
4. Provide a supportive 'adjustmentAdvice' message.

The tone should be "noticed" and "guiding", never rigid or demanding. Avoid using the word "must". Use phrases like "You might find value in..." or "This is scheduled because..."`
});

const dynamicStudyPlanFlow = ai.defineFlow(
  {
    name: 'dynamicStudyPlanFlow',
    inputSchema: DynamicStudyPlanInputSchema,
    outputSchema: DynamicStudyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await dynamicStudyPlanPrompt(input);
    if (!output) throw new Error('Failed to generate dynamic study plan.');
    return output;
  }
);
