
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  listMyAdminClubs,
  listClubMembershipRequests,
  approveMembership,
  rejectMembership,
} from '@/lib/api';
import type { Club, User } from '@/types/domain';
import { Check, Loader2, User as UserIcon, X, Users } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type RequestsByClub = {
  club: Club;
  requests: User[];
};

export default function MembershipRequestsClient() {
  const { toast } = useToast();
  const [requestsByClub, setRequestsByClub] = useState<RequestsByClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const adminClubs = await listMyAdminClubs();
      const allRequests = await Promise.all(
        adminClubs.map(async (club) => {
          const requests = await listClubMembershipRequests(club.id);
          return { club, requests };
        })
      );
      setRequestsByClub(allRequests.filter((item) => item.requests.length > 0));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load membership requests.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (clubId: string, userId: string, action: 'approve' | 'reject') => {
    const key = `${clubId}-${userId}`;
    setActionLoading(prev => ({...prev, [key]: true}));

    try {
        if (action === 'approve') {
            await approveMembership(clubId, userId);
            toast({
                title: 'Member Approved',
                description: 'The user has been added to the club.',
            });
        } else {
            await rejectMembership(clubId, userId);
            toast({
                title: 'Request Rejected',
                description: 'The user\'s request has been rejected.',
            });
        }
        // Refresh the list after an action
        fetchRequests();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to ${action} request. Please try again.`,
        });
    } finally {
        setActionLoading(prev => ({...prev, [key]: false}));
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Membership Requests
          </h1>
          <p className="text-muted-foreground">
            Review and approve membership requests for all clubs.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading Requests...</CardTitle>
          </CardHeader>
          <CardContent>
            <Loader2 className="animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Membership Requests
        </h1>
        <p className="text-muted-foreground">
          Review and approve membership requests for the clubs you administer.
        </p>
      </div>
      
      {requestsByClub.length > 0 ? (
        <Accordion type="multiple" defaultValue={requestsByClub.map(item => item.club.id)} className="w-full space-y-4">
            {requestsByClub.map(({ club, requests }) => (
                <AccordionItem value={club.id} key={club.id} className="border-b-0">
                    <Card>
                        <AccordionTrigger className="p-6 hover:no-underline">
                            <div className='flex items-center gap-4'>
                                <Avatar className="size-10 border">
                                    <AvatarImage src={club.imageUrl} alt={club.name} />
                                    <AvatarFallback>{club.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-lg font-semibold text-left">{club.name}</h2>
                                    <p className="text-sm text-muted-foreground text-left">{requests.length} pending request{requests.length > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <ul className="divide-y">
                                {requests.map(user => {
                                    const isLoading = actionLoading[`${club.id}-${user.id}`];
                                    return (
                                        <li key={user.id} className="flex items-center justify-between py-3">
                                            <Link href={`/profile/${user.id}`} className="flex items-center gap-4 group">
                                                <Avatar>
                                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                    <AvatarFallback><UserIcon /></AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium group-hover:text-primary">{user.name}</span>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAction(club.id, user.id, 'reject')} disabled={isLoading}>
                                                    {isLoading ? <Loader2 className="animate-spin" /> : <X className="text-destructive" />}
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAction(club.id, user.id, 'approve')} disabled={isLoading}>
                                                     {isLoading ? <Loader2 className="animate-spin" /> : <Check className="text-green-500" />}
                                                </Button>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            ))}
        </Accordion>
      ) : (
         <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Users className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No Pending Requests</h3>
              <p className="text-muted-foreground mt-1">There are no pending membership requests for any of your clubs.</p>
            </CardContent>
          </Card>
      )}

    </div>
  );
}

    