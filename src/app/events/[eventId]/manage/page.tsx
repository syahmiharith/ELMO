import EventManageClient from './client';

export default function Page({ params }: { params: { eventId: string } }) {
  // Add this line to increase the server action timeout.
  // Recommended for pages that generate content with AI.
  // export const maxDuration = 120;
  return <EventManageClient eventId={params.eventId} />;
}
