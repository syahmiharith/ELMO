
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Calendar, MapPin, Upload, ArrowRight, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Ticket as TicketType, Order } from '@/types/domain';
import { listMyTickets, listMyOrders } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function OrderHistory() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const ordersData = await listMyOrders();
        setOrders(ordersData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load your orders.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [toast]);

  const getBadgeVariant = (status: Order['status']): 'success' | 'warning' | 'destructive' | 'outline' => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'awaiting_payment':
        return 'warning';
      case 'under_review':
          return 'warning';
      case 'rejected':
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch(status) {
        case 'paid':
            return 'Paid';
        case 'awaiting_payment':
            return 'Awaiting Payment';
        case 'under_review':
            return 'Pending';
        default:
            return status.replace('_', ' ');
    }
  }

  if (isLoading) {
    return <div>Loading orders...</div>; // TODO: Add skeleton loader
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>A list of your recent transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
               <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.id.split('_').pop()?.substring(0, 8)}</TableCell>
                <TableCell>{order.itemName}</TableCell>
                <TableCell>
                  <ClientFormattedDate date={order.createdAt} options={{ dateStyle: 'short' }} />
                </TableCell>
                <TableCell className="text-right">
                  ${(order.total / 100).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getBadgeVariant(order.status)} className="capitalize">
                    {getStatusText(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    {order.status === 'awaiting_payment' && (
                        <Button variant="outline" size="sm">
                            <Upload className="mr-2" /> Upload Receipt
                        </Button>
                    )}
                </TableCell>
              </TableRow>
            ))}
             {orders.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                        You have no past orders.
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

type TicketGroup = {
    eventId: string;
    eventName: string;
    eventDate: string;
    tickets: TicketType[];
}

export default function TicketsPage() {
  const { toast } = useToast();
  const [ticketGroups, setTicketGroups] = useState<TicketGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        // The mock API now returns grouped tickets
        const ticketsData = await listMyTickets();
        
        // Group tickets by eventId
        const groups: Record<string, TicketGroup> = {};
        for (const ticket of ticketsData) {
            const key = ticket.event.id;
            if (!groups[key]) {
                groups[key] = {
                    eventId: ticket.event.id,
                    eventName: ticket.event.name,
                    eventDate: ticket.event.date,
                    tickets: [],
                };
            }
            groups[key].tickets.push(ticket);
        }

        const sortedGroups = Object.values(groups).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
        setTicketGroups(sortedGroups);

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load your tickets.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, [toast]);

  if (isLoading) {
    return <div>Loading...</div>; // TODO: Add skeleton loader
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          My Digital Tickets
        </h1>
        <p className="text-muted-foreground">
          Your upcoming event tickets are grouped below.
        </p>
      </div>
      
      {ticketGroups.length > 0 ? (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-2">
                    {ticketGroups.map(group => (
                        <Button asChild key={group.eventId} variant="ghost" className="w-full h-auto justify-between p-4">
                            <Link href={`/tickets/${group.tickets[0].id}`}>
                                <div className="text-left">
                                    <p className="font-semibold truncate">{group.eventName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        <ClientFormattedDate date={group.eventDate} options={{ dateStyle:'medium', timeStyle:'short' }} />
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Badge variant="outline">
                                        {group.tickets.length} ticket{group.tickets.length > 1 ? 's' : ''}
                                    </Badge>
                                    <ArrowRight className="size-4 text-muted-foreground" />
                                </div>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
      ) : (
         <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardTitle>No Upcoming Tickets</CardTitle>
            <CardDescription className="mt-2">When you RSVP to an event, your tickets will appear here.</CardDescription>
          </Card>
      )}
      
      <Separator />

      <OrderHistory />
    </div>
  );
}
