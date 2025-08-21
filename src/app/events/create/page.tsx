'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import CreateEventForm from '@/components/create-event-form';
import type { Event } from '@/types/domain';

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = searchParams.get('clubId') || 'club-1'; // Default club for demo
  const { permissions } = useAuth();

  if (!permissions.includes('action:create-event')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to create events. Please contact your club admin.
        </p>
      </div>
    );
  }

  const handleSuccess = (event: Event) => {
    router.push(`/events/${event.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-8">
      <CreateEventForm
        clubId={clubId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
