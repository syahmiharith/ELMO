
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Search, MapPin, Calendar, Check, PlusCircle, Users, DollarSign, Flame, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useEffect, useState, useTransition, useCallback, useRef } from 'react';
import type { Event as ClubEvent, EventQuery, Club } from '@/types/domain';
import { listEvents, createEvent, getClub } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalizationNudge } from '@/components/personalization-nudge';
import { EventForm } from '@/components/event-form';

const PAGE_SIZE = 4;

type EventWithClub = ClubEvent & { club: Club };

function EventList({ events, isLoading, hasMore, onFetchMore }: { events: EventWithClub[], isLoading: boolean, hasMore: boolean, onFetchMore: () => void }) {
    const { permissions } = useAuth();
    const observer = useRef<IntersectionObserver>();

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
            onFetchMore();
        }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, onFetchMore]);

    if (isLoading && events.length === 0) {
        return <div className="flex justify-center items-center p-12"><Loader2 className="animate-spin" /></div>;
    }
    
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

    if (events.length === 0 && !isLoading) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p>No events found.</p>
            </div>
        );
    }

    return (
        <>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {events.map((event, index) => {
                const isAttending = event.viewerRsvpStatus === 'attending';
                const canRsvp = permissions.includes('action:rsvp');

                return (
                    <Link href={`/events/${event.id}`} key={event.id} className="group block h-full">
                    <Card
                        ref={index === events.length -1 ? lastElementRef : null}
                        className={cn(
                        'flex flex-col transition-all h-full',
                        'bg-transparent shadow-none border-none',
                        'group-hover:bg-card group-hover:shadow-lg group-hover:-translate-y-1'
                        )}
                    >
                        <CardHeader className="p-0 relative">
                        <div className="relative aspect-video w-full bg-muted/50 rounded-t-lg flex items-center justify-center">
                            <Logo className="w-24 text-muted-foreground/20" />
                            <Image
                                src={event.imageUrl}
                                alt={event.name}
                                width={400}
                                height={200}
                                className="absolute inset-0 w-full h-full rounded-t-lg object-cover"
                                data-ai-hint="event photo"
                            />
                        </div>

                        <div className='absolute top-2 right-2 flex gap-2'>
                            {event.status && event.status !== 'available' && (
                                <Badge variant={getStatusBadgeVariant(event.status)} className="capitalize">
                                    {event.status === 'hot' && <Flame className="mr-1 h-3 w-3" />}
                                    {event.status}
                                </Badge>
                            )}
                            {isAttending && canRsvp && (
                            <Badge>
                                <Check className="mr-1 h-3 w-3" /> Attending
                            </Badge>
                            )}
                        </div>
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 pt-6 pb-4">
                        <CardTitle className="font-headline text-xl mb-4">{event.name}</CardTitle>
                        
                        <div className="text-sm text-muted-foreground space-y-2.5 flex-1">
                            <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground"><ClientFormattedDate date={event.date} options={{ weekday: 'long', month: 'long', day: 'numeric' }} /></span>
                                <span><ClientFormattedDate date={event.date} options={{ timeStyle: 'short' }} /></span>
                            </div>
                            </div>
                            <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-medium text-foreground">Location</span>
                                <p>{event.location}</p>
                            </div>
                            </div>
                            <div className="flex items-start gap-3">
                            <Users className="h-4 w-4 mt-0.5 shrink-0" />
                            <div>
                                <span className="font-medium text-foreground">Organizer</span>
                                <p>{event.club.name}</p>
                            </div>
                            </div>
                        </div>
                        
                        <div className='mt-4 pt-4 border-t'>
                            <div className="flex items-center gap-3 text-sm">
                            <DollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div>
                                <span className="font-medium text-foreground">Price</span>
                                <p className='text-muted-foreground'>
                                {event.price > 0 ? `$${(event.price / 100).toFixed(2)}` : 'Free'}
                                </p>
                            </div>
                            </div>
                        </div>

                        </CardContent>
                    </Card>
                    </Link>
                );
            })}
        </div>
        {isLoading && <div className="flex justify-center items-center p-4"><Loader2 className="animate-spin" /></div>}
        </>
    );
}

