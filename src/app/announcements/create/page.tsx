'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import CreateAnnouncementForm from '@/components/create-announcement-form';
import type { Announcement } from '@/types/announcement';

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = searchParams.get('clubId') || 'club-1'; // Default club for demo
  const { permissions } = useAuth();

  if (!permissions.includes('action:create-event')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to create announcements. Please contact your club admin.
        </p>
      </div>
    );
  }

  const handleSuccess = (announcement: Announcement) => {
    router.push('/announcements');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8">
      <CreateAnnouncementForm
        clubId={clubId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
