
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Calendar, ArrowRight, CheckSquare, Sparkles, Ticket } from 'lucide-react';
import { useFeature } from '@/hooks/use-feature';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useEffect, useState } from 'react';
import type { Club, Event, Ticket as TicketType } from '@/types/domain';
import { listEvents, listMyClubs, listMyTickets } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function DashboardPage() {
  const { toast } = useToast();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [activeTickets, setActiveTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showMyClubs = useFeature('dashboard:my-clubs');
  const showMyRsvps = useFeature('dashboard:my-rsvps');
  const showUpcomingEvents = useFeature('dashboard:upcoming-events');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [clubsData, eventsData, ticketsData] = await Promise.all([
          listMyClubs(),
          listEvents(),
          listMyTickets(),
        ]);
        setMyClubs(clubsData);
        setUpcomingEvents(eventsData.slice(0, 5)); // Fetch 5 to leave space for the 'See More' card
        setActiveTickets(ticketsData.filter(t => t.status === 'issued').slice(0, 4));
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load dashboard data.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Add skeleton loader
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Welcome back!
        </h1>
        <p className="text-muted-foreground">
          Here's a snapshot of what's happening in your community.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {showMyClubs && (
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline flex items-center gap-2">
                  <Users className="size-5" />
                  My Clubs
                </CardTitle>
                <CardDescription>Clubs you are a member of.</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/clubs">
                  View All <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {myClubs.map((club) => (
                <div key={club.id} className="flex items-start gap-4 rounded-lg border p-3">
                  <Image
                    src={club.imageUrl}
                    alt={club.name}
                    width={56}
                    height={56}
                    className="size-14 rounded-md object-cover"
                    data-ai-hint="club logo"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{club.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {club.memberCount} members
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {showMyRsvps && (
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="font-headline flex items-center gap-2 text-xl">
                <Ticket className="size-5" />
                My Ticket
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeTickets.map((ticket) => (
                  <Link href={`/tickets/${ticket.id}`} key={ticket.id} className="block group hover:bg-muted p-2 rounded-lg -m-2 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{ticket.event.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          <ClientFormattedDate date={ticket.event.date} options={{ month: 'short', day: 'numeric' }} />
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
               {activeTickets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">You have no active tickets.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showUpcomingEvents && (
        <Card>
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Discover Events
              </CardTitle>
              <CardDescription>
                Don't miss out on these exciting events.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Carousel
              opts={{
                align: 'start',
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent>
                {upcomingEvents.map((event) => (
                  <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Link href={`/events/${event.id}`} className="block space-y-3 group">
                        <div className="overflow-hidden rounded-lg">
                          <Image
                            src={event.imageUrl}
                            alt={event.name}
                            width={400}
                            height={200}
                            className="rounded-lg object-cover aspect-video transition-transform duration-300 group-hover:scale-105"
                            data-ai-hint="event poster"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">{event.club.name}</p>
                          <p className="text-sm text-muted-foreground">
                            <ClientFormattedDate date={event.date} options={{ dateStyle: 'medium', timeStyle: 'short' }} />
                          </p>
                        </div>
                      </Link>
                    </div>
                  </CarouselItem>
                ))}
                 <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                       <Link href="/events" className="flex h-full flex-col items-center justify-center rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                         <ArrowRight className="size-8 text-muted-foreground" />
                         <span className="mt-2 text-sm font-medium text-muted-foreground">See more</span>
                       </Link>
                    </div>
                 </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
