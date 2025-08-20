'use server';

import type { RecommendClubsAndEventsInput, RecommendClubsAndEventsOutput } from '@/ai/flows/recommend-clubs-and-events';
import { recommendClubsAndEvents } from '@/ai/flows/recommend-clubs-and-events';

export async function getRecommendations(
  input: RecommendClubsAndEventsInput
): Promise<{ success: boolean; data?: RecommendClubsAndEventsOutput; error?: string }> {
  try {
    const result = await recommendClubsAndEvents(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // In a real app, you might want to log this error to a monitoring service
    return { success: false, error: 'Failed to get recommendations. Please try again later.' };
  }
}
