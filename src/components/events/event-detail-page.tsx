
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Club, ClubEvent, EventDetail } from "@/lib/types";
import { format, isToday, isFuture, isPast } from "date-fns";
import { Calendar, MapPin, Ticket, Tag, QrCode, Upload, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface EventDetailPageProps {
    event: ClubEvent;
    club: Club;
    details: EventDetail;
}

type RsvpStatus = 'idle' | 'pending_payment' | 'paid' | 'proof_submitted' | 'confirmed' | 'waitlisted';

export function EventDetailPage({ event, club, details }: EventDetailPageProps) {
    const { user, role } = useAuth();
    const { toast } = useToast();
    const now = new Date();
    const eventDate = new Date(event.start);

    // This state would normally be derived from user data / orders
    const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('idle');


    const isRsvpOpen = useMemo(() => {
        if (!event.rsvpOpen || !event.rsvpClose) return false;
        const rsvpOpenDate = new Date(event.rsvpOpen);
        const rsvpCloseDate = new Date(event.rsvpClose);
        return now >= rsvpOpenDate && now < rsvpCloseDate;
    }, [event.rsvpOpen, event.rsvpClose, now]);

    const isCheckInActive = isToday(eventDate) || (isPast(eventDate) && now < new Date(event.end));
    const canManageEvent = role === 'superAdmin' || role === 'clubManager';
    const isPaidEvent = event.price > 0;
    const isFull = event.capacity && event.rsvps.length >= event.capacity;

    const isEligible = useMemo(() => {
        if (!user) return false;
        if (event.requiresStudentVerification && user.verificationStatus !== 'verified') return false;

        if (event.visibility === 'campus' && !user.universityIds?.some(id => event.allowedUniversities?.includes(id))) {
            return false;
        }

        const membership = user.memberships?.find(m => m.clubId === event.clubId);
        if (event.requiresDuesPaid && (!membership || membership.duesStatus !== 'paid')) return false;
        if (membership?.banned) return false;

        // In a real app, this would also check for duplicate orders/rsvps
        return rsvpStatus === 'idle';
    }, [user, event, rsvpStatus]);


    const handleBuyTicketClick = () => {
        if (event.organizerPayLink) {
            window.open(event.organizerPayLink, '_blank');
            setRsvpStatus('pending_payment');
            toast({
                title: "Spot Reserved! Please Complete Payment",
                description: "Once paid, please return to submit your proof of payment within 10 minutes.",
            });
        }
    };

    const handleFreeRsvpClick = () => {
        setRsvpStatus('confirmed');
        toast({
            title: "RSVP Confirmed!",
            description: `You're on the list for ${event.name}.`,
        });
    };

    const handleSubmitProofClick = () => {
        // In a real app, this would open a dialog to upload a receipt
        setRsvpStatus('proof_submitted');
        toast({
            title: "Proof Submitted",
            description: `Your payment proof is under review. You'll be notified upon confirmation.`,
        });
    }

    const handleJoinWaitlistClick = () => {
        setRsvpStatus('waitlisted');
        toast({
            title: "You're on the waitlist!",
            description: `You'll be notified if a spot opens up for ${event.name}.`,
        });
    };


    const renderActionButton = () => {
        if (canManageEvent) {
            return (
                <Button asChild className="w-full mt-4" size="lg" disabled={!isCheckInActive}>
                    <Link href={`/dashboard/events/${event.id}/check-in`}>
                        <QrCode className="mr-2 h-5 w-5" />
                        Display Check-in QR
                    </Link>
                </Button>
            )
        }

        if (isFull && event.waitlistEnabled && rsvpStatus === 'idle') {
            return <Button className="w-full mt-4" size="lg" onClick={handleJoinWaitlistClick} disabled={!isRsvpOpen || !isEligible}><Clock className="mr-2 h-5 w-5" />Join Waitlist</Button>;
        }

        if (isFull && !event.waitlistEnabled) {
            return <Button className="w-full mt-4" size="lg" variant="outline" disabled>Sold Out</Button>
        }

        if (isPaidEvent) {
            switch (rsvpStatus) {
                case 'idle':
                    return <Button className="w-full mt-4" size="lg" onClick={handleBuyTicketClick} disabled={!isRsvpOpen || !isEligible}><Ticket className="mr-2 h-5 w-5" />Buy Ticket</Button>;
                case 'pending_payment':
                    return <Button className="w-full mt-4" size="lg" onClick={handleSubmitProofClick}><Upload className="mr-2 h-5 w-5" />Submit Payment Proof</Button>;
                case 'proof_submitted':
                    return <Button className="w-full mt-4" size="lg" variant="outline" disabled>Proof Submitted</Button>;
                case 'waitlisted':
                    return <Button className="w-full mt-4" size="lg" variant="outline" disabled><Clock className="mr-2 h-5 w-5" />On Waitlist</Button>;
                case 'confirmed':
                    return <Button asChild variant="secondary" className="w-full mt-4" size="lg" disabled={!isCheckInActive}><Link href={`/dashboard/events/${event.id}/check-in`}><QrCode className="mr-2 h-5 w-5" />Check-in to Event</Link></Button>;
                default: // Catches 'paid' which is now an internal state before proof is submitted
                    return <Button className="w-full mt-4" size="lg" onClick={handleSubmitProofClick}><Upload className="mr-2 h-5 w-5" />Submit Payment Proof</Button>;
            }
        }

        // Free event logic
        switch (rsvpStatus) {
            case 'idle':
                return <Button className="w-full mt-4" size="lg" onClick={handleFreeRsvpClick} disabled={!isRsvpOpen || !isEligible}><Ticket className="mr-2 h-5 w-5" />RSVP Now</Button>;
            case 'waitlisted':
                return <Button className="w-full mt-4" size="lg" variant="outline" disabled><Clock className="mr-2 h-5 w-5" />On Waitlist</Button>;
            case 'confirmed':
            default:
                return <Button asChild variant="secondary" className="w-full mt-4" size="lg" disabled={!isCheckInActive}><Link href={`/dashboard/events/${event.id}/check-in`}><QrCode className="mr-2 h-5 w-5" />Check-in to Event</Link></Button>;
        }
    }


    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="relative h-64 md:h-80 rounded-lg overflow-hidden -mx-4 md:mx-0">
                <Image
                    src={event.imageUrl}
                    alt={`${event.name} banner`}
                    fill={true}
                    className="object-cover w-full h-full"
                    data-ai-hint="event banner"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                    <p className="text-sm font-semibold text-primary-foreground/80">{format(eventDate, "eeee, MMMM d")}</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mt-1">{event.name}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Event Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About this event</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm md:prose-base max-w-none text-foreground/90" dangerouslySetInnerHTML={{ __html: details.descriptionHtml }} />
                    </Card>

                    {/* Organizer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Organizer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={club.logoUrl} alt={`${club.name} logo`} />
                                    <AvatarFallback>{club.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-semibold">{club.name}</h3>
                                    <p className="text-sm text-muted-foreground">{club.university.name}</p>
                                    <Button variant="outline" size="sm" className="mt-2" asChild>
                                        <Link href={`/dashboard/clubs/${club.id}`}>View Club</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Highlights</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {details.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-sm">
                                    <Tag className="w-3 h-3 mr-1.5" /> {tag}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="sticky top-24">
                        <CardHeader>
                            <div className="flex items-center justify-between text-2xl font-bold">
                                <span>Price</span>
                                <span>{isPaidEvent ? `${event.currency} ${event.price}` : 'Free'}</span>
                            </div>

                            {renderActionButton()}
                            {rsvpStatus === 'pending_payment' && (
                                <div className="text-center text-sm text-muted-foreground pt-2">
                                    Your spot is reserved for 10 minutes.
                                </div>
                            )}

                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                            <div className="text-sm text-foreground/90 space-y-3">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-4 h-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <h4 className="font-semibold">Date and time</h4>
                                        <p className="text-muted-foreground">{format(eventDate, "eeee, MMMM d, yyyy 'at' h:mm a")}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                                    <div>
                                        <h4 className="font-semibold">Location</h4>
                                        <p className="text-muted-foreground">{event.location}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

