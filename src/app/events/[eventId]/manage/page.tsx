import EventManageClient from './client';

export default function Page({ params }: { params: { eventId: string } }) {
  return <EventManageClient eventId={params.eventId} />;
}
