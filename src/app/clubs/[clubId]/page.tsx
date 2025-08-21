import ClubDetailsClient from './client';

export default async function Page({ params }: { params: Promise<{ clubId: string }> }) {
  const { clubId } = await params;
  return <ClubDetailsClient clubId={clubId} />;
}
