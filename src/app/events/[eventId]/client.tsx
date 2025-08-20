
'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Ticket,
  Check,
  Users,
  DollarSign,
  Info,
  Dot,
  Flame
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Event as ClubEvent } from '@/types/domain';
import { useState, useEffect } from 'react';
import { getEvent, rsvpEvent } from '@/lib/api';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function EventDetailsClient({
  eventId,
}: {
  eventId: string;
}) {
  const { toast } = useToast();
  const { permissions } = useAuth();
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load event details.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, toast]);

  const handleRsvpAction = async () => {
    if (!event) return;
    try {
      await rsvpEvent(event.id);
      toast({
        title: 'RSVP Confirmed',
        description: `You are now attending ${event.name}.`,
      });
      setEvent({ ...event, viewerRsvpStatus: 'attending' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'RSVP Failed',
        description: 'Could not complete your RSVP. Please try again.',
      });
    }
  };

  if (isLoading || !event) {
    // TODO: Add skeleton
    return <div>Loading...</div>;
  }

  const isAttending = event.viewerRsvpStatus === 'attending';
  const canRsvp = permissions.includes('action:rsvp');
  
  const getStatusBadgeVariant = (status: ClubEvent['status']) => {
      switch (status) {
          case 'hot':
              return 'destructive';
          case 'available':
              return 'default';
          default:
              return 'secondary';
      }
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/events"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event Listings
      </Link>

      <div className="space-y-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted/50 flex items-center justify-center">
          <Logo className="w-24 text-muted-foreground/20" />
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className="absolute inset-0 object-cover"
            data-ai-hint="event photo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-12">
          {/* Left Section */}
          <div className="md:col-span-2 space-y-6">
            <header>
               <Badge variant={getStatusBadgeVariant(event.status)} className="capitalize mb-2">
                    {event.status === 'hot' && <Flame className="mr-1 h-3 w-3" />}
                    {event.status}
                </Badge>
              <h1 className="mt-1 text-4xl font-bold font-headline tracking-tight">
                {event.name}
              </h1>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader className='flex-row items-center gap-4 space-y-0'>
                        <Calendar className="size-8 text-primary" />
                        <CardTitle className='text-base'>Date & Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="font-medium"><ClientFormattedDate date={event.date} options={{ dateStyle: 'full' }} /></p>
                       <p className="text-muted-foreground"><ClientFormattedDate date={event.date} options={{ timeStyle: 'short' }} /></p>
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader className='flex-row items-center gap-4 space-y-0'>
                        <MapPin className="size-8 text-primary" />
                        <CardTitle className='text-base'>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="font-medium">{event.location}</p>
                       <a href="#" className="text-sm text-primary hover:underline">View on map</a>
                    </CardContent>
                 </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-muted-foreground">
                        {event.highlights?.map((highlight, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <Dot className="text-primary" />
                                <span>{highlight}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="size-5" />
                    About this Event
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-stone dark:prose-invert max-w-none">
                <p>{event.description}</p>
                 <p>This is where a more detailed, media-rich description of the event would go. You can include paragraphs, lists, and even images or embedded videos to give attendees a comprehensive overview of what to expect.</p>
                <p>For example, you could list:</p>
                <ul>
                    <li>Speaker bios</li>
                    <li>Event schedule</li>
                    <li>Sponsor information</li>
                    <li>FAQs</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Organized By</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={`/clubs/${event.club.id}`} className="flex items-center gap-4 group">
                        <Image src="https://placehold.co/100x100.png" alt={event.club.name} width={64} height={64} className="rounded-lg" data-ai-hint="club logo" />
                        <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary">{event.club.name}</h3>
                            <p className="text-muted-foreground">View Club Page</p>
                        </div>
                    </Link>
                </CardContent>
            </Card>

          </div>

          {/* Right Section */}
          <div className="md:col-span-1 mt-6 md:mt-0">
            <div className="sticky top-[0.3rem]">
               <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                     {event.price > 0 ? `$${(event.price / 100).toFixed(2)}` : 'Free'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {isAttending ? (
                    <Button variant="outline" size="lg" disabled>
                      <Check className="mr-2 h-4 w-4" />
                      Attending
                    </Button>
                  ) : (
                    canRsvp && (
                      <Button size="lg" onClick={handleRsvpAction}>
                        <Ticket className="mr-2 h-4 w-4" />
                        RSVP Now
                      </Button>
                    )
                  )}
                   <div className="text-sm text-muted-foreground flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                       <Users className="size-4" />
                       <span>Hosted by <Link href={`/clubs/${event.club.id}`} className="font-medium text-foreground hover:underline">{event.club.name}</Link></span>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
