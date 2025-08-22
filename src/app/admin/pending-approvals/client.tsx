
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  listEventOrders,
  reviewOrder,
} from '@/lib/api';
import type { Club, Order, User, Event as ClubEvent } from '@/types/domain';
import { Check, Loader2, User as UserIcon, X, FileCheck, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { Badge } from '@/components/ui/badge';


type ApprovalsByEvent = {
  event: ClubEvent;
  orders: (Order & { user: User })[];
};

function ReceiptDialog({ receiptUrl, children }: { receiptUrl?: string, children: React.ReactNode }) {
    if (!receiptUrl) return children;

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Payment Receipt</DialogTitle>
                </DialogHeader>
                <div className="relative aspect-square w-full">
                    <Image src={receiptUrl} alt="Payment Receipt" fill className="object-contain" />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function PendingApprovalsClient() {
  const { toast } = useToast();
  const [approvalsByEvent, setApprovalsByEvent] = useState<ApprovalsByEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      const adminClubs = await listMyAdminClubs();
      const clubEvents = (await Promise.all(adminClubs.map(c => listEventOrders(c.id)))).flat();
      
      const pendingOrders = clubEvents.filter(o => o.status === 'under_review');
      
      const approvalsGrouped: Record<string, ApprovalsByEvent> = {};

      for (const order of pendingOrders) {
          if (!order.eventId) continue;
          
          if (!approvalsGrouped[order.eventId]) {
            const eventDetails = MOCK_DATA.events.find(e => e.id === order.eventId);
            if (!eventDetails) continue;

            approvalsGrouped[order.eventId] = {
                event: eventDetails,
                orders: [],
            };
          }

           const userDetails = MOCK_DATA.users.find(u => u.id === order.userId);
           if (userDetails) {
                approvalsGrouped[order.eventId].orders.push({ ...order, user: userDetails });
           }
      }
      
      setApprovalsByEvent(Object.values(approvalsGrouped));

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load pending approvals.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleAction = async (orderId: string, isApproved: boolean) => {
    setActionLoading(prev => ({...prev, [orderId]: true}));

    try {
        await reviewOrder({ orderId, isApproved });
        toast({
            title: isApproved ? 'Order Approved' : 'Order Rejected',
            description: `The order has been successfully ${isApproved ? 'approved' : 'rejected'}.`,
        });
        // Refresh the list after an action
        fetchApprovals();
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: `Failed to update order status. Please try again.`,
        });
    } finally {
        setActionLoading(prev => ({...prev, [orderId]: false}));
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Pending Approvals
          </h1>
          <p className="text-muted-foreground">
            Review pending approvals for clubs, events, and finances.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading Approvals...</CardTitle>
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
          Pending Approvals
        </h1>
        <p className="text-muted-foreground">
          Review pending event ticket orders that require payment confirmation.
        </p>
      </div>
      
      {approvalsByEvent.length > 0 ? (
        <Accordion type="multiple" defaultValue={approvalsByEvent.map(item => item.event.id)} className="w-full space-y-4">
            {approvalsByEvent.map(({ event, orders }) => (
                <AccordionItem value={event.id} key={event.id} className="border-b-0">
                    <Card>
                        <AccordionTrigger className="p-6 hover:no-underline">
                             <div className='flex items-center gap-4'>
                                <Avatar className="size-10 border">
                                    <AvatarImage src={event.imageUrl} alt={event.name} />
                                    <AvatarFallback>{event.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-lg font-semibold text-left">{event.name}</h2>
                                    <p className="text-sm text-muted-foreground text-left">{orders.length} pending approval{orders.length > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                             <div className="space-y-4">
                                {orders.map(order => {
                                    const isLoading = actionLoading[order.id];
                                    return (
                                        <Card key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                                            <div className="flex-1 space-y-3">
                                                <Link href={`/profile/${order.user.id}`} className="flex items-center gap-3 group">
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={order.user.avatarUrl} alt={order.user.name} />
                                                        <AvatarFallback><UserIcon /></AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                      <span className="font-medium group-hover:text-primary">{order.user.name}</span>
                                                      <p className="text-xs text-muted-foreground font-mono">{order.id}</p>
                                                    </div>
                                                </Link>
                                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                                  <div className="flex items-center gap-1.5">
                                                      <DollarSign className="size-4" />
                                                      <span>${(order.total / 100).toFixed(2)}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5">
                                                      <Calendar className="size-4" />
                                                      <ClientFormattedDate date={order.createdAt} options={{dateStyle: 'short'}} />
                                                  </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <ReceiptDialog receiptUrl={order.receiptUrl}>
                                                    <Button variant="outline" className="flex-1">
                                                        View Receipt <ExternalLink className="ml-2" />
                                                    </Button>
                                                </ReceiptDialog>
                                                <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => handleAction(order.id, false)} disabled={isLoading}>
                                                    {isLoading ? <Loader2 className="animate-spin" /> : <X className="text-destructive" />}
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => handleAction(order.id, true)} disabled={isLoading}>
                                                     {isLoading ? <Loader2 className="animate-spin" /> : <Check className="text-green-500" />}
                                                </Button>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        </AccordionContent>
                    </Card>
                </AccordionItem>
            ))}
        </Accordion>
      ) : (
         <Card>
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <FileCheck className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No Pending Approvals</h3>
              <p className="text-muted-foreground mt-1">There are no pending approvals for any of your clubs.</p>
            </CardContent>
          </Card>
      )}

    </div>
  );
}
