import EventDetailsClient from './client';

export default async function Page({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <EventDetailsClient eventId={eventId} />;
}
