
import ProfilePageClient from './client';

export default function Page({ params }: { params: { userId: string } }) {
  return <ProfilePageClient userId={params.userId} />;
}
