// src/ai/flows/recommend-clubs-and-events.ts
'use server';
/**
 * @fileOverview Recommends clubs and events based on user activity and interests.
 *
 * - recommendClubsAndEvents - A function that recommends clubs and events.
 * - RecommendClubsAndEventsInput - The input type for the recommendClubsAndEvents function.
 * - RecommendClubsAndEventsOutput - The return type for the recommendClubsAndEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendClubsAndEventsInputSchema = z.object({
  userActivity: z.string().describe('A description of the user\'s past activities and interests.'),
});
export type RecommendClubsAndEventsInput = z.infer<typeof RecommendClubsAndEventsInputSchema>;

const RecommendClubsAndEventsOutputSchema = z.object({
  recommendedClubs: z.array(z.string()).describe('A list of recommended clubs.'),
  recommendedEvents: z.array(z.string()).describe('A list of recommended events.'),
});
export type RecommendClubsAndEventsOutput = z.infer<typeof RecommendClubsAndEventsOutputSchema>;

export async function recommendClubsAndEvents(input: RecommendClubsAndEventsInput): Promise<RecommendClubsAndEventsOutput> {
  return recommendClubsAndEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendClubsAndEventsPrompt',
  input: {schema: RecommendClubsAndEventsInputSchema},
  output: {schema: RecommendClubsAndEventsOutputSchema},
  prompt: `Based on the user's past activity and interests: {{{userActivity}}}, recommend clubs and events. Return the result as a JSON object.

{{genkitOutputSchema}}`,
});

const recommendClubsAndEventsFlow = ai.defineFlow(
  {
    name: 'recommendClubsAndEventsFlow',
    inputSchema: RecommendClubsAndEventsInputSchema,
    outputSchema: RecommendClubsAndEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
