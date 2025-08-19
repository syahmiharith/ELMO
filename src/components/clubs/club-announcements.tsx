
"use client";

import { ClubAnnouncement } from '@elmo/shared-types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserCircle } from "lucide-react";

interface ClubAnnouncementsProps {
    announcements: ClubAnnouncement[];
    canManage: boolean;
}

export function ClubAnnouncements({ announcements, canManage }: ClubAnnouncementsProps) {
    return (
        <div className="space-y-6">
            {canManage && (
                <div className="flex justify-end">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post New Announcement
                    </Button>
                </div>
            )}
            {announcements.length > 0 ? (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader>
                                <CardTitle>{announcement.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 text-xs pt-1">
                                    <UserCircle className="h-4 w-4" />
                                    Posted by {announcement.author} on {announcement.date}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{announcement.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-16">
                    <CardContent>
                        <h3 className="text-lg font-semibold">No Announcements Yet</h3>
                        <p className="text-muted-foreground mt-2">Check back later for updates from the club!</p>
                        {canManage && <p className="text-muted-foreground mt-1">Click the button above to post one.</p>}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

