
'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Ticket,
  Check,
  Users,
  DollarSign,
  Info,
  Dot,
  Flame,
  ArrowRight,
  Plus,
  Minus,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Event as ClubEvent, Ticket as TicketType, Club, Order } from '@/types/domain';
import { useState, useEffect } from 'react';
import { getEvent, rsvpEvent, listMyTickets, getClub, listMyOrders } from '@/lib/api';
import { ClientFormattedDate } from '@/components/client-formatted-date';
import { Logo } from '@/components/logo';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { summarizeEventTldr } from '@/ai/flows/summarize-event-tldr';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

function EventCheckoutDialog({ event, onConfirm, children }: { event: ClubEvent, onConfirm: (quantity: number) => Promise<void>, children: React.ReactNode }) {
    const [quantity, setQuantity] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handleCheckout = async () => {
        setIsProcessing(true);
        try {
            await onConfirm(quantity);
            // The toast is now shown by the parent component's onConfirm function.
            // We just wait a bit before closing the modal so the user sees the toast.
            setTimeout(() => {
                setIsOpen(false);
            }, 1000);
        } catch (error) {
            // Error toast is handled by parent, we just stop processing here.
        } finally {
            // In a real app you might want to handle the loading state differently on error
            setIsProcessing(false);
        }
    }

    const price = event.price > 0 ? (event.price / 100) * quantity : 0;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0">
                <div className="grid grid-cols-1 md:grid-cols-5">
                    {/* Left Section */}
                    <div className="md:col-span-3 p-8 flex flex-col">
                        <DialogHeader className="text-left mb-6">
                            <DialogTitle className="text-2xl font-headline">Checkout</DialogTitle>
                        </DialogHeader>
                        
                        <div className="flex-1 space-y-6">
                            <div className="border rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold">{event.name} Ticket</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {event.price > 0 ? `$${(event.price / 100).toFixed(2)}` : 'Free'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold w-8 text-center">{quantity}</span>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(q => q + 1)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                             <Button onClick={handleCheckout} size="lg" className="w-full" disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : 'Checkout'}
                            </Button>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="md:col-span-2 bg-muted/50 flex flex-col">
                        <div className="relative aspect-video w-full rounded-tr-lg overflow-hidden">
                             <Image
                                src={event.imageUrl}
                                alt={event.name}
                                fill
                                className="object-cover"
                                data-ai-hint="event photo"
                            />
                        </div>
                        <div className="p-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ticket ({quantity}x)</span>
                                        <span>{event.price > 0 ? `$${((event.price / 100) * quantity).toFixed(2)}` : 'Free'}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>{event.price > 0 ? `$${price.toFixed(2)}` : 'Free'}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


export default function EventDetailsClient({
  eventId,
}: {
  eventId: string;
}) {
  const { toast } = useToast();
  const { permissions } = useAuth();
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [myTickets, setMyTickets] = useState<TicketType[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tldrHighlights, setTldrHighlights] = useState<string[]>([]);
  const [isTldrLoading, setIsTldrLoading] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        const eventData = await getEvent(eventId);
        const [clubData, ticketsData, ordersData] = await Promise.all([
            getClub(eventData.clubId),
            listMyTickets(),
            listMyOrders()
        ]);
        
        setEvent(eventData);
        setClub(clubData);
        setMyTickets(ticketsData);
        setMyOrders(ordersData);

        // Once we have the event data, fetch the TLDR highlights
        setIsTldrLoading(true);
        summarizeEventTldr({ description: eventData.description })
          .then(response => {
              if (response?.highlights) {
                setTldrHighlights(response.highlights);
              }
          })
          .catch(err => {
              console.error("Failed to get TLDR highlights", err);
              // Fallback to default highlights if AI fails
              setTldrHighlights(eventData.highlights || []);
          })
          .finally(() => setIsTldrLoading(false));

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load event details.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventData();
  }, [eventId, toast]);

  const handleCheckout = async (quantity: number) => {
    if (!event) return;
    try {
      await rsvpEvent(event.id, quantity);
      toast({
        title: "You're going!",
        description: `Your ticket for ${event.name} has been secured.`,
      });
      // Refetch data to update UI correctly
      const [eventData, ticketsData, ordersData] = await Promise.all([
          getEvent(eventId),
          listMyTickets(),
          listMyOrders()
      ]);
      setEvent(eventData);
      setMyTickets(ticketsData);
      setMyOrders(ordersData);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'RSVP Failed',
        description: 'Could not complete your RSVP. Please try again.',
      });
       // Re-throw the error so the dialog knows the action failed.
      throw error;
    }
  };

  if (isLoading || !event || !club) {
    // TODO: Add skeleton
    return <div>Loading...</div>;
  }

  const isAttending = myTickets.some(t => t.event.id === eventId);
  const relevantTicket = myTickets.find(t => t.event.id === eventId);
  const canRsvp = permissions.includes('action:rsvp');
  
  const getStatusBadgeVariant = (status: ClubEvent['status']) => {
      switch (status) {
          case 'hot':
              return 'destructive';
          case 'available':
              return 'default';
          default:
              return 'secondary';
      }
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/events"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Event Listings
      </Link>

      <div className="space-y-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted/50 flex items-center justify-center">
          <Logo className="w-24 text-muted-foreground/20" />
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className="absolute inset-0 object-cover"
            data-ai-hint="event photo"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:gap-12">
          {/* Left Section */}
          <div className="md:col-span-2 space-y-6">
            <header>
               <Badge variant={getStatusBadgeVariant(event.status)} className="capitalize mb-2">
                    {event.status === 'hot' && <Flame className="mr-1 h-3 w-3" />}
                    {event.status}
                </Badge>
              <h1 className="mt-1 text-4xl font-bold font-headline tracking-tight">
                {event.name}
              </h1>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Card>
                    <CardHeader className='flex-row items-center gap-4 space-y-0'>
                        <Calendar className="size-8 text-primary" />
                        <CardTitle className='text-base'>Date & Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="font-medium"><ClientFormattedDate date={event.date} options={{ dateStyle: 'full' }} /></p>
                       <p className="text-muted-foreground"><ClientFormattedDate date={event.date} options={{ timeStyle: 'short' }} /></p>
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader className='flex-row items-center gap-4 space-y-0'>
                        <MapPin className="size-8 text-primary" />
                        <CardTitle className='text-base'>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <p className="font-medium">{event.location}</p>
                       <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View on map</a>
                    </CardContent>
                 </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                    {isTldrLoading ? (
                      <div className="space-y-2">
                         <Skeleton className="h-4 w-20" />
                         <Skeleton className="h-4 w-24" />
                         <Skeleton className="h-4 w-16" />
                      </div>
                    ) : (
                      <ul className="space-y-2 text-muted-foreground">
                          {tldrHighlights.map((highlight, index) => (
                              <li key={index} className="flex items-center gap-2">
                                  <Dot className="text-primary" />
                                  <span>{highlight}</span>
                              </li>
                          ))}
                      </ul>
                    )}
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="size-5" />
                    About this Event
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-stone dark:prose-invert max-w-none">
                <p>{event.description}</p>
              </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Organized By</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={`/clubs/${club.id}`} className="flex items-center gap-4 group">
                        <Image src="https://placehold.co/100x100.png" alt={club.name} width={64} height={64} className="rounded-lg" data-ai-hint="club logo" />
                        <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary">{club.name}</h3>
                            <p className="text-muted-foreground">View Club Page</p>
                        </div>
                    </Link>
                </CardContent>
            </Card>

          </div>

          {/* Right Section */}
          <div className="md:col-span-1 mt-6 md:mt-0">
            <div className="sticky top-[0.3rem]">
               <Card>
                <CardContent className="flex flex-col gap-4 pt-6 text-center">
                    <p className="text-3xl font-bold">
                      {event.price > 0 ? `$${(event.price / 100).toFixed(2)}` : 'Free'}
                    </p>
                  {isAttending ? (
                    <Button variant="outline" size="lg" asChild>
                      <Link href={`/tickets/${relevantTicket?.id}`}>
                        <Ticket className="mr-2 h-4 w-4" />
                        See Tickets
                      </Link>
                    </Button>
                  ) : (
                    canRsvp && (
                      <EventCheckoutDialog event={event} onConfirm={handleCheckout}>
                          <Button size="lg">
                            <Ticket className="mr-2 h-4 w-4" />
                            {event.price > 0 ? `Buy Ticket` : 'Get Tickets'}
                          </Button>
                      </EventCheckoutDialog>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
