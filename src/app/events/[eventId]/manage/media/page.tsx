import MediaManagementClient from './client';

interface MediaManagementPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function MediaManagementPage({ params }: MediaManagementPageProps) {
  const { eventId } = await params;

  return <MediaManagementClient eventId={eventId} />;
}
