
"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MemberList } from "@/components/members/member-list";
import { FileManager } from "@/components/files/file-manager";
import type { Club } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Check, Star, UserPlus, Edit } from "lucide-react";
import { ClubAnnouncements } from "./club-announcements";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export function ClubDetailPage({ club }: { club: Club }) {
    const { user, role } = useAuth();
    const { toast } = useToast();
    const canManageClub = Boolean(role === 'superAdmin' || (role === 'clubManager' && user?.memberships?.some(m => m.clubId === club.id && m.role === 'officer' && m.status === 'approved')));

    const isMember = user?.memberships?.some(m => m.clubId === club.id && m.status === 'approved');
    // In a real app, this would be a proper state check against the backend
    const [joinRequestStatus, setJoinRequestStatus] = useState<'idle' | 'pending' | 'member'>(isMember ? 'member' : 'idle');

    const handleJoinClick = () => {
        setJoinRequestStatus('pending');
        toast({
            title: "Request Sent",
            description: `Your request to join ${club.name} has been sent to the club managers for approval.`,
        });
        // In a real app, this would trigger an API call to create a pending membership
    };

    const getJoinButton = () => {
        if (canManageClub) {
            return (
                <Button asChild>
                    <Link href={`/dashboard/clubs/${club.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Manage Club
                    </Link>
                </Button>
            );
        }

        switch (joinRequestStatus) {
            case 'member':
                return <Button variant="secondary" disabled><Check className="mr-2 h-4 w-4" />Joined</Button>;
            case 'pending':
                return <Button variant="outline" disabled>Request Pending</Button>;
            case 'idle':
            default:
                return <Button onClick={handleJoinClick}><UserPlus className="mr-2 h-4 w-4" />Join Club</Button>;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col md:flex-row gap-6">
                    <Image
                        src={club.logoUrl ?? '/images/default-logo.png'}
                        alt={`${club.name} logo`}
                        width={128}
                        height={128}
                        className="rounded-lg object-cover w-32 h-32"
                        data-ai-hint="logo abstract"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <CardTitle className="text-3xl font-bold">{club.name}</CardTitle>
                            {club.isFeatured && <Badge><Star className="mr-2 h-4 w-4" />Featured</Badge>}
                        </div>
                        <CardDescription className="mt-2">{club.university.name}</CardDescription>
                        <p className="mt-4 text-foreground/80">{club.description}</p>
                        <div className="mt-4 flex gap-2">
                            {getJoinButton()}
                            {role === 'superAdmin' && <Button variant="outline"><Star className="mr-2 h-4 w-4" />Feature Club</Button>}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="announcements" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="announcements">
                    <ClubAnnouncements announcements={club.announcements || []} canManage={canManageClub} />
                </TabsContent>
                <TabsContent value="info">
                    <Card>
                        <CardHeader>
                            <CardTitle>About {club.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>{club.description}</p>
                            {/* More details here */}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="members">
                    <Card>
                        <CardHeader>
                            <CardTitle>Members</CardTitle>
                            <CardDescription>Manage club members, their roles, and status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MemberList clubId={club.id} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>Manage club constitution, meeting minutes, and other files.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileManager clubId={club.id} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    );
}
