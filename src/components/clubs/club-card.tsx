import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Club } from '@/lib/types';
import { ArrowRight, Star } from 'lucide-react';

interface ClubCardProps {
    club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
    return (
        <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="relative p-0">
                <Image
                    src={club.logoUrl!}
                    alt={`${club.name} logo`}
                    width={400}
                    height={250}
                    className="object-cover w-full h-40"
                    data-ai-hint="logo abstract"
                />
                {club.isFeatured && (
                    <Badge className="absolute top-2 right-2" variant="default">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                    </Badge>
                )}
            </CardHeader>
            <div className="p-4 flex flex-col flex-grow">
                <CardTitle className="text-lg font-bold mb-1">{club.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-2">{club.university.name}</p>
                <CardContent className="p-0 text-sm text-foreground/80 flex-grow">
                    <p className="line-clamp-3">{club.description}</p>
                </CardContent>
            </div>
            <CardFooter className="p-4 bg-muted/30">
                <Button asChild variant="secondary" className="w-full">
                    <Link href={`/dashboard/clubs/${club.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
