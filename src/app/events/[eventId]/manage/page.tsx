import EventManageClient from './client';

export default async function Page({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  return <EventManageClient eventId={eventId} />;
}
