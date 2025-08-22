
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, User, Calendar, MapPin, DollarSign, Ticket as TicketIcon, Users } from 'lucide-react';
import Link from 'next/link';
import type { Ticket, Order } from '@/types/domain';
import { getTicket, listMyOrders, listMyTickets } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { useAuth } from '@/context/auth-context';

export default function TicketDetailsClient({
  ticketId,
}: {
  ticketId: string;
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [mainTicket, setMainTicket] = useState<Ticket | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderTickets, setOrderTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicketData = async () => {
      setIsLoading(true);
      try {
        const ticketData = await getTicket(ticketId);
        setMainTicket(ticketData);

        // Fetch all tickets and orders to find related ones
        const [allOrders, allTickets] = await Promise.all([
            listMyOrders(),
            listMyTickets()
        ]);
        
        const associatedOrder = allOrders.find(o => o.id === ticketData.orderId);
        setOrder(associatedOrder || null);

        if (associatedOrder) {
            const associatedTickets = allTickets.filter(t => t.orderId === associatedOrder.id);
            setOrderTickets(associatedTickets);
        } else {
            setOrderTickets([ticketData]);
        }

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load ticket details.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchTicketData();
  }, [ticketId, toast]);

  if (isLoading) {
    // TODO: Add skeleton loader
    return <div className="flex items-center justify-center h-full">Loading ticket...</div>;
  }

  if (!mainTicket) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold">Ticket Not Found</h2>
            <p className="text-muted-foreground">Could not find the ticket you were looking for.</p>
            <Button asChild className="mt-4">
                <Link href="/tickets">Back to My Tickets</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 h-full">
        <div className="flex-none">
             <Link
                href="/tickets"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:underline mb-4"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to All Tickets
          </Link>
        </div>
      <div className="flex-1 flex flex-col justify-center items-center text-center gap-8">
        <div className="flex flex-col items-center text-center gap-4 bg-transparent rounded-lg w-full">
            <CheckCircle className="size-12 text-green-500" />
            <h1 className="text-2xl font-semibold">Order successful</h1>
            <p className="text-muted-foreground max-w-md">
                Thank you for your purchase! Show a QR code at the event entrance for scanning.
            </p>
            <div className="w-full space-y-6 my-4">
            {orderTickets.map((ticket) => (
              <div key={ticket.id} className="w-full max-w-sm mx-auto border rounded-lg p-6 flex flex-col items-center gap-4 bg-card">
                <div className="p-2 bg-white rounded-lg border shadow-sm">
                  <Image
                    src={ticket.qrCodeUrl}
                    alt={`QR Code for ticket ${ticket.id}`}
                    width={200}
                    height={200}
                    className="rounded-md"
                    data-ai-hint="qr code"
                  />
                </div>
                <div className="text-center">
                    <p className="text-xs text-muted-foreground font-mono">
                      Ticket ID
                    </p>
                    <p className="text-sm font-mono break-all">
                      {ticket.id}
                    </p>
                </div>
              </div>
            ))}
            </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6 w-full text-left">
            <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-sm">{user.name}</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{orderTickets.length} Ticket(s)</span>
                </div>
                {order && (
                    <>
                         <div className="flex items-center gap-3">
                            <DollarSign className="size-4 text-muted-foreground" />
                            <span className="text-sm">
                                Total Paid: ${(order.total / 100).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="size-4 text-muted-foreground" />
                             <span className="text-sm">
                                Purchased on <ClientFormattedDate date={order.createdAt} options={{ dateStyle: 'long' }} />
                            </span>
                        </div>
                    </>
                )}
            </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Event Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <h3 className="font-semibold">{mainTicket.event.name}</h3>
                    <div className="flex items-start gap-3 text-sm">
                        <Calendar className="size-4 text-muted-foreground mt-0.5" />
                        <span><ClientFormattedDate date={mainTicket.event.date} options={{ dateStyle: 'full', timeStyle: 'short' }} /></span>
                    </div>
                     <div className="flex items-start gap-3 text-sm">
                        <MapPin className="size-4 text-muted-foreground mt-0.5" />
                        <span>{mainTicket.event.location}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
