
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
import { Users, Calendar, ArrowRight, CheckSquare, Sparkles, Ticket, BarChart3, Megaphone, PlusCircle, UserPlus, Settings2, Shield, Eye } from 'lucide-react';
import { useFeature } from '@/hooks/use-feature';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useEffect, useState } from 'react';
import type { Club, Event, Ticket as TicketType } from '@/types/domain';
import { listEvents, listMyClubs, listMyTickets, getClub } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useAuth } from '@/context/auth-context';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';

const memberData = [
  { month: 'Jan', members: 186 },
  { month: 'Feb', members: 305 },
  { month: 'Mar', members: 237 },
  { month: 'Apr', members: 273 },
  { month: 'May', members: 209 },
  { month: 'Jun', members: 214 },
];

const memberChartConfig = {
  members: {
    label: 'Members',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const attendanceData = [
  { event: 'Summit', attendees: 80, tickets: 100 },
  { event: 'Bake Sale', attendees: 50, tickets: 50 },
  { event: 'Tournament', attendees: 120, tickets: 150 },
  { event: 'Cinema Night', attendees: 70, tickets: 70 },
  { event: 'Pitch Night', attendees: 40, tickets: 60 },
];

const attendanceChartConfig = {
  attendees: {
    label: 'Attendees',
    color: 'hsl(var(--primary))',
  },
  tickets: {
    label: 'Tickets Sold',
    color: 'hsl(var(--secondary))',
  }
} satisfies ChartConfig;


function ClubAdminDashboard() {
  // In a real app, this would be dynamic.
  const myClubId = "club-1";

  return (
    <div className="space-y-6">
       <Card>
          <CardHeader>
             <CardTitle className="font-headline flex items-center gap-2">
                <Shield className="size-5" />
                Admin Tools Overview
            </CardTitle>
             <CardDescription>
                Quick access to your most important administrative tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Membership Requests</CardDescription>
                    <CardTitle className="text-4xl">12</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button size="sm" className="w-full" asChild>
                       <Link href="/admin/membership-requests">Review Requests</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Pending Approvals</CardDescription>
                    <CardTitle className="text-4xl">3</CardTitle>
                </CardHeader>
                 <CardContent>
                    <Button size="sm" className="w-full" asChild>
                       <Link href="/admin/pending-approvals">View Queue</Link>
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardDescription>New Announcements</CardDescription>
                    <CardTitle className="text-4xl">5</CardTitle>
                </CardHeader>
                 <CardContent>
                    <Button size="sm" className="w-full" asChild>
                       <Link href={`/clubs/${myClubId}#announcements`}>Post Announcement</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardDescription>Upcoming Events</CardDescription>
                    <CardTitle className="text-4xl">2</CardTitle>
                </CardHeader>
                 <CardContent>
                    <Button size="sm" className="w-full" asChild>
                       <Link href="/events">Manage Events</Link>
                    </Button>
                </CardContent>
            </Card>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <BarChart3 className="size-5" />
                    Club Insights
                </CardTitle>
                <CardDescription>
                    Overview of your club's performance and member engagement.
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-8 pt-4 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-center">Member Growth (Last 6 Months)</h3>
                    <ChartContainer config={memberChartConfig} className="h-[200px] w-full">
                        <AreaChart accessibilityLayer data={memberData} margin={{ left: 12, right: 12, top: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Area
                            dataKey="members"
                            type="natural"
                            fill="var(--color-members)"
                            fillOpacity={0.4}
                            stroke="var(--color-members)"
                            stackId="a"
                        />
                        </AreaChart>
                    </ChartContainer>
                </div>
                    <div className="flex flex-col gap-4">
                    <h3 className="font-semibold text-center">Event Attendance</h3>
                    <ChartContainer config={attendanceChartConfig} className="h-[200px] w-full">
                        <BarChart accessibilityLayer data={attendanceData} margin={{ left: 12, right: 12, top: 12 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="event"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="attendees" fill="var(--color-attendees)" radius={4} />
                        <Bar dataKey="tickets" fill="var(--color-tickets)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                    </div>
                </CardContent>
            </Card>
            <Card className="lg:col-span-1">
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Sparkles className="size-5" />
                    Quick Actions
                </CardTitle>
                <CardDescription>
                    Manage your club with these shortcuts.
                </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                <Button variant="outline" asChild>
                    <Link href={`/events/new`}><PlusCircle className="mr-2" />Create Event</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={`/clubs/${myClubId}#announcements`}><Megaphone className="mr-2" />Post Announcement</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={`/clubs/${myClubId}#members`}><UserPlus className="mr-2" />Manage Members</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href={`/clubs/${myClubId}#settings`}><Settings2 className="mr-2" />Club Settings</Link>
                </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

type EventWithClub = Event & { club: Club };


export default function DashboardPage() {
  const { toast } = useToast();
  const { role } = useAuth();
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithClub[]>([]);
  const [nearestTicket, setNearestTicket] = useState<TicketType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQrCodeVisible, setIsQrCodeVisible] = useState(false);

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

        // Fetch club details for each event
        const eventsWithClubs = await Promise.all(
            eventsData.slice(0, 5).map(async (event) => {
                const club = await getClub(event.clubId);
                return { ...event, club };
            })
        );
        setUpcomingEvents(eventsWithClubs);
        
        const activeTickets = ticketsData
            .filter(t => t.status === 'issued')
            .sort((a,b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());

        setNearestTicket(activeTickets[0] || null);
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
          {role === 'Club Admin' ? 'Admin Dashboard' : 'Welcome back!'}
        </h1>
        <p className="text-muted-foreground">
          {role === 'Club Admin' 
            ? "Here's a snapshot of your club's activity."
            : "Here's a snapshot of what's happening in your community."
          }
        </p>
      </div>

      <div className="space-y-8">
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
                <Card className="lg:col-span-1 flex flex-col">
                    <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        {nearestTicket ? (
                            <div className="w-full flex flex-col items-center gap-4">
                                <div 
                                    className="relative cursor-pointer group"
                                    onClick={() => setIsQrCodeVisible(true)}
                                >
                                    <Image
                                        src={nearestTicket.qrCodeUrl}
                                        alt="Event QR Code"
                                        width={150}
                                        height={150}
                                        className={cn("rounded-lg border p-1 bg-white", {
                                            'blur-lg': !isQrCodeVisible,
                                        })}
                                        data-ai-hint="qr code"
                                    />
                                     {!isQrCodeVisible && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg text-white">
                                            <Eye className="size-6" />
                                            <span className="text-xs font-semibold mt-1">Reveal QR</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <h4 className="font-semibold">{nearestTicket.event.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        <ClientFormattedDate date={nearestTicket.event.date} options={{ dateStyle: 'medium', timeStyle: 'short' }} />
                                    </p>
                                </div>
                                <Button asChild variant="secondary" className="w-full" size="sm">
                                    <Link href={`/tickets/${nearestTicket.id}`}>View Ticket</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-4">
                                <p>You have no active tickets.</p>
                                <Button asChild variant="link">
                                    <Link href="/events">Explore Events</Link>
                                </Button>
                            </div>
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

            {role === 'Club Admin' && <ClubAdminDashboard />}
        </div>
    </div>
  );
}
