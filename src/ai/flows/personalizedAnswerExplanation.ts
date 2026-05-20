
'use server';
/**
 * @fileOverview Provides a personalized, mentor-like explanation for practice questions.
 *
 * - personalizedAnswerExplanation - A function that generates mentor-like feedback for student answers.
 * - PersonalizedAnswerExplanationInput - The input type for the personalizedAnswerExplanation function.
 * - PersonalizedAnswerExplanationOutput - The return type for the personalizedAnswerExplanation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PersonalizedAnswerExplanationInputSchema = z.object({
  question: z.string().describe('The full text of the practice question.'),
  userAnswer: z.string().describe('The answer provided by the student.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  concept: z.string().describe('The core concept or topic related to the question.'),
  examType: z.string().describe('The type of exam (e.g., NEET, JEE, CUET) the student is preparing for.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The perceived difficulty of the question.'),
  performanceHistorySummary: z.string().describe('A brief, human-readable summary of the student\u2019s recent performance, to help personalize the mentor\u2019s tone and advice. Example: "You have been steadily improving in Chemistry but struggle with conceptual physics questions."'),
});
export type PersonalizedAnswerExplanationInput = z.infer<typeof PersonalizedAnswerExplanationInputSchema>;

const PersonalizedAnswerExplanationOutputSchema = z.object({
  explanation: z.string().describe('A personalized, mentor-like explanation of why the correct answer is right and why the user\u2019s answer might be wrong, avoiding robotic phrasing.'),
  guidance: z.string().describe('Actionable, human-readable advice or next steps for the student to improve their understanding.'),
  areasToFocus: z.array(z.string()).describe('Specific sub-concepts or topics within the main concept that the student should review.'),
});
export type PersonalizedAnswerExplanationOutput = z.infer<typeof PersonalizedAnswerExplanationOutputSchema>;

export async function personalizedAnswerExplanation(input: PersonalizedAnswerExplanationInput): Promise<PersonalizedAnswerExplanationOutput> {
  return personalizedAnswerExplanationFlow(input);
}

const personalizedAnswerExplanationPrompt = ai.definePrompt({
  name: 'personalizedAnswerExplanationPrompt',
  input: { schema: PersonalizedAnswerExplanationInputSchema },
  output: { schema: PersonalizedAnswerExplanationOutputSchema },
  prompt: `You are an experienced, empathetic, and highly knowledgeable mentor for students preparing for the {{examType}} exam. Your goal is to provide personalized, human-readable insights and guidance, not just static solutions.

The student attempted a question related to the concept of "{{{concept}}}".
Here is the question they struggled with:
Question: "{{{question}}}"
Student's Answer: "{{{userAnswer}}}"
Correct Answer: "{{{correctAnswer}}}"
This question was considered "{{{difficulty}}}" difficulty.
Student's recent performance summary: "{{{performanceHistorySummary}}}"

Based on the student's answer, the correct answer, and their performance summary, please provide a mentor-like explanation and guidance. Focus on:
1.  **Explanation**: Clearly explain *why* the correct answer is correct, and *why* the student's answer might have been incorrect, addressing common misconceptions related to "{{{concept}}}". Use a supportive and encouraging tone.
2.  **Guidance**: Offer actionable advice or specific steps the student can take to improve their understanding of "{{{concept}}}" or similar question types. This should be practical and forward-looking.
3.  **Areas to Focus**: Identify 1-2 specific sub-concepts or topics within "{{{concept}}}" that the student should review.

**Important Guidelines**:
*   Avoid robotic phrasing or just stating accuracy percentages.
*   Prefer insights like "You might be overlooking..." or "It seems you tend to rush through..."
*   Prioritize clarity over density.
*   Use phrases that make the student feel understood and guided, like a real mentor would.
*   The output must be in JSON format, strictly adhering to the provided schema.
`,
});

const personalizedAnswerExplanationFlow = ai.defineFlow(
  {
    name: 'personalizedAnswerExplanationFlow',
    inputSchema: PersonalizedAnswerExplanationInputSchema,
    outputSchema: PersonalizedAnswerExplanationOutputSchema,
  },
  async (input) => {
    const { output } = await personalizedAnswerExplanationPrompt(input);
    return output!;
  }
);
