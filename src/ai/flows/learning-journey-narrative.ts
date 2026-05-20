
'use server';
/**
 * @fileOverview Provides a mentor-like narrative of a student's learning progress.
 *
 * - learningJourneyNarrative - A function that generates a personalized learning narrative.
 * - LearningJourneyNarrativeInput - The input type for the learningJourneyNarrative function.
 * - LearningJourneyNarrativeOutput - The return type for the learningJourneyNarrative function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningJourneyNarrativeInputSchema = z.object({
  examType: z
    .string()
    .describe(
      'The name of the exam the student is preparing for (e.g., "NEET", "JEE").'
    ),
  overallSummary: z
    .string()
    .describe(
      "A high-level summary of the student's overall progress and status."
    ),
  performanceHighlights: z
    .array(z.string())
    .describe(
      'Key performance metrics and trends, translated into human-readable insights (e.g., "You are improving steadily in Organic Chemistry").'
    ),
  studyHabitsSummary: z
    .string()
    .describe("A summary of the student's recent study habits and consistency."),
  recentEfforts: z
    .string()
    .describe("A description of the student's recent study efforts and activities."),
  identifiedStrengths: z
    .array(z.string())
    .describe('A list of areas where the student is performing well.'),
  identifiedWeaknesses: z
    .array(z.string())
    .describe('A list of areas that require improvement or more focus.'),
  causalAnalysisSummary: z
    .string()
    .describe(
      'An explanation of why certain performance outcomes are happening (e.g., "You tend to rush through assertion questions leading to lower accuracy").'
    ),
  suggestedNextSteps: z
    .array(z.string())
    .describe(
      "Specific, actionable recommendations for the student's next study tasks or focus areas."
    ),
});
export type LearningJourneyNarrativeInput = z.infer<
  typeof LearningJourneyNarrativeInputSchema
>;

const LearningJourneyNarrativeOutputSchema = z.object({
  narrative: z
    .string()
    .describe(
      "A continuous, mentor-like narrative of the student's learning progress, covering what is happening, why it is happening, and what to do next."
    ),
});
export type LearningJourneyNarrativeOutput = z.infer<
  typeof LearningJourneyNarrativeOutputSchema
>;

export async function learningJourneyNarrative(
  input: LearningJourneyNarrativeInput
): Promise<LearningJourneyNarrativeOutput> {
  return learningJourneyNarrativeFlow(input);
}

const learningJourneyNarrativePrompt = ai.definePrompt({
  name: 'learningJourneyNarrativePrompt',
  input: {schema: LearningJourneyNarrativeInputSchema},
  output: {schema: LearningJourneyNarrativeOutputSchema},
  prompt: `You are an experienced and empathetic mentor for students preparing for the {{{examType}}} exam. Your goal is to provide a continuous, encouraging, and actionable narrative about the student's learning journey, just like an ongoing conversation. Avoid robotic phrasing or raw numbers; instead, translate data into clear, human-readable insights and advice.

Structure your response into three clear sections, focusing on:
1.  **What is happening?**
2.  **Why is it happening?**
3.  **What should I do next?**

Here is the student's current learning context:

Overall Summary:
{{{overallSummary}}}

Performance Highlights:
{{#each performanceHighlights}}- {{{this}}}
{{/each}}

Study Habits Summary:
{{{studyHabitsSummary}}}

Recent Efforts:
{{{recentEfforts}}}

Identified Strengths:
{{#each identifiedStrengths}}- {{{this}}}
{{/each}}

Identified Weaknesses:
{{#each identifiedWeaknesses}}- {{{this}}}
{{/each}}

Causal Analysis Summary:
{{{causalAnalysisSummary}}}

Suggested Next Steps:
{{#each suggestedNextSteps}}- {{{this}}}
{{/each}}

Please craft a cohesive narrative that flows naturally, connects cause and effect, and provides clear direction. Start with a warm greeting. Ensure the "What should I do next?" section contains specific, actionable steps derived from the suggested next steps.
`,
});

const learningJourneyNarrativeFlow = ai.defineFlow(
  {
    name: 'learningJourneyNarrativeFlow',
    inputSchema: LearningJourneyNarrativeInputSchema,
    outputSchema: LearningJourneyNarrativeOutputSchema,
  },
  async (input) => {
    const {output} = await learningJourneyNarrativePrompt(input);
    return output!;
  }
);
