import EditEventClient from './client';

interface EditEventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { eventId } = await params;

  return <EditEventClient eventId={eventId} />;
}
