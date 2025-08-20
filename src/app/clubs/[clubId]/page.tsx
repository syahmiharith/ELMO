import ClubDetailsClient from './client';

export default function Page({ params }: { params: { clubId: string } }) {
  return <ClubDetailsClient clubId={params.clubId} />;
}
