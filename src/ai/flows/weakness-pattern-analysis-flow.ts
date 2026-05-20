
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing student weaknesses into conceptual clusters and patterns.
 * 
 * - analyzeWeaknessPatterns - A function that groups errors into behavioral and conceptual clusters.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ErrorLogSchema = z.object({
  questionId: z.string(),
  subject: z.string(),
  topic: z.string(),
  errorType: z.string().describe('e.g., "calculation", "conceptual", "misreading", "time_pressure"'),
  timeTakenSeconds: z.number(),
  isRepeated: z.boolean(),
});

const WeaknessPatternInputSchema = z.object({
  errorLogs: z.array(ErrorLogSchema),
  examType: z.string(),
});
export type WeaknessPatternInput = z.infer<typeof WeaknessPatternInputSchema>;

const ConceptClusterSchema = z.object({
  title: z.string().describe('e.g., "Graph Interpretation", "Multi-step reasoning"'),
  accuracyTrend: z.number().describe('0-100'),
  errorFrequency: z.number().describe('How often this pattern appears'),
  linkedTopics: z.array(z.string()),
  interpretation: z.string().describe('e.g., "Errors here are consistent under time pressure"'),
  suggestedAction: z.string().describe('e.g., "Slow down attempt strategy here"'),
});

const RepeatedErrorSchema = z.object({
  patternName: z.string(),
  occurrenceCount: z.number(),
  insight: z.string(),
});

const WeaknessPatternOutputSchema = z.object({
  clusters: z.array(ConceptClusterSchema),
  repeatedErrors: z.array(RepeatedErrorSchema),
  overallDiagnostic: z.string().describe('A high-level mentor-like summary of the "why" behind the patterns.'),
});
export type WeaknessPatternOutput = z.infer<typeof WeaknessPatternOutputSchema>;

export async function analyzeWeaknessPatterns(input: WeaknessPatternInput): Promise<WeaknessPatternOutput> {
  return analyzeWeaknessPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWeaknessPatternsPrompt',
  input: { schema: WeaknessPatternInputSchema },
  output: { schema: WeaknessPatternOutputSchema },
  prompt: `You are a diagnostic learning expert for the {{{examType}}} exam. 
Analyze the following error logs to identify recurring "Concept Clusters" and "Repeated Errors". 

Instead of focusing on subjects, focus on the *type* of thinking required (e.g., "Mathematical Execution", "Assertion-Reason Logic", "Memory Retrieval").

Error Logs:
{{#each errorLogs}}
- Topic: {{{topic}}}, Type: {{{errorType}}}, Time: {{timeTakenSeconds}}s, Repeated: {{isRepeated}}
{{/each}}

Goal: 
1. Group errors into clusters based on the cognitive pattern, not just the subject.
2. Identify specific repeated error patterns.
3. Provide a diagnostic interpretation that feels supportive and "understood".
`
});

const analyzeWeaknessPatternsFlow = ai.defineFlow(
  {
    name: 'analyzeWeaknessPatternsFlow',
    inputSchema: WeaknessPatternInputSchema,
    outputSchema: WeaknessPatternOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to analyze weakness patterns.');
    return output;
  }
);
