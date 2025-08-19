
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, CheckCircle, Clock } from "lucide-react";
import { ApprovalRequest } from '@elmo/shared-types';
import { useToast } from "@/hooks/use-toast";
import { clubs, mockUsers, approvalRequests as mockApprovalRequests } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";

export function SuperAdminDashboard() {
    const [loading, setLoading] = useState(false); // Set to false as we use mock data
    const [clubsData] = useState(clubs);
    const [usersData] = useState(mockUsers);
    const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(mockApprovalRequests.filter(req => req.status === 'pending'));
    const { toast } = useToast();

    const handleApprovalAction = (requestId: string, newStatus: 'approved' | 'rejected') => {
        const request = approvalRequests.find(req => req.id === requestId);
        setApprovalRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
        toast({
            title: `Request ${newStatus}`,
            description: `The request for '${request?.clubName}' has been ${newStatus}.`
        });
        // In a real app, this would be an API call to update the request status in Firestore.
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{clubsData.length}</div>}
                        <p className="text-xs text-muted-foreground">Across all universities</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{usersData.length}</div>}
                        <p className="text-xs text-muted-foreground">Admins, Managers, and Members</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{approvalRequests.length}</div>}
                        <p className="text-xs text-muted-foreground">Clubs, events, and budgets</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Clubs</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{clubsData.filter(c => c.isApproved).length}</div>}
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>Review and act on pending requests from clubs.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : approvalRequests.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Club</TableHead>
                                    <TableHead>Requester</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {approvalRequests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">{req.type}</Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{req.clubName}</TableCell>
                                        <TableCell>{req.requesterName}</TableCell>
                                        <TableCell>{req.date}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm">View</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleApprovalAction(req.id, 'rejected')}>Reject</Button>
                                            <Button size="sm" onClick={() => handleApprovalAction(req.id, 'approved')}>Approve</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-lg font-semibold">No Pending Approvals</p>
                            <p className="text-muted-foreground">The queue is all clear. Great work!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

