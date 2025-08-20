
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
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import type { Ticket } from '@/types/domain';
import { getTicket } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function TicketDetailsClient({
  ticketId,
}: {
  ticketId: string;
}) {
  const { toast } = useToast();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      setIsLoading(true);
      try {
        const ticketData = await getTicket(ticketId);
        setTicket(ticketData);
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
    fetchTicket();
  }, [ticketId, toast]);

  if (isLoading) {
    // TODO: Add skeleton loader
    return <div className="flex items-center justify-center h-full">Loading ticket...</div>;
  }

  if (!ticket) {
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
        <div className="flex flex-col items-center text-center gap-4 bg-transparent rounded-lg">
            <CheckCircle className="size-12 text-green-500" />
            <h1 className="text-2xl font-semibold">Order successful</h1>
            <p className="text-muted-foreground max-w-md">
                Thank you for your purchase! Show this QR code at the event entrance for scanning.
            </p>
            <div className="p-4 bg-white rounded-lg border shadow-sm my-4">
            <Image
                src={ticket.qrCodeUrl}
                alt="QR Code"
                width={200}
                height={200}
                className="rounded-md"
                data-ai-hint="qr code"
            />
            </div>
            <p className="text-sm text-muted-foreground font-mono">
            Order ID: {ticket.orderId}
            </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 w-full">
            <Card className="md:col-span-3">
            <CardHeader>
                <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Detail 1: Value</p>
                    <p>Detail 2: Value</p>
                    <p>Detail 3: Value</p>
                </div>
            </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Event Info</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Detail A: Value</p>
                        <p>Detail B: Value</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
