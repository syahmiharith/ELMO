'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MediaManager from '@/components/media-manager';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  category: 'image' | 'document' | 'other';
}

interface MediaManagementClientProps {
  eventId: string;
}

export default function MediaManagementClient({ eventId }: MediaManagementClientProps) {
  const { permissions } = useAuth();
  const { toast } = useToast();
  const [eventMedia, setEventMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock loading existing media for event
    const loadEventMedia = async () => {
      setLoading(true);
      try {
        // Simulate API call to load existing event media
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock existing media
        const mockMedia: MediaFile[] = [
          {
            id: 'media-1',
            name: 'event-poster.jpg',
            url: 'https://placehold.co/400x600.png',
            size: 524288, // 512KB
            type: 'image/jpeg',
            uploadedAt: '2024-01-10T09:00:00Z',
            category: 'image',
          },
          {
            id: 'media-2',
            name: 'event-schedule.pdf',
            url: '#',
            size: 1048576, // 1MB
            type: 'application/pdf',
            uploadedAt: '2024-01-11T14:30:00Z',
            category: 'document',
          },
        ];

        setEventMedia(mockMedia);
      } catch (error) {
        console.error('Error loading media:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load event media.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadEventMedia();
  }, [eventId, toast]);

  if (!permissions.includes('action:create-event')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have permission to manage event media. Please contact your club admin.
        </p>
      </div>
    );
  }

  const handleMediaChange = (files: MediaFile[]) => {
    setEventMedia(files);
    // In a real app, you would save these changes to the backend
    toast({
      title: 'Media updated',
      description: 'Event media has been updated successfully.',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href={`/events/${eventId}/manage`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event Management
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Media Management
        </h1>
        <p className="text-muted-foreground">
          Manage images, documents, and other media files for your event.
        </p>
      </div>

      <MediaManager
        eventId={eventId}
        files={eventMedia}
        onFilesChange={handleMediaChange}
        maxFileSize={25} // Allow larger files for event management
        allowedTypes={[
          'image/*',
          '.pdf',
          '.doc',
          '.docx',
          '.txt',
          '.ppt',
          '.pptx',
          '.xls',
          '.xlsx',
          '.zip',
          '.rar'
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Media Usage Guidelines</CardTitle>
          <CardDescription>
            Best practices for event media management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Image Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use high-quality images (minimum 800x600px)</li>
              <li>• Recommended formats: JPG, PNG, WebP</li>
              <li>• Keep file sizes under 5MB for faster loading</li>
              <li>• Use descriptive file names</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Document Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Accepted formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX</li>
              <li>• Maximum file size: 25MB</li>
              <li>• Ensure documents are accessible and readable</li>
              <li>• Include version numbers in file names when applicable</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
