
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing specific mistakes in the Mistake Notebook.
 * It provides a calm reflection prompt and identifies the "signal" behind the error.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MistakeInputSchema = z.object({
  questionText: z.string(),
  subject: z.string(),
  topic: z.string(),
  errorType: z.string(),
  repeatCount: z.number(),
  examType: z.string(),
});
export type MistakeInput = z.infer<typeof MistakeInputSchema>;

const MistakeAnalysisOutputSchema = z.object({
  reflectionPrompt: z.string().describe('A calm question to make the student think, e.g., "What was the specific turning point in this calculation?"'),
  patternSignal: z.string().describe('The underlying behavioral signal, e.g., "This appears to be a consistency signal rather than a knowledge gap."'),
  suggestedActions: z.array(z.string()).describe('1-2 supportive next steps.'),
  toneNote: z.string().describe('A very short, supportive phrase like "A valuable signal for growth."'),
});
export type MistakeAnalysisOutput = z.infer<typeof MistakeAnalysisOutputSchema>;

export async function analyzeMistake(input: MistakeInput): Promise<MistakeAnalysisOutput> {
  return analyzeMistakeFlow(input);
}

const analyzeMistakePrompt = ai.definePrompt({
  name: 'analyzeMistakePrompt',
  input: { schema: MistakeInputSchema },
  output: { schema: MistakeAnalysisOutputSchema },
  prompt: `You are a reflective learning coach for the {{{examType}}} exam. 
A student has recorded a mistake in their notebook. Your goal is to help them see it as a "signal" for growth, not a failure.

Mistake Details:
- Question: "{{{questionText}}}"
- Topic: {{{topic}}} ({{{subject}}})
- Error Type: {{{errorType}}}
- This mistake has occurred {{repeatCount}} times.

Provide:
1. A calm, open-ended reflection prompt.
2. An identification of the "signal" (the behavioral pattern).
3. Supportive actions.

Keep the tone calm, observant, and non-judgmental. Avoid words like "wrong", "fail", or "bad". Use "signal", "pattern", "observation".`
});

const analyzeMistakeFlow = ai.defineFlow(
  {
    name: 'analyzeMistakeFlow',
    inputSchema: MistakeInputSchema,
    outputSchema: MistakeAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeMistakePrompt(input);
    if (!output) throw new Error('Failed to analyze mistake.');
    return output;
  }
);
