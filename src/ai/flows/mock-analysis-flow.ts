
'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing mock test performance.
 * It reconstructs the student's thinking, identifies fatigue zones, and detects confidence mismatches.
 *
 * - analyzeMockPerformance - A function that generates deep behavioral insights from a mock test.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MockQuestionAttemptSchema = z.object({
  questionId: z.string(),
  subject: z.string(),
  timeTakenSeconds: z.number(),
  confidenceLevel: z.number().min(1).max(5).describe('1 is low, 5 is high'),
  isCorrect: z.boolean(),
  mistakeCategory: z.enum(['conceptual', 'misread', 'careless', 'none']),
  orderAttempted: z.number(),
});

const MockAnalysisInputSchema = z.object({
  examName: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
  attempts: z.array(MockQuestionAttemptSchema),
});
export type MockAnalysisInput = z.infer<typeof MockAnalysisInputSchema>;

const MockAnalysisOutputSchema = z.object({
  performanceSummary: z.object({
    percentileBand: z.string().describe('e.g., "92nd - 95th Percentile"'),
    phaseIndicator: z.enum(['learning', 'stabilizing', 'peak']),
    overallStatus: z.string().describe('Short mentor-like status.'),
  }),
  fatigueAnalysis: z.object({
    fatigueZoneMinutes: z.string().describe('e.g., "75-90 minutes"'),
    precisionTrend: z.string().describe('Description of how accuracy changed over time.'),
    insight: z.string().describe('Mentor observation on fatigue.'),
  }),
  strategyAnalysis: z.object({
    actualVsOptimal: z.string().describe('Comparison of how they navigated subjects vs how they should have.'),
    missedOpportunities: z.array(z.string()).describe('Specific easy questions missed or time wasted.'),
  }),
  confidenceAccuracyMismatch: z.array(z.object({
    subject: z.string(),
    mismatchType: z.enum(['overconfidence', 'hesitation', 'aligned']),
    insight: z.string(),
  })),
  mistakeBreakdown: z.object({
    conceptualPercentage: z.number(),
    misreadPercentage: z.number(),
    carelessPercentage: z.number(),
    interpretation: z.string().describe('Qualitative interpretation of these errors.'),
  }),
  behavioralNarrative: z.string().describe('A cohesive story of the mock attempt.'),
});
export type MockAnalysisOutput = z.infer<typeof MockAnalysisOutputSchema>;

export async function analyzeMockPerformance(input: MockAnalysisInput): Promise<MockAnalysisOutput> {
  return analyzeMockPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMockPerformancePrompt',
  input: { schema: MockAnalysisInputSchema },
  output: { schema: MockAnalysisOutputSchema },
  prompt: `You are a high-performance exam coach. Analyze the following mock test data to reconstruct the student's thinking and behavior. 

Instead of just reporting scores, look for:
1. **Fatigue Zones**: Where did accuracy drop? Usually after a certain time or question count.
2. **Strategy**: Did they start with hard questions and burn out? Did they miss easy opportunities?
3. **Confidence vs Accuracy**: Did they get high-confidence questions wrong (overconfidence) or low-confidence ones right (lucky/hesitant)?
4. **The "Why"**: Why did they make these mistakes? 

Mock Test: {{{examName}}}
Final Score: {{{score}}}/{{{totalQuestions}}}

Attempts Data:
{{#each attempts}}
- Order: {{orderAttempted}}, Subject: {{{subject}}}, Time: {{timeTakenSeconds}}s, Confidence: {{confidenceLevel}}/5, Correct: {{isCorrect}}, Category: {{{mistakeCategory}}}
{{/each}}

Provide a diagnostic and encouraging analysis that helps the student understand their own behavioral patterns. Avoid raw tables; use interpreted insights.
`
});

const analyzeMockPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeMockPerformanceFlow',
    inputSchema: MockAnalysisInputSchema,
    outputSchema: MockAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to analyze mock performance.');
    return output;
  }
);
