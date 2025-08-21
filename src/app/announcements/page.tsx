'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pin, AlertTriangle, Info, Zap, Eye, Edit, Trash2, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

import type { Announcement } from '@/types/announcement';

// Mock data - replace with actual API calls
const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Important: Club Meeting Tomorrow',
    content: 'Don\'t forget about our weekly club meeting tomorrow at 3 PM in the student center. We\'ll be discussing upcoming events and new member applications.',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    authorId: 'user-1',
    authorName: 'Club Admin',
    clubId: 'club-1',
    clubName: 'Programming Club',
    status: 'published',
    pinned: true,
    tags: ['meeting', 'important'],
  },
  {
    id: 'ann-2',
    title: 'Hackathon Registration Open',
    content: 'Registration is now open for our annual hackathon! Limited spots available. Register before January 25th.',
    priority: 'medium',
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    authorId: 'user-1',
    authorName: 'Club Admin',
    clubId: 'club-1',
    clubName: 'Programming Club',
    status: 'published',
    pinned: false,
    tags: ['hackathon', 'registration'],
  },
  {
    id: 'ann-3',
    title: 'Draft: New Workshop Series',
    content: 'Planning a new workshop series on web development. Still working on the details...',
    priority: 'low',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    authorId: 'user-1',
    authorName: 'Club Admin',
    clubId: 'club-1',
    clubName: 'Programming Club',
    status: 'draft',
    pinned: false,
    tags: ['workshop'],
  },
];

const priorityIcons = {
  low: Info,
  medium: Info,
  high: AlertTriangle,
  urgent: Zap,
};

const priorityColors = {
  low: 'text-blue-500',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const priorityBadgeVariants = {
  low: 'secondary',
  medium: 'outline',
  high: 'default',
  urgent: 'destructive',
} as const;

export default function AnnouncementsPage() {
  const { permissions } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  useEffect(() => {
    // Mock API call
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setAnnouncements(MOCK_ANNOUNCEMENTS);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load announcements.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [toast]);

  const filteredAnnouncements = announcements.filter(announcement => {
    const statusMatch = filter === 'all' || announcement.status === filter;
    const priorityMatch = priorityFilter === 'all' || announcement.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const canCreateAnnouncements = permissions.includes('action:create-event'); // Using create-event as proxy for admin

  if (!canCreateAnnouncements) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to manage announcements. Please contact your club admin.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Club Announcements
          </h1>
          <p className="text-muted-foreground">
            Manage and create announcements for your club members.
          </p>
        </div>
        <Button asChild>
          <Link href="/announcements/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Announcement
          </Link>
        </Button>
      </header>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={filter} onValueChange={(value) => setFilter(value as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                {filter === 'all' 
                  ? 'No announcements found.' 
                  : `No ${filter} announcements found.`
                }
              </div>
              <Button asChild>
                <Link href="/announcements/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Announcement
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const PriorityIcon = priorityIcons[announcement.priority];
            
            return (
              <Card key={announcement.id} className="relative">
                {announcement.pinned && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={priorityBadgeVariants[announcement.priority]}>
                          <PriorityIcon className={`h-3 w-3 mr-1 ${priorityColors[announcement.priority]}`} />
                          {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                        </Badge>
                        <Badge variant={announcement.status === 'published' ? 'default' : 'secondary'}>
                          {announcement.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <CardDescription>
                        By {announcement.authorName} • {new Date(announcement.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/announcements/${announcement.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/announcements/${announcement.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {announcement.content.length > 150 
                      ? `${announcement.content.substring(0, 150)}...`
                      : announcement.content
                    }
                  </p>
                  
                  {announcement.tags && announcement.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {announcement.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
