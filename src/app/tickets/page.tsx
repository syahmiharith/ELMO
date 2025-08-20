
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
import { Calendar, MapPin, Upload, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Ticket, Order } from '@/types/domain';
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
            return 'Success';
        case 'awaiting_payment':
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
              <TableHead className="w-[120px]">Order ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.itemName}</TableCell>
                <TableCell>
                  <ClientFormattedDate date={order.createdAt} options={{ dateStyle: 'short' }} />
                </TableCell>
                <TableCell className="text-right">
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getBadgeVariant(order.status)} className="capitalize">
                    {getStatusText(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {order.status === 'awaiting_payment' && (
                    <Button variant="outline" size="sm" className="w-[120px]">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  )}
                   {order.status === 'under_review' && (
                    <Button variant="outline" size="sm" disabled className="w-[120px]">
                      <Upload className="mr-2 h-4 w-4" />
                      Uploaded
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


export default function TicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const ticketsData = await listMyTickets();
        setTickets(ticketsData);
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
          Access your event tickets here. No printing required!
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <Link href={`/tickets/${ticket.id}`} key={ticket.id} className="block group">
            <Card className="flex flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1 overflow-hidden h-full">
              <CardHeader className="p-4 bg-muted/50">
                <CardTitle className="font-headline text-lg truncate">
                  {ticket.event.name}
                </CardTitle>
                <CardDescription className="text-xs font-mono truncate">ID: {ticket.id}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-sm flex-1">
                 <div className="flex items-start gap-2.5 text-muted-foreground">
                    <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
                    <span><ClientFormattedDate date={ticket.event.date} options={{ dateStyle: 'medium', timeStyle: 'short' }} /></span>
                </div>
                 <div className="flex items-start gap-2.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="truncate">{ticket.event.location}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 mt-auto">
                <div className="flex items-center w-full justify-end text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Details <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
       {tickets.length === 0 && (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardTitle>No Tickets Yet</CardTitle>
            <CardDescription className="mt-2">When you RSVP to an event, your tickets will appear here.</CardDescription>
          </Card>
        )}
      
      <Separator />

      <OrderHistory />
    </div>
  );
}
