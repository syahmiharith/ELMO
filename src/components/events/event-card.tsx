
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, Building2, ArrowRight } from 'lucide-react';
import { ClubEvent, Club } from '@elmo/shared-types';
import { format } from 'date-fns';
import Link from 'next/link';

interface EventCardProps {
    event: ClubEvent;
    club: Club;
}

export function EventCard({ event, club }: EventCardProps) {
    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg group">
            <CardHeader className="relative p-0">
                <Link href={`/dashboard/events/${event.id}`}>
                    <Image
                        src={event.imageUrl}
                        alt={`${event.name} banner`}
                        width={400}
                        height={200}
                        className="object-cover w-full h-40"
                        data-ai-hint="event photo"
                    />
                </Link>
                <Badge className="absolute top-2 right-2" variant="secondary">{event.category}</Badge>
            </CardHeader>
            <CardContent className="p-4 flex flex-col flex-grow">
                <Link href={`/dashboard/events/${event.id}`} className="block">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{event.name}</h3>
                </Link>
                <div className="text-sm text-muted-foreground space-y-2 flex-grow">
                    <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(event.start), "eee, MMM d 'at' h:mm a")}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>{club.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <Ticket className="w-4 h-4" />
                        <span>{event.price > 0 ? `$${event.price}` : 'Free'}</span>
                    </p>
                </div>
            </CardContent>
            <CardFooter className="p-4 bg-muted/30">
                <Button asChild className="w-full">
                    <Link href={`/dashboard/events/${event.id}`}>
                        View Details
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

