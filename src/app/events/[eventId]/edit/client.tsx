'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getEvent } from '@/lib/api';
import EditEventForm from '@/components/edit-event-form';
import type { Event } from '@/types/domain';

interface EditEventClientProps {
  eventId: string;
}

export default function EditEventClient({ eventId }: EditEventClientProps) {
  const router = useRouter();
  const { permissions } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (!permissions.includes('action:create-event')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to edit events. Please contact your club admin.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-muted-foreground mb-4">
          {error || 'The event you are looking for does not exist.'}
        </p>
        <button 
          onClick={() => router.back()}
          className="text-primary hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const handleSuccess = (updatedEvent: Event) => {
    router.push(`/events/${updatedEvent.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDelete = () => {
    router.push('/events');
  };

  return (
    <div className="container mx-auto py-8">
      <EditEventForm
        event={event}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        onDelete={handleDelete}
      />
    </div>
  );
}
