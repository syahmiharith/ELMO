
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, UserPlus, Download, Check, X, Shield, Star } from "lucide-react";
import { mockUsers } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { User, Membership } from "@/lib/types";

interface MemberListProps {
    clubId: string;
}

interface MemberWithMembership extends User {
    membership: Membership;
}

export function MemberList({ clubId }: MemberListProps) {
    const { user, role } = useAuth();
    const canManageMembers = role === 'superAdmin' || (role === 'clubManager' && user?.memberships?.some(m => m.clubId === clubId));

    const memberList: MemberWithMembership[] = mockUsers
        .map(user => {
            const membership = user.memberships?.find(m => m.clubId === clubId);
            return { ...user, membership: membership! };
        })
        .filter(item => item.membership);

    const currentUserMembership = user?.memberships?.find(m => m.clubId === clubId);
    const isCurrentUserOwner = currentUserMembership?.role === 'owner';


    const getDuesBadgeVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'default';
            case 'unpaid': return 'destructive';
            case 'waived': return 'secondary';
            default: return 'outline';
        }
    }

    return (
        <div className="space-y-4">
            {canManageMembers && (
                <div className="flex justify-end gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
                    <Button><UserPlus className="mr-2 h-4 w-4" />Add Member</Button>
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            {canManageMembers && <TableHead>Dues</TableHead>}
                            <TableHead>Joined</TableHead>
                            {canManageMembers && <TableHead>Check-in</TableHead>}
                            {canManageMembers && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {memberList.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={member.photoUrl} />
                                            <AvatarFallback>{member.name.display.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{member.name.display}</p>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={member.membership.role === 'owner' ? 'default' : 'outline'} className="capitalize">
                                        {member.membership.role === 'owner' && <Star className="mr-1 h-3 w-3" />}
                                        {member.membership.role}
                                    </Badge>
                                </TableCell>
                                {canManageMembers && (
                                    <TableCell>
                                        <Badge variant={getDuesBadgeVariant(member.membership.duesStatus)} className="capitalize">{member.membership.duesStatus}</Badge>
                                    </TableCell>
                                )}
                                <TableCell>{new Date(member.membership.joinedAt).toLocaleDateString()}</TableCell>
                                {canManageMembers && (
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch id={`attendance-${member.id}`} />
                                            <Label htmlFor={`attendance-${member.id}`}>Present</Label>
                                        </div>
                                    </TableCell>
                                )}
                                {canManageMembers && (
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0" disabled={member.id === user?.id && member.membership.role === 'owner'}>
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {member.membership.status === 'pending' && <DropdownMenuItem><Check className="mr-2 h-4 w-4 text-green-500" />Approve Join</DropdownMenuItem>}

                                                {isCurrentUserOwner && member.membership.role !== 'owner' && (
                                                    <>
                                                        <DropdownMenuItem><Star className="mr-2 h-4 w-4" />Make Owner</DropdownMenuItem>
                                                        {member.membership.role === 'member' && <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />Make Officer</DropdownMenuItem>}
                                                    </>
                                                )}

                                                {isCurrentUserOwner && member.membership.role === 'officer' && (
                                                    <DropdownMenuItem><X className="mr-2 h-4 w-4" />Remove as Officer</DropdownMenuItem>
                                                )}

                                                {(isCurrentUserOwner || currentUserMembership?.role === 'officer') && member.membership.role === 'member' && (
                                                    <DropdownMenuItem><Shield className="mr-2 h-4 w-4" />Make Officer</DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    disabled={member.membership.role === 'owner'}
                                                >
                                                    <X className="mr-2 h-4 w-4" />Remove from Club
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
