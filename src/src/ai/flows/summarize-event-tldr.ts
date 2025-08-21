
'use server';
/**
 * @fileOverview Summarizes an event description into TL;DR highlights.
 *
 * - summarizeEventTldr - A function that generates a short summary of an event.
 * - SummarizeEventTldrInput - The input type for the summarizeEventTldr function.
 * - SummarizeEventTldrOutput - The return type for the summarizeEventTldr function.
 */

import {ai} from '@/ai/genkit';
import {GenerateResponse} from 'genkit';
import {z} from 'genkit';

const SummarizeEventTldrInputSchema = z.object({
  description: z.string().describe("The full description of the event."),
});
export type SummarizeEventTldrInput = z.infer<typeof SummarizeEventTldrInputSchema>;

const SummarizeEventTldrOutputSchema = z.object({
  highlights: z.array(z.string()).describe("A list of one-word bullet points summarizing the event. Each bullet point should be a single word."),
});
export type SummarizeEventTldrOutput = z.infer<typeof SummarizeEventTldrOutputSchema>;

export async function summarizeEventTldr(input: SummarizeEventTldrInput): Promise<SummarizeEventTldrOutput> {
  return summarizeEventTldrFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeEventTldrPrompt',
  input: {schema: SummarizeEventTldrInputSchema},
  output: {schema: SummarizeEventTldrOutputSchema},
  prompt: `Generate a TL;DR summary for the following event description. The summary should be a list of single-word bullet points.

Event Description:
{{{description}}}

Return the result as a JSON object with a "highlights" key containing an array of strings.`,
});

// Helper function to handle retries with exponential backoff
async function withRetry<T>(fn: () => Promise<GenerateResponse<T>>, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  let delay = initialDelay;
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.message.includes('503')) {
        retries++;
        if (retries >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  // This part should be unreachable, but typescript needs a return path.
  throw new Error('Max retries reached, but no result was returned.');
}


const summarizeEventTldrFlow = ai.defineFlow(
  {
    name: 'summarizeEventTldrFlow',
    inputSchema: SummarizeEventTldrInputSchema,
    outputSchema: SummarizeEventTldrOutputSchema,
  },
  async input => {
    const {output} = await withRetry(() => prompt(input));
    return output!;
  }
);