export default function EventsPage() {
  const { permissions, user } = useAuth();
  const { toast } = useToast();
  
  const [trendingEvents, setTrendingEvents] = useState<EventWithClub[]>([]);
  const [forYouEvents, setForYouEvents] = useState<EventWithClub[]>([]);
  
  const [isLoading, setIsLoading] = useState({ trending: true, forYou: true });
  
  const [pages, setPages] = useState({ trending: 1, forYou: 1 });
  const [hasMore, setHasMore] = useState({ trending: true, forYou: true });
  const [activeTab, setActiveTab] = useState('trending');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');

  const pageTitle = activeTab === 'trending' ? 'Trending Events' : 'Event Listings';
  const pageDescription =
    activeTab === 'trending'
      ? `Showing popular events in ${user.address?.city || 'your area'}.`
      : "Find out what's happening on campus.";

  const fetchEvents = useCallback(async (
    query: EventQuery, 
    setter: React.Dispatch<React.SetStateAction<EventWithClub[]>>, 
    currentPage: number,
    listKey: 'trending' | 'forYou'
  ) => {
      setIsLoading(prev => ({...prev, [listKey]: true}));
      try {
        const finalQuery = { ...query, page: currentPage, pageSize: PAGE_SIZE };
        if (priceFilter !== 'all') {
            finalQuery.price = priceFilter;
        }

        const eventData = await listEvents(finalQuery);
        const eventsWithClubs = await Promise.all(
            eventData.map(async (event) => {
                const club = await getClub(event.clubId);
                return { ...event, club };
            })
        );
         if (eventsWithClubs.length < PAGE_SIZE) {
            setHasMore(prev => ({...prev, [listKey]: false}));
        }
        setter(prev => currentPage === 1 ? eventsWithClubs : [...prev, ...eventsWithClubs]);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load events.',
        });
      } finally {
        setIsLoading(prev => ({...prev, [listKey]: false}));
      }
    }, [toast, priceFilter]);
  
  useEffect(() => {
    // Reset and fetch when tab or filter changes
    setTrendingEvents([]);
    setForYouEvents([]);
    setPages({ trending: 1, forYou: 1 });
    setHasMore({ trending: true, forYou: true });
    fetchEvents({ sortBy: 'popularity' }, setTrendingEvents, 1, 'trending');
    fetchEvents({ sortBy: 'relevance' }, setForYouEvents, 1, 'forYou');
  }, [fetchEvents, activeTab, priceFilter]);

  const handleFetchMore = () => {
    if (activeTab === 'trending') {
        if (!isLoading.trending && hasMore.trending) {
            const nextPage = pages.trending + 1;
            setPages(prev => ({...prev, trending: nextPage}));
            fetchEvents({ sortBy: 'popularity' }, setTrendingEvents, nextPage, 'trending');
        }
    } else if (activeTab === 'for-you') {
        if (!isLoading.forYou && hasMore.forYou && user.isPersonalized) {
            const nextPage = pages.forYou + 1;
            setPages(prev => ({...prev, forYou: nextPage}));
            fetchEvents({ sortBy: 'relevance' }, setForYouEvents, nextPage, 'forYou');
        }
    }
  };
  
  const handleEventCreated = (newEvent: ClubEvent) => {
     getClub(newEvent.clubId).then(club => {
        const newEventWithClub = { ...newEvent, club };
        setTrendingEvents(prev => [newEventWithClub, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsEventFormOpen(false);
    });
  }

  return (
    <div className="flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                {pageTitle}
                </h1>
                <p className="text-muted-foreground">
                {pageDescription}
                </p>
            </div>
            {permissions.includes('action:create-event') && (
                <EventForm
                    onEventCreated={handleEventCreated}
                    open={isEventFormOpen}
                    onOpenChange={setIsEventFormOpen}
                >
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Event
                    </Button>
                </EventForm>
            )}
        </header>


      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <TabsList>
                <TabsTrigger value="trending"><TrendingUp className='mr-2' />Trending</TabsTrigger>
                <TabsTrigger value="for-you"><Sparkles className='mr-2' />For You</TabsTrigger>
            </TabsList>
            <div className="flex flex-col sm:flex-row gap-4">
                <Select value={priceFilter} onValueChange={(value) => setPriceFilter(value as any)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                </Select>
                <Select>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <TabsContent value="trending">
          <EventList events={trendingEvents} isLoading={isLoading.trending} hasMore={hasMore.trending} onFetchMore={handleFetchMore} />
        </TabsContent>
        <TabsContent value="for-you" className="relative">
            {!user.isPersonalized && <PersonalizationNudge />}
            <div className={cn({ 'blur-sm': !user.isPersonalized })}>
                <EventList events={forYouEvents} isLoading={isLoading.forYou} hasMore={hasMore.forYou} onFetchMore={handleFetchMore}/>
            </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}
