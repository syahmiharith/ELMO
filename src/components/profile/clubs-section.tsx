
"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clubs } from "@/lib/mock-data";
import { Membership } from '@elmo/shared-types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, MoreVertical, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClubsSectionProps {
    memberships: Membership[];
}

export function ClubsSection({ memberships }: ClubsSectionProps) {
    const { toast } = useToast();

    const handleLeaveClub = (clubName: string) => {
        toast({
            variant: "destructive",
            title: "Action Required",
            description: `Are you sure you want to leave ${clubName}? This action cannot be undone.`,
            // In a real app, this action would trigger a confirmation dialog and then an API call.
        })
    }

    const memberClubs = memberships.map(mem => {
        const club = clubs.find(c => c.id === mem.clubId);
        return { ...mem, club };
    }).filter(item => item.club);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Clubs</CardTitle>
                <CardDescription>
                    A list of all clubs you are a member of.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {memberClubs.length > 0 ? (
                    memberClubs.map(({ club, role, duesStatus }) =>
                        club ? (
                            <div key={club.id} className="flex items-center space-x-4">
                                <Avatar className="rounded-md">
                                    <AvatarImage src={club.logoUrl} alt={club.name} />
                                    <AvatarFallback>{club.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Link href={`/dashboard/clubs/${club.id}`} className="font-semibold hover:underline">{club.name}</Link>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="capitalize">{role}</span>
                                        &middot;
                                        <span>Dues: <Badge variant={duesStatus === 'paid' ? "default" : "destructive"} className="capitalize text-xs px-1.5 py-0">{duesStatus}</Badge></span>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open club menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/dashboard/clubs/${club.id}`}>
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Details
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="w-full">
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                            onClick={() => handleLeaveClub(club.name)}
                                                            disabled={role === 'owner'}
                                                            onSelect={(e) => e.preventDefault()}
                                                        >
                                                            <LogOut className="mr-2 h-4 w-4" />
                                                            Leave Club
                                                        </DropdownMenuItem>
                                                    </div>
                                                </TooltipTrigger>
                                                {role === 'owner' && (
                                                    <TooltipContent>
                                                        <p>You must transfer ownership before leaving the club.</p>
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : null
                    )
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>You haven't joined any clubs yet.</p>
                        <Button variant="link" asChild><Link href="/dashboard/clubs">Find Clubs</Link></Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

