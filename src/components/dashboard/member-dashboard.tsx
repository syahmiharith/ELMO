
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Calendar, Sparkles, UserCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ClubCard } from "../clubs/club-card";
import { format } from "date-fns";
import type { Club, ClubEvent } from "@/lib/types";
import { clubs as mockClubs, events as mockEvents } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberDashboard() {
    const { user } = useAuth();
    const [loading] = useState(false);
    const [clubs] = useState<Club[]>(mockClubs);
    const [events] = useState<ClubEvent[]>(mockEvents);

    const myClubIds = useMemo(() => new Set(user?.memberships?.map(m => m.clubId) || []), [user]);
    const myClubs = useMemo(() => clubs.filter(c => myClubIds.has(c.id)), [myClubIds, clubs]);

    const recommendedClubs = useMemo(() => {
        const userInterests = new Set(user?.interests || []);
        const recommended = clubs.filter(club => {
            if (myClubIds.has(club.id)) return false; // Not a member
            if (userInterests.size === 0) return true; // No interests, recommend anything
            return club.interestTags?.some(tag => userInterests.has(tag)); // Match interests
        });
        return recommended.slice(0, 10);
    }, [user, myClubIds, clubs]);

    const upcomingEvents = useMemo(() => {
        const now = new Date();
        return events
            .filter(event => myClubIds.has(event.clubId) && new Date(event.start) >= now)
            .sort((a, b) => a.start - b.start)
            .slice(0, 5);
    }, [myClubIds, events]);

    const latestAnnouncements = useMemo(() => {
        return clubs
            .filter(club => myClubIds.has(club.id))
            .flatMap(club => club.announcements?.map(a => ({ ...a, clubName: club.name })) || [])
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
    }, [myClubIds, clubs]);


    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-1/2" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <main className="lg:col-span-2 space-y-8">
                        <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent><Skeleton className="h-24" /></CardContent></Card>
                        <Card><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent><Skeleton className="h-48" /></CardContent></Card>
                    </main>
                    <aside className="lg:col-span-1 space-y-8">
                        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-32" /></CardContent></Card>
                    </aside>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome back, {user?.name.display.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Here's your personal dashboard and what's happening in your clubs.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <main className="lg:col-span-2 space-y-8">
                    {myClubs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>My Clubs</CardTitle>
                                <CardDescription>Clubs you are a member of.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                {myClubs.map(club => (
                                    <Card key={club.id} className="overflow-hidden">
                                        <div className="flex items-start p-4">
                                            <Image src={club.logoUrl!} alt={`${club.name} logo`} width={60} height={60} className="rounded-md mr-4" data-ai-hint="logo abstract" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{club.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{club.description}</p>
                                            </div>
                                        </div>
                                        <CardContent className="p-4 bg-muted/50">
                                            <Link href={`/dashboard/clubs/${club.id}`} passHref>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    View Club <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {recommendedClubs.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="text-primary" />
                                    Recommended For You
                                </CardTitle>
                                <CardDescription>Based on your interests, you might like these clubs.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Carousel opts={{ align: "start", loop: false }}>
                                    <CarouselContent className="-ml-4">
                                        {recommendedClubs.map(club => (
                                            <CarouselItem key={club.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/2">
                                                <div className="h-full">
                                                    <ClubCard club={club} />
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="ml-12" />
                                    <CarouselNext className="mr-12" />
                                </Carousel>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Latest Announcements</CardTitle>
                            <CardDescription>Recent updates from your clubs.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {latestAnnouncements.length > 0 ? latestAnnouncements.map((ann) => (
                                <div key={ann.id} className="flex items-start gap-3">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary">
                                        <UserCircle className="h-5 w-5 text-secondary-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">{ann.clubName}</span> &middot; {format(new Date(ann.date), "MMM d")}
                                        </p>
                                        <p className="font-medium text-foreground/90">{ann.title}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>No new announcements from your clubs.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </main>
                <aside className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Events</CardTitle>
                            <CardDescription>What's next on your calendar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingEvents.length > 0 ? upcomingEvents.map(event => {
                                const club = clubs.find(c => c.id === event.clubId);
                                return (
                                    <div key={event.id} className="flex items-start space-x-4">
                                        <div className="flex flex-col items-center w-12 text-center">
                                            <span className="text-xs font-semibold text-primary uppercase">{format(new Date(event.start), "MMM")}</span>
                                            <span className="text-2xl font-bold">{format(new Date(event.start), "d")}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold leading-tight">{event.name}</h4>
                                            <p className="text-sm text-muted-foreground flex items-center"><Building2 className="w-3 h-3 mr-1.5" /> {club?.name}</p>
                                            <Button variant="link" size="sm" className="p-0 h-auto" asChild>
                                                <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>No upcoming events from your clubs.</p>
                                    <Button variant="link" asChild><Link href="/dashboard/events">Find Events</Link></Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col justify-center items-center text-center p-6">
                        <CardHeader>
                            <CardTitle>Discover More</CardTitle>
                            <CardDescription>Find a new community or your next favorite event.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 w-full">
                            <Button asChild className="w-full">
                                <Link href="/dashboard/clubs">Find Clubs</Link>
                            </Button>
                            <Button asChild variant="secondary" className="w-full">
                                <Link href="/dashboard/events">Find Events</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}
