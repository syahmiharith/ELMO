
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
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
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
  ShieldCheck,
  BarChart2,
  Upload,
  Download,
  File as FileIcon,
  Lock,
  ArrowRight,
  PlusCircle,
  DollarSign,
  Check,
  MoreVertical,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback, useMemo } from 'react';
import type { Club, Event as ClubEvent, Membership, ClubFile, Announcement, ClubMember, Club as ClubType, CreateAnnouncementPayload } from '@/types/domain';
import { getClub, listClubEvents, requestMembership, leaveClub, listMyMemberships, cancelMembershipRequest, listClubFiles, listClubMembers, createEvent, createAnnouncement } from '@/lib/api';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';
import { EventForm } from '@/components/event-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { handleImageUpload } from '../actions';


const announcementSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters.'),
    content: z.string().min(10, 'Content must be at least 10 characters.'),
});

function CoverPhotoDialog({ club, onImageUploaded }: { club: Club, onImageUploaded: (newUrl: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!selectedFile || !preview) return;

        setIsLoading(true);
        try {
            const result = await handleImageUpload({ photoDataUri: preview });
            if (result.success && result.data?.imageUrl) {
                onImageUploaded(result.data.imageUrl);
                toast({
                    title: 'Cover Photo Updated!',
                    description: 'Your new cover photo is now live.',
                });
                setIsOpen(false);
                setPreview(null);
                setSelectedFile(null);
            } else {
                throw new Error(result.error || 'Failed to upload image.');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update cover photo. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm">
                    <ImageIcon className="mr-2" />
                    Edit Cover Photo
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Cover Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative w-full h-48 bg-muted rounded-md flex items-center justify-center">
                        {preview ? (
                            <Image src={preview} alt="Cover photo preview" fill className="object-cover rounded-md" />
                        ) : (
                            <ImageIcon className="size-12 text-muted-foreground" />
                        )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleFileChange} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isLoading || !selectedFile}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


function AnnouncementForm({ club, onAnnouncementCreated }: { club: Club, onAnnouncementCreated: (announcement: Announcement) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();
    
    const form = useForm<z.infer<typeof announcementSchema>>({
        resolver: zodResolver(announcementSchema),
        defaultValues: { title: '', content: '' },
    });

    const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
        setIsLoading(true);
        try {
            const payload: CreateAnnouncementPayload = { ...values, author: { id: user.id, name: user.name, avatarUrl: user.avatarUrl } };
            const newAnnouncement = await createAnnouncement(club.id, payload);
            onAnnouncementCreated(newAnnouncement);
            toast({
                title: 'Announcement Posted!',
                description: 'Your announcement is now live for club members to see.',
            });
            setIsOpen(false);
            form.reset();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to post announcement. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2"/>New Announcement</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Announcement</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Weekly Meeting" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Let everyone know the details..." className="min-h-[120px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : null}
                                Post
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}


const memberData = [
  { month: 'Jan', members: 10 },
  { month: 'Feb', members: 15 },
  { month: 'Mar', members: 25 },
  { month: 'Apr', members: 40 },
  { month: 'May', members: 35 },
  { month: 'Jun', members: 50 },
];

const memberChartConfig = {
  members: {
    label: 'New Members',
    color: 'hsl(var(--primary))',
  },
} as const;

type EventWithClub = ClubEvent & { club: ClubType };

function FileList({ files, isClubAdmin }: { files: ClubFile[], isClubAdmin: boolean }) {
    if (files.length === 0) {
        return <p className="text-muted-foreground">No files have been shared in this club yet.</p>;
    }
    return (
        <div className="space-y-4">
            {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <FileIcon className="size-6 text-primary" />
                        <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                                Uploaded on <ClientFormattedDate date={file.uploadedAt} options={{ dateStyle: 'medium' }} />
                                {file.permission === 'admin_only' && (
                                    <span className="ml-2 inline-flex items-center text-xs font-semibold text-orange-600">
                                        <Lock className="size-3 mr-1" />
                                        Admin only
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2" />
                        Download
                    </Button>
                </div>
            ))}
        </div>
    );
}

function AnnouncementList({ announcements }: { announcements: Announcement[] }) {
    if (announcements.length === 0) {
        return <p className="text-muted-foreground">No announcements yet.</p>;
    }
    return (
        <div className="space-y-6">
            {announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-4">
                     <Avatar>
                        <AvatarImage src={announcement.author.avatarUrl} alt={announcement.author.name} data-ai-hint="person" />
                        <AvatarFallback>{announcement.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{announcement.author.name}</p>
                            <p className="text-sm text-muted-foreground">
                                <ClientFormattedDate date={announcement.createdAt} options={{ dateStyle: 'medium' }} />
                            </p>
                        </div>
                        <h3 className="text-lg font-semibold mt-1">{announcement.title}</h3>
                        <p className="mt-1 text-muted-foreground">{announcement.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MemberList({ members, isClubAdmin }: { members: ClubMember[]; isClubAdmin: boolean }) {
    if (members.length === 0) {
        return <p className="text-muted-foreground">This club has no members yet.</p>;
    }
    return (
      <ul className="divide-y">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={m.avatarUrl} alt={m.name} data-ai-hint="person" />
                    <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <span className="font-medium truncate">{m.name}</span>
                    {m.role !== 'Member' && (
                        <Badge variant="secondary" className="ml-2">{m.role}</Badge>
                    )}
                </div>
            </div>
            {isClubAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Actions for ${m.name}`}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${m.id}`}>View profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Promote to admin</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Remove from club</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </li>
        ))}
      </ul>
    );
}


export default function ClubDetailsClient({
  clubId,
}: {
  clubId: string;
}) {
  const { toast } = useToast();
  const { permissions, role } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [events, setEvents] = useState<EventWithClub[]>([]);
  const [files, setFiles] = useState<ClubFile[]>([]);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isMembershipLoading, setIsMembershipLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);


  const fetchClubData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clubData, eventsData, filesData, membersData] = await Promise.all([
        getClub(clubId),
        listClubEvents(clubId),
        listClubFiles(clubId),
        listClubMembers(clubId),
      ]);
      setClub(clubData);
      const eventsWithClubs = await Promise.all(eventsData.map(async e => ({...e, club: await getClub(e.clubId)})));
      setEvents(eventsWithClubs.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setFiles(filesData);
      setMembers(membersData);
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

  const { upcomingEvent, otherEvents } = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.date) >= now);
    const past = events.filter(e => new Date(e.date) < now);
    return { upcomingEvent: upcoming[0] || null, otherEvents: [...upcoming.slice(1), ...past] };
  }, [events]);

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
    fetchClubData();
    fetchMembershipStatus();
  }, [clubId, fetchClubData, fetchMembershipStatus]);

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
      // Refetch club data to update member count
      fetchClubData();
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

  const handleEventCreated = async (newEvent: ClubEvent) => {
    if (!club) return;
    const clubForEvent = await getClub(newEvent.clubId);
    setEvents(prev => [...prev, {...newEvent, club: clubForEvent}].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsEventFormOpen(false);
  }

  const handleAnnouncementCreated = (newAnnouncement: Announcement) => {
    setClub(prevClub => {
        if (!prevClub) return null;
        return {
            ...prevClub,
            announcements: [newAnnouncement, ...(prevClub.announcements || [])]
        };
    });
  }

  const handleImageUploaded = (newUrl: string) => {
      setClub(prevClub => {
        if (!prevClub) return null;
        return { ...prevClub, imageUrl: newUrl };
      });
  }

  const renderMembershipButton = () => {
    if (isMembershipLoading || isActionLoading || !club) {
      return <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</Button>
    }

    if (membership?.status === 'approved') {
        if (club.membershipType === 'invite-only') {
             return (
                <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Invite
                </Button>
            );
        }
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
    
    if (club.membershipType === 'open' && permissions.includes('action:request-membership')) {
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
  
  const isMember = membership?.status === 'approved';
  const isPending = membership?.status === 'pending';
  const isClubAdmin = role === 'Club Admin';
  const showAdminTabs = isClubAdmin && isMember;
  const showAboutColumn = (
    activeTab === 'featured' || 
    activeTab === 'announcements' ||
    (isClubAdmin && (activeTab === 'featured' || activeTab === 'announcements' || activeTab === 'settings'))
  );

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
              src={club.imageUrl}
              alt={`${club.name} cover photo`}
              fill
              className="object-cover"
              data-ai-hint="group event"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 right-4">
                  {showAdminTabs && <CoverPhotoDialog club={club} onImageUploaded={handleImageUploaded} />}
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
                              <span>{club.membershipType === 'invite-only' ? 'Invite-only' : 'Public'} Group</span>
                          </div>
                          <span className="font-bold">·</span>
                          <span>{members.length} members</span>
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
                           {!isMember && isPending && (
                             <DropdownMenuItem onSelect={() => handleMembershipAction('cancel')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Cancel Request</span>
                            </DropdownMenuItem>
                           )}
                           {showAdminTabs && (
                            <DropdownMenuItem onSelect={() => setActiveTab('settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                           )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
              </div>
          </div>

          {/* Tabs Nav */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="p-2 h-auto rounded-none w-full justify-start border-b">
                {showAdminTabs && <TabsTrigger value="overview"><BarChart2 className="mr-2"/>Overview</TabsTrigger>}
                <TabsTrigger value="featured"><Star className="mr-2" />Featured</TabsTrigger>
                <TabsTrigger value="announcements"><Megaphone className="mr-2" />Announcements</TabsTrigger>
                <TabsTrigger value="events"><Calendar className="mr-2" />Events</TabsTrigger>
                {isMember && <TabsTrigger value="files"><FileText className="mr-2" />Files</TabsTrigger>}
                <TabsTrigger value="members"><Users className="mr-2" />Members</TabsTrigger>
                {/* The Settings TabTrigger is hidden but can be activated via the dropdown */}
                <TabsTrigger value="settings" className="hidden">Settings</TabsTrigger>
            </TabsList>

            <div className={cn("bg-transparent shadow-none border-none p-6")}>
              <div className={cn(
                  "grid grid-cols-1 gap-8",
                  showAboutColumn && "md:grid-cols-3"
              )}>
                <div className={cn(showAboutColumn ? "md:col-span-2" : "md:col-span-3")}>
                   <TabsContent value="overview" className="m-0">
                      <Card>
                          <CardHeader>
                              <CardTitle>Club Overview</CardTitle>
                              <CardDescription>At-a-glance view of your club's activity.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <div className="grid gap-6 sm:grid-cols-2">
                                  <Card>
                                      <CardHeader>
                                          <CardTitle>Pending Members</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                          <p className="text-4xl font-bold">12</p>
                                          <Button size="sm" className="mt-2">Review Requests</Button>
                                      </CardContent>
                                  </Card>
                                   <div className="flex flex-col gap-4">
                                    <h3 className="font-semibold text-center text-sm">New Member Growth</h3>
                                      <ChartContainer config={memberChartConfig} className="h-[150px] w-full">
                                        <BarChart accessibilityLayer data={memberData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                          <CartesianGrid vertical={false} />
                                          <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => value.slice(0, 3)}
                                          />
                                          <ChartTooltip content={<ChartTooltipContent />} />
                                          <Bar dataKey="members" fill="var(--color-members)" radius={4} />
                                        </BarChart>
                                      </ChartContainer>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                    </TabsContent>
                  <TabsContent value="featured" className="m-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>{club.featuredContent?.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-stone dark:prose-invert max-w-none">
                            <p>{club.featuredContent?.content}</p>
                             <div className="not-prose mt-6 flex justify-end">
                                {showAdminTabs && <Button variant="secondary">Change Featured Content</Button>}
                            </div>
                        </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="announcements" className="m-0">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div>
                                <CardTitle>Announcements</CardTitle>
                                <CardDescription>Updates and important information for club members.</CardDescription>
                            </div>
                            {showAdminTabs && <AnnouncementForm club={club} onAnnouncementCreated={handleAnnouncementCreated} />}
                        </CardHeader>
                        <CardContent>
                            <AnnouncementList announcements={club.announcements || []} />
                        </CardContent>
                    </Card>
                  </TabsContent>

                   <TabsContent value="files" className="m-0">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Shared Files</CardTitle>
                            <CardDescription>Documents and resources for club members.</CardDescription>
                        </div>
                        {showAdminTabs && (
                            <Button><Upload className="mr-2"/>Upload File</Button>
                        )}
                      </CardHeader>
                      <CardContent>
                        <FileList files={files} isClubAdmin={isClubAdmin} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="events" className="m-0">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Upcoming Events</CardTitle>
                            <CardDescription>Upcoming and past events hosted by the club.</CardDescription>
                          </div>
                          {showAdminTabs && (
                            <EventForm
                                clubId={club.id}
                                onEventCreated={handleEventCreated}
                                open={isEventFormOpen}
                                onOpenChange={setIsEventFormOpen}
                            >
                                <Button>
                                    <PlusCircle className="mr-2" />
                                    Create Event
                                </Button>
                            </EventForm>
                          )}
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {events.length > 0 ? (
                             <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                                {events.map((event) => {
                                    const isAttending = event.viewerRsvpStatus === 'attending';
                                    const canRsvp = permissions.includes('action:rsvp');
                                    return (
                                        <Link href={`/events/${event.id}`} key={event.id} className="group block h-full">
                                            <Card className={cn(
                                                'flex flex-col transition-all h-full',
                                                'bg-transparent shadow-none border-none',
                                                'group-hover:bg-card group-hover:shadow-lg group-hover:-translate-y-1'
                                            )}>
                                                <CardHeader className="p-0 relative">
                                                    <div className="relative aspect-video w-full bg-muted/50 rounded-t-lg flex items-center justify-center">
                                                        <Logo className="w-24 text-muted-foreground/20" />
                                                        <Image
                                                            src={event.imageUrl}
                                                            alt={event.name}
                                                            fill
                                                            className="absolute inset-0 w-full h-full rounded-t-lg object-cover"
                                                            data-ai-hint="event photo"
                                                        />
                                                    </div>
                                                    {isAttending && canRsvp && (
                                                        <Badge className="absolute top-2 right-2">
                                                            <Check className="mr-1 h-3 w-3" /> Attending
                                                        </Badge>
                                                    )}
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
                        ) : (
                             <p className="text-muted-foreground text-center py-8">This club has not hosted any events yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="members" className="m-0">
                    <Card>
                        <CardHeader>
                        <CardTitle>Club Members ({members.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MemberList members={members} isClubAdmin={isClubAdmin} />
                        </CardContent>
                    </Card>
                  </TabsContent>

                   <TabsContent value="settings" className="m-0">
                    <Card>
                        <CardHeader>
                        <CardTitle>Club Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p>Club settings form will go here. Admins can edit club details, visibility, etc.</p>
                        </CardContent>
                    </Card>
                  </TabsContent>
                </div>
                
                {showAboutColumn && (
                  <div className="md:col-span-1 space-y-6">
                    <div className="sticky top-6">
                        <Card>
                            <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Info className="size-5" />About</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                {club.description}
                            </p>
                            </CardContent>
                        </Card>
                    </div>
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
