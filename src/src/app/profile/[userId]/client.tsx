

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Users, Calendar, MapPin, Building, Mail, Shield, Check } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import type { Club, Ticket, User as UserType } from '@/types/domain';
import { listUserClubs, listMyTickets, getUser } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Contribution = {
    date: string;
    count: number;
    level: number;
};

function ClubList({ clubs, isLoading }: { clubs: Club[], isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
        )
    }

    if (clubs.length === 0) {
        return <p className="text-muted-foreground">This user hasn't joined any clubs yet.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map(club => (
                <Link key={club.id} href={`/clubs/${club.id}`} className="group">
                    <Card className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 h-full">
                        <Image src={club.imageUrl} alt={club.name} width={64} height={64} className="rounded-md object-cover" data-ai-hint="club logo" />
                        <div className="flex-1">
                            <h3 className="font-semibold group-hover:text-primary">{club.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1"><Users className="size-3" /> {club.memberCount} members</p>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

function EventList({ tickets, isLoading }: { tickets: Ticket[], isLoading: boolean }) {
     if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        )
    }
    
    if (tickets.length === 0) {
        return <p className="text-muted-foreground">You have no upcoming events.</p>;
    }

    return (
        <div className="space-y-4">
            {tickets.map(ticket => (
                <Link key={ticket.id} href={`/events/${ticket.event.id}`} className="group">
                     <Card className="p-4 transition-colors hover:bg-muted/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold group-hover:text-primary">{ticket.event.name}</h3>
                                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                    <p className="flex items-center gap-2"><Calendar className="size-4" /> <ClientFormattedDate date={ticket.event.date} options={{ dateStyle: 'medium', timeStyle: 'short' }} /></p>
                                    <p className="flex items-center gap-2"><MapPin className="size-4" /> {ticket.event.location}</p>
                                </div>
                            </div>
                            <Badge variant={ticket.status === 'redeemed' ? 'secondary' : 'default'} className="capitalize">{ticket.status}</Badge>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}


export default function ProfilePageClient({ userId }: { userId: string }) {
  const { user: loggedInUser } = useAuth();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [userClubs, setUserClubs] = useState<Club[]>([]);
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState({ user: true, clubs: true, events: true });
  const [isCopied, setIsCopied] = useState(false);
  
  const isOwnProfile = loggedInUser?.id === userId;

  useEffect(() => {
    // Generate mock contribution data on the client to avoid hydration mismatch
    const generateContributions = () => {
        const data = Array.from({ length: 365 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 15),
                level: Math.floor(Math.random() * 5),
            };
        }).reverse();
        setContributions(data);
    };
    generateContributions();

    const fetchUserData = async () => {
        setIsLoading(prev => ({ ...prev, user: true }));
        try {
            const user = await getUser(userId);
            setProfileUser(user);
        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load user profile.',
            });
        } finally {
            setIsLoading(prev => ({ ...prev, user: false }));
        }
    }

    const fetchClubData = async () => {
        setIsLoading(prev => ({ ...prev, clubs: true }));
        try {
            const clubsData = await listUserClubs(userId);
            setUserClubs(clubsData);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: "Failed to load this user's clubs.",
            });
        } finally {
            setIsLoading(prev => ({ ...prev, clubs: false }));
        }
    }

    fetchUserData();
    fetchClubData();

    if (isOwnProfile) {
        const fetchEventData = async () => {
            setIsLoading(prev => ({ ...prev, events: true }));
            try {
                const ticketsData = await listMyTickets();
                setMyTickets(ticketsData.sort((a,b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime()));
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to load your events.',
                });
            } finally {
                setIsLoading(prev => ({ ...prev, events: false }));
            }
        }
        fetchEventData();
    } else {
        setIsLoading(prev => ({ ...prev, events: false }));
    }

  }, [userId, isOwnProfile, toast]);
  
  const handleCopy = () => {
    if (!profileUser?.id) return;
    navigator.clipboard.writeText(profileUser.id).then(() => {
        toast({
            title: 'Copied to clipboard!',
        });
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
        toast({
            variant: 'destructive',
            title: 'Failed to copy',
            description: 'Could not copy ID to clipboard.',
        });
    });
  }

  if (isLoading.user || !profileUser) {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/4 space-y-6">
                <Skeleton className="h-48 w-48 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
            </div>
            <div className="w-full md:w-3/4">
                 <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="w-full md:w-1/4 space-y-6">
          <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-48 w-48 border-4 border-background">
                  <AvatarImage src={profileUser.avatarUrl} alt={profileUser.name} data-ai-hint="person" />
                  <AvatarFallback className="text-5xl">{profileUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                  <p className="text-lg text-muted-foreground">@{profileUser.name.toLowerCase().replace(' ', '')}</p>
              </div>
              {isOwnProfile && (
                  <Button className="mt-4 w-full" asChild>
                      <Link href="/settings">Edit Profile</Link>
                  </Button>
              )}
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                  <Building className="size-4" />
                  <span>{profileUser.universityName}</span>
              </div>
              <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  <a href={`mailto:${profileUser.email}`} className="hover:text-primary hover:underline">{profileUser.email}</a>
              </div>
               <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{profileUser.address?.city}, {profileUser.address?.state}</span>
              </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-3/4">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clubs">Clubs</TabsTrigger>
              {isOwnProfile && <TabsTrigger value="events">Events</TabsTrigger>}
            </TabsList>
            <TabsContent value="overview">
              <Card>
                  <CardHeader>
                      <CardTitle>Contribution Graph</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="flex flex-wrap gap-1">
                          {contributions.map(({ date, count, level }) => (
                              <div
                                  key={date}
                                  className="h-3 w-3 rounded-sm bg-muted"
                                  style={{ backgroundColor: level > 0 ? `hsl(var(--primary) / ${level * 0.25})` : undefined }}
                                  title={`${count} contributions on ${date}`}
                              />
                          ))}
                      </div>
                  </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="clubs">
               <Card>
                  <CardHeader>
                      <CardTitle>Clubs</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <ClubList clubs={userClubs} isLoading={isLoading.clubs} />
                  </CardContent>
              </Card>
            </TabsContent>
             {isOwnProfile && (
              <TabsContent value="events">
                  <Card>
                      <CardHeader>
                          <CardTitle>My Events</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <EventList tickets={myTickets} isLoading={isLoading.events} />
                      </CardContent>
                  </Card>
              </TabsContent>
             )}
          </Tabs>
        </div>
      </div>
      {isOwnProfile && (
          <div className="fixed bottom-4 right-4 z-50">
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-full bg-background/80 px-3 py-1.5 h-auto text-xs text-muted-foreground shadow-lg backdrop-blur-sm border hover:bg-muted"
                >
                  {isCopied ? (
                      <Check className="size-4 text-green-500" />
                  ) : (
                      <Shield className="size-4 text-primary" />
                  )}
                  <span className={cn("font-mono transition-all", isCopied ? "w-0 opacity-0 ml-0" : "w-auto opacity-100 ml-2")}>{profileUser.id}</span>
              </Button>
          </div>
      )}
    </>
  );
}
