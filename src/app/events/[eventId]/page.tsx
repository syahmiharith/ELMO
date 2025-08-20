import EventDetailsClient from './client';

export default function Page({ params }: { params: { eventId: string } }) {
  return <EventDetailsClient eventId={params.eventId} />;
}
