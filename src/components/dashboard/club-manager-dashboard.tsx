
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, CalendarPlus, DollarSign, FileText, Check, X, Calendar, Ticket, FileUp, Edit } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useMemo } from "react";
import { User, Club, ClubEvent, ApprovalRequest } from '@elmo/shared-types';
import { mockUsers, clubs, events, approvalRequests as mockApprovalRequests } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export function ClubManagerDashboard() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [allUsers] = useState<User[]>(mockUsers);
    const [allClubs] = useState<Club[]>(clubs);
    const [allEvents] = useState<ClubEvent[]>(events);
    const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(mockApprovalRequests);

    const managedClubId = useMemo(() => user?.memberships?.find(m => m.role === 'officer')?.clubId || null, [user]);
    const managedClub = useMemo(() => allClubs.find(c => c.id === managedClubId), [allClubs, managedClubId]);

    // Memoized KPIs
    const { activeMembersCount, pendingMembers, upcomingEventsCount } = useMemo(() => {
        if (!managedClubId) return { activeMembersCount: 0, pendingMembers: [], upcomingEventsCount: 0 };

        const members = allUsers.filter(u => u.memberships?.some(m => m.clubId === managedClubId && m.status === 'approved'));

        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const clubEvents = allEvents.filter(e => e.clubId === managedClubId && new Date(e.start) > new Date() && new Date(e.start) < sevenDaysFromNow);

        const clubRequests = approvalRequests.filter(req => req.clubId === managedClubId);

        const pending = clubRequests.filter(req => req.type === 'membership' && req.status === 'pending')
            .map(req => {
                const userData = allUsers.find(u => u.id === req.userId);
                return { ...req, user: userData };
            }).filter(item => item.user);


        return {
            activeMembersCount: members.length,
            pendingMembers: pending as (ApprovalRequest & { user: User })[],
            upcomingEventsCount: clubEvents.length,
        };
    }, [allUsers, allEvents, approvalRequests, managedClubId]);

    // State for pending members to allow for optimistic UI updates.
    const [pendingMembersState, setPendingMembersState] = useState(pendingMembers);
    useEffect(() => setPendingMembersState(pendingMembers), [pendingMembers]);


    const handleApprovalAction = (requestId: string, userName: string, action: 'approved' | 'rejected') => {
        setPendingMembersState(prev => prev.filter(m => m.id !== requestId));
        toast({
            title: `Member request ${action}`,
            description: `${userName}'s request to join has been ${action}.`,
        });
        // In a real app, this would also update the user's membership status in firestore.
        console.log(`Request ${requestId} ${action}d for club ${managedClubId}`);
    }

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!managedClubId || !managedClub) {
        return (
            <div>
                <h1 className="text-3xl font-bold">Club Manager Dashboard</h1>
                <p className="text-muted-foreground mt-4">You are not currently managing any clubs.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard for {managedClub.name}</h1>
                <p className="text-muted-foreground">Here's what's happening with your club.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeMembersCount}</div>
                        <p className="text-xs text-muted-foreground">Total members in the club</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Joins</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingMembersState.length}</div>
                        <p className="text-xs text-muted-foreground">New member requests to review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Events (7d)</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingEventsCount}</div>
                        <p className="text-xs text-muted-foreground">Events happening this week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Event RSVPs</CardTitle>
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">48 / 60</div>
                        <p className="text-xs text-muted-foreground">For "Fall Kick-off BBQ"</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <main className="lg:col-span-2 space-y-8">
                    {/* Action Queues */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Action Queues</CardTitle>
                            <CardDescription>Tasks that require your attention.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="members">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="members">
                                        Membership Approvals <Badge variant="secondary" className="ml-2">{pendingMembersState.length}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="events">Events</TabsTrigger>
                                    <TabsTrigger value="payments">Payments</TabsTrigger>
                                    <TabsTrigger value="requests">Requests</TabsTrigger>
                                </TabsList>
                                <TabsContent value="members" className="pt-4">
                                    {pendingMembersState.length > 0 ? (
                                        <div className="space-y-4">
                                            {pendingMembersState.map(req => (
                                                <div key={req.id} className="flex items-center space-x-4">
                                                    <Avatar>
                                                        <AvatarImage src={(req as any).user.photoUrl} />
                                                        <AvatarFallback>{(req as any).user.name.display.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{(req as any).user.name.display}</p>
                                                        <p className="text-xs text-muted-foreground">{(req as any).user.email}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleApprovalAction(req.id, (req as any).user.name.display, 'rejected')}><X className="h-4 w-4" /></Button>
                                                        <Button size="sm" onClick={() => handleApprovalAction(req.id, (req as any).user.name.display, 'approved')}><Check className="h-4 w-4" /></Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <p className="font-semibold">No pending members!</p>
                                            <p className="text-sm">The membership approval queue is empty.</p>
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="events" className="pt-4">
                                    <div className="text-center py-10 text-muted-foreground">
                                        <p className="font-semibold">No events need approval.</p>
                                        <p className="text-sm">Drafts and pending events will appear here.</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </main>

                <aside className="lg:col-span-1 space-y-8">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Button asChild variant="outline"><Link href="/dashboard/events/new"><CalendarPlus />Create Event</Link></Button>
                            <Button asChild variant="outline"><Link href={`/dashboard/clubs/${managedClubId}/edit`}><Edit />Edit Club Page</Link></Button>
                            <Button asChild variant="outline"><Link href={`/dashboard/clubs/${managedClubId}`}><FileUp />Upload File</Link></Button>
                            <Button asChild variant="outline"><Link href="/dashboard/finance/request"><DollarSign />Request Budget</Link></Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}


function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/4" /></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <main className="lg:col-span-2">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                        <CardContent>
                            <div className="flex gap-2 border-b pb-2"><Skeleton className="h-8 w-1/4" /><Skeleton className="h-8 w-1/4" /></div>
                            <div className="pt-4 space-y-4">
                                <div className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div><Skeleton className="h-8 w-20" /></div>
                                <div className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div><Skeleton className="h-8 w-20" /></div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
                <aside className="lg:col-span-1">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    )
}


