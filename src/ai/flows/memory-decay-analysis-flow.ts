
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing memory decay and providing 
 * intelligent revision recommendations.
 *
 * - memoryDecayAnalysis - A function that analyzes topic retention and suggests recovery steps.
 * - MemoryDecayAnalysisInput - Input schema for the flow.
 * - MemoryDecayAnalysisOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TopicRetentionSchema = z.object({
  topicName: z.string().describe('The name of the subject or specific concept.'),
  currentRetention: z.number().min(0).max(100).describe('Current estimated retention percentage (0-100).'),
  lastStudiedDaysAgo: z.number().describe('How many days since this topic was last studied.'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).describe('How difficult the student finds this topic.'),
});

const MemoryDecayAnalysisInputSchema = z.object({
  topics: z.array(TopicRetentionSchema).describe('A list of topics and their current retention status.'),
  examType: z.string().describe('The exam the student is preparing for (e.g., NEET).'),
});
export type MemoryDecayAnalysisInput = z.infer<typeof MemoryDecayAnalysisInputSchema>;

const RevisionRecommendationSchema = z.object({
  topicName: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  timeToForget: z.string().describe('Human phrasing for when the topic might fade (e.g., "May fade in ~2 days").'),
  behavioralInsight: z.string().describe('Subtle note about the student\'s history with this topic (e.g., "This topic tends to slip after gaps").'),
  recoveryDifficulty: z.enum(['quick', 'moderate', 'intensive']),
});

const MemoryDecayAnalysisOutputSchema = z.object({
  recommendations: z.array(RevisionRecommendationSchema),
  overallRecoveryStrategy: z.string().describe('A brief mentor-like note on how to handle the current revision load.'),
});
export type MemoryDecayAnalysisOutput = z.infer<typeof MemoryDecayAnalysisOutputSchema>;

export async function memoryDecayAnalysis(input: MemoryDecayAnalysisInput): Promise<MemoryDecayAnalysisOutput> {
  return memoryDecayAnalysisFlow(input);
}

const memoryDecayAnalysisPrompt = ai.definePrompt({
  name: 'memoryDecayAnalysisPrompt',
  input: { schema: MemoryDecayAnalysisInputSchema },
  output: { schema: MemoryDecayAnalysisOutputSchema },
  prompt: `You are an expert in cognitive science and exam preparation. Your goal is to act as an "Intelligent Memory Recovery System" for a student preparing for the {{{examType}}} exam.

Based on the provided topics and their retention metrics, analyze the memory decay and provide prioritized revision recommendations.

For each topic, provide:
1.  **Priority**: Based on retention level and last studied date. High priority should be for low retention or long gaps in hard topics.
2.  **Time-to-forget**: Use natural, human-readable phrasing (e.g., "Critical: may fade within 24 hours", "Stable for about a week", "Starting to soften").
3.  **Behavioral Insight**: Provide a subtle, personalized-sounding note about the topic's behavior (e.g., "You recover this quickly when revisited", "This concept requires frequent short exposures", "Usually slips when you focus too much on Physics").
4.  **Recovery Difficulty**: How much effort is needed to bring retention back to 95%+.

Ensure the tone is supportive, "noticed" rather than "measured", and feels like an intervention before memory fails.

Topics Data:
{{#each topics}}
- Topic: {{{topicName}}}, Retention: {{currentRetention}}%, Last Studied: {{lastStudiedDaysAgo}} days ago, Difficulty: {{difficultyLevel}}
{{/each}}
`
});

const memoryDecayAnalysisFlow = ai.defineFlow(
  {
    name: 'memoryDecayAnalysisFlow',
    inputSchema: MemoryDecayAnalysisInputSchema,
    outputSchema: MemoryDecayAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await memoryDecayAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to analyze memory decay.');
    }
    return output;
  }
);
