
'use server';
/**
 * @fileOverview This file defines a Genkit flow for a deep-dive analytics assessment.
 * It identifies hidden patterns like stability fluctuations, question-type weaknesses, 
 * and focus-drop points.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PerformanceDataPointSchema = z.object({
  date: z.string(),
  accuracy: z.number(),
  speed: z.number(),
});

const QuestionTypeAccuracySchema = z.object({
  format: z.string().describe('e.g., "Assertion-Reason", "Multi-step Calculation", "Direct Recall"'),
  accuracy: z.number(),
  averageTime: z.number(),
});

const AnalyticsDeepDiveInputSchema = z.object({
  examType: z.string(),
  performanceHistory: z.array(PerformanceDataPointSchema),
  questionTypeData: z.array(QuestionTypeAccuracySchema),
  retentionLevels: z.array(z.object({ topic: z.string(), level: z.number() })),
  sessionFocusLogs: z.array(z.object({ minute: z.number(), precision: z.number() })),
});
export type AnalyticsDeepDiveInput = z.infer<typeof AnalyticsDeepDiveInputSchema>;

const AnalyticsDeepDiveOutputSchema = z.object({
  stabilityIndex: z.number().describe('0-100 score of how consistent performance is.'),
  stabilityInsight: z.string().describe('Interpretation of fluctuations.'),
  formatAnalysis: z.array(z.object({
    format: z.string(),
    status: z.enum(['strength', 'vulnerable', 'critical']),
    insight: z.string(),
  })),
  retentionDistribution: z.object({
    stablePercentage: z.number(),
    fadingPercentage: z.number(),
    criticalPercentage: z.number(),
    summary: z.string(),
  }),
  focusDetection: z.object({
    dropPointMinute: z.number(),
    patternDescription: z.string(),
    recommendation: z.string(),
  }),
  behavioralNarrative: z.string().describe('A cohesive story about the "hidden" patterns found.'),
});
export type AnalyticsDeepDiveOutput = z.infer<typeof AnalyticsDeepDiveOutputSchema>;

export async function analyzeDeepPatterns(input: AnalyticsDeepDiveInput): Promise<AnalyticsDeepDiveOutput> {
  return analyticsDeepDiveFlow(input);
}

const analyticsDeepDivePrompt = ai.definePrompt({
  name: 'analyticsDeepDivePrompt',
  input: { schema: AnalyticsDeepDiveInputSchema },
  output: { schema: AnalyticsDeepDiveOutputSchema },
  prompt: `You are a senior educational data scientist and mentor for the {{{examType}}} exam. 
Your goal is to reveal "hidden" patterns in the student's data that they wouldn't notice themselves.

Data to Analyze:
- Performance History:
{{#each performanceHistory}}  * Date: {{date}}, Accuracy: {{accuracy}}%, Speed: {{speed}}
{{/each}}
- Question Formats:
{{#each questionTypeData}}  * Format: {{format}}, Accuracy: {{accuracy}}%, Avg Time: {{averageTime}}s
{{/each}}
- Retention Levels:
{{#each retentionLevels}}  * Topic: {{topic}}, Level: {{level}}%
{{/each}}
- Focus Logs:
{{#each sessionFocusLogs}}  * Minute: {{minute}}, Precision: {{precision}}%
{{/each}}

Assessment Areas:
1. **Stability**: Is their accuracy wildly fluctuating? Why? (e.g., "Inconsistent after intense days").
2. **Formats**: Do they struggle with specific *types* of questions regardless of subject? (e.g., "Multi-step logic").
3. **Retention**: What is the overall health of their memory across topics?
4. **Focus**: Exactly when does their precision start to fail during a session?

Tone: Diagnostic, sophisticated, yet encouraging. Use phrases like "Hidden beneath the surface...", "We've detected a rhythm in your...", "The data suggests a transition point at..."
Avoid raw numbers in the narrative; focus on the *meaning* of the data.`
});

const analyticsDeepDiveFlow = ai.defineFlow(
  {
    name: 'analyticsDeepDiveFlow',
    inputSchema: AnalyticsDeepDiveInputSchema,
    outputSchema: AnalyticsDeepDiveOutputSchema,
  },
  async (input) => {
    const { output } = await analyticsDeepDivePrompt(input);
    if (!output) throw new Error('Failed to generate deep dive analytics.');
    return output;
  }
);
