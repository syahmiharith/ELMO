
'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Megaphone,
  Calendar,
  FileText,
  Info,
  ArrowLeft,
  UserPlus,
  LogOut,
  Image as ImageIcon,
  Settings,
  Film,
  Star,
  MoreHorizontal,
  Loader2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';
import type { Club, Event as ClubEvent, Membership } from '@/types/domain';
import { getClub, listClubEvents, requestMembership, leaveClub, listMyMemberships, cancelMembershipRequest } from '@/lib/api';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { cn } from '@/lib/utils';

export default function ClubDetailsClient({
  clubId,
}: {
  clubId: string;
}) {
  const { toast } = useToast();
  const { permissions, role } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isMembershipLoading, setIsMembershipLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchClubAndEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clubData, eventsData] = await Promise.all([
        getClub(clubId),
        listClubEvents(clubId),
      ]);
      setClub(clubData);
      setEvents(eventsData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load club details.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [clubId, toast]);

  const fetchMembershipStatus = useCallback(async () => {
    setIsMembershipLoading(true);
    try {
      const myMembershipsData = await listMyMemberships();
      const currentMembership = myMembershipsData.find(m => m.clubId === clubId);
      setMembership(currentMembership || null);
    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load membership status.',
        });
    } finally {
        setIsMembershipLoading(false);
    }
  }, [clubId, toast]);


  useEffect(() => {
    fetchClubAndEvents();
    fetchMembershipStatus();
  }, [clubId, fetchClubAndEvents, fetchMembershipStatus]);

  const handleMembershipAction = async (action: 'request' | 'leave' | 'cancel') => {
    if (!club) return;
    setIsActionLoading(true);
    try {
      if (action === 'request') {
        await requestMembership(club.id);
        toast({
          title: 'Request Sent',
          description: `Your request to join ${club.name} has been sent.`,
        });
      } else if (action === 'leave') {
        await leaveClub(club.id);
        toast({
          title: 'Left Club',
          description: `You have left ${club.name}.`,
        });
      } else if (action === 'cancel') {
        await cancelMembershipRequest(club.id);
        toast({
            title: 'Request Cancelled',
            description: `Your request to join ${club.name} has been cancelled.`,
        });
      }
      // Refetch membership status after any action
      await fetchMembershipStatus();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${action} membership. Please try again.`,
      });
    } finally {
        setIsActionLoading(false);
    }
  };

  const renderMembershipButton = () => {
    if (isMembershipLoading || isActionLoading) {
      return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</Button>
    }

    if (membership?.status === 'approved') {
        return (
            <Button variant="secondary" onClick={() => handleMembershipAction('leave')}>
                <LogOut className="mr-2 h-4 w-4" />
                Joined
            </Button>
        );
    }

    if (membership?.status === 'pending') {
        return (
            <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Request Pending
            </Button>
        );
    }
    
    if (permissions.includes('action:request-membership')) {
        return (
            <Button onClick={() => handleMembershipAction('request')}>
                <UserPlus className="mr-2 h-4 w-4" />
                Join Group
            </Button>
        );
    }

    return null;
  }

  if (isLoading || !club) {
    return <div>Loading...</div>; // TODO: Add Skeleton loader
  }
  
  const showAboutColumn = activeTab === 'featured' || activeTab === 'announcements';
  const isMember = membership?.status === 'approved';
  const isPending = membership?.status === 'pending';
  const isClubAdmin = role === 'Club Admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/clubs"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Club Directory
        </Link>

        {/* Cover Image */}
        <Card className="overflow-hidden">
          <div className="relative w-full h-64 bg-muted">
              <Image
              src="https://placehold.co/1200x400.png"
              alt={`${club.name} cover photo`}
              fill
              className="object-cover"
              data-ai-hint="group event"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 right-4">
                  {isClubAdmin && (
                    <Button variant="secondary" size="sm">
                        <ImageIcon className="mr-2" />
                        Edit Cover Photo
                    </Button>
                  )}
              </div>
          </div>

          {/* Club Info Header */}
          <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                      <h1 className="text-4xl font-bold font-headline tracking-tight">
                          {club.name}
                      </h1>
                      <div className="mt-2 flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>Public Group</span>
                          </div>
                          <span className="font-bold">·</span>
                          <span>{club.memberCount} members</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-2">
                     {renderMembershipButton()}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Group Settings</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           {isMember && (
                            <DropdownMenuItem onSelect={() => handleMembershipAction('leave')}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Leave Club</span>
                            </DropdownMenuItem>
                           )}
                           {isPending && (
                             <DropdownMenuItem onSelect={() => handleMembershipAction('cancel')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Cancel Request</span>
                            </DropdownMenuItem>
                           )}
                           <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Manage Settings</span>
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
              </div>
          </div>

          {/* Tabs Nav */}
          <Tabs defaultValue="featured" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="p-2 h-auto rounded-none w-full justify-start border-b">
                <TabsTrigger value="featured"><Star className="mr-2" />Featured</TabsTrigger>
                <TabsTrigger value="announcements"><Megaphone className="mr-2" />Announcements</TabsTrigger>
                <TabsTrigger value="events"><Calendar className="mr-2" />Events</TabsTrigger>
                <TabsTrigger value="members"><Users className="mr-2" />Members</TabsTrigger>
                <TabsTrigger value="media"><Film className="mr-2" />Media</TabsTrigger>
                <TabsTrigger value="files"><FileText className="mr-2" />Files</TabsTrigger>
            </TabsList>

            <div className="p-6 bg-transparent shadow-none border-none">
              <div className={cn(
                  "grid grid-cols-1 gap-8",
                  showAboutColumn && "md:grid-cols-3"
              )}>
                <div className={cn(showAboutColumn ? "md:col-span-2" : "md:col-span-3")}>
                  <TabsContent value="featured" className="m-0">
                    <Card>
                        <CardHeader>
                        <CardTitle>Featured Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p>Featured content for the club will be displayed here. This could be pinned posts, important updates, or welcome messages.</p>
                        </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="announcements" className="m-0">
                    <Card>
                        <CardHeader>
                        <CardTitle>Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p>Club announcements will be listed here.</p>
                        </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="events" className="m-0">
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                           <Link href={`/events/${event.id}`} key={event.id} className="group block">
                            <Card className="transition-all group-hover:shadow-lg group-hover:-translate-y-1">
                                <CardHeader className="p-0">
                                <Image
                                    src={event.imageUrl}
                                    alt={event.name}
                                    width={400}
                                    height={200}
                                    className="rounded-t-lg object-cover aspect-video"
                                    data-ai-hint="event photo"
                                />
                                </CardHeader>
                                <CardContent className="p-4">
                                <CardTitle className="font-headline text-base group-hover:text-primary">{event.name}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    <ClientFormattedDate date={event.date} options={{ dateStyle: 'medium', timeStyle: 'short' }} />
                                </p>
                                </CardContent>
                            </Card>
                          </Link>
                        ))}
                        {events.length === 0 && (
                            <p className="text-muted-foreground col-span-full">No upcoming events.</p>
                        )}
                    </div>
                  </TabsContent>

                  <TabsContent value="members" className="m-0">
                    <Card>
                        <CardHeader>
                        <CardTitle>Club Members</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p>A list of club members will be displayed here.</p>
                        </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="media" className="m-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Media Gallery</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="aspect-square bg-muted rounded-lg">
                              <Image
                                src={`https://placehold.co/400x400.png`}
                                alt={`Club media ${index + 1}`}
                                width={400}
                                height={400}
                                className="rounded-lg object-cover w-full h-full"
                                data-ai-hint="club media"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="files" className="m-0">
                    <Card>
                        <CardHeader>
                        <CardTitle>Files & Resources</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p>Read-only access to club documents and files.</p>
                        </CardContent>
                    </Card>
                  </TabsContent>
                </div>
                
                {showAboutColumn && (
                  <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Info className="size-5" />About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            {club.description}
                        </p>
                        <p>
                            Established in 2020, we aim to bring together students passionate about technology and innovation.
                        </p>
                        </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
