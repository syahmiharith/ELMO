'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Upload, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MediaManager from '@/components/media-manager';

import type { UpdateEventPayload, Event } from '@/types/domain';
import { updateEvent, cancelEvent } from '@/lib/api';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  category: 'image' | 'document' | 'other';
}

const eventSchema = z.object({
  name: z.string().min(1, 'Event title is required'),
  description: z.string().min(10, 'Event description must be at least 10 characters'),
  date: z.date({
    required_error: 'Please select a date for the event',
  }),
  time: z.string().min(1, 'Please select a time'),
  location: z.string().min(1, 'Location is required'),
  highlights: z.array(z.string()).optional(),
  rsvpFlow: z.enum(['FREE', 'PAID']),
  price: z.number().min(0, 'Price cannot be negative'),
  status: z.enum(['scheduled', 'draft', 'canceled']),
  imageUrl: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EditEventFormProps {
  event: Event;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}

export default function EditEventForm({ event, onSuccess, onCancel, onDelete }: EditEventFormProps) {
  const [highlights, setHighlights] = useState<string[]>(event.highlights || []);
  const [newHighlight, setNewHighlight] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event.name,
      description: event.description,
      location: event.location,
      highlights: event.highlights || [],
      rsvpFlow: event.rsvpFlow,
      price: event.price / 100, // Convert from cents to dollars
      status: event.status as 'scheduled' | 'draft' | 'canceled',
      imageUrl: event.imageUrl,
      date: new Date(event.date),
      time: new Date(event.date).toTimeString().slice(0, 5), // Extract HH:MM
    },
  });

  useEffect(() => {
    setHighlights(event.highlights || []);
  }, [event.highlights]);

  const addHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      const updatedHighlights = [...highlights, newHighlight.trim()];
      setHighlights(updatedHighlights);
      form.setValue('highlights', updatedHighlights);
      setNewHighlight('');
    }
  };

  const removeHighlight = (index: number) => {
    const updatedHighlights = highlights.filter((_, i) => i !== index);
    setHighlights(updatedHighlights);
    form.setValue('highlights', updatedHighlights);
  };

  const handleMediaFilesChange = (files: MediaFile[]) => {
    setMediaFiles(files);
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const [hours, minutes] = data.time.split(':');
      const eventDate = new Date(data.date);
      eventDate.setHours(parseInt(hours), parseInt(minutes));

      const payload: UpdateEventPayload = {
        name: data.name,
        description: data.description,
        date: eventDate.toISOString(),
        location: data.location,
        highlights: highlights.length > 0 ? highlights : undefined,
        rsvpFlow: data.rsvpFlow,
        price: data.rsvpFlow === 'PAID' ? Math.round(data.price * 100) : 0, // Convert to cents
        status: data.status,
        imageUrl: data.imageUrl,
      };

      const updatedEvent = await updateEvent(event.id, payload);
      
      toast({
        title: 'Event Updated',
        description: `${updatedEvent.name} has been updated successfully.`,
      });

      onSuccess?.(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update event. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      setIsDeleting(true);
      await cancelEvent(event.id);
      
      toast({
        title: 'Event Deleted',
        description: `${event.name} has been deleted successfully.`,
      });

      onDelete?.();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Edit Event</CardTitle>
            <CardDescription>
              Update the details for {event.name}
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the event
                  "{event.name}" and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEvent} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete Event'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Event Title *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter event title"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">About This Event *</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Describe your event, what attendees can expect, and any important details..."
                rows={4}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !form.watch('date') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch('date') ? (
                      format(form.watch('date'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <VisuallyHidden>
                    <h2>Choose event date</h2>
                  </VisuallyHidden>
                  <Calendar
                    mode="single"
                    selected={form.watch('date')}
                    onSelect={(date) => form.setValue('date', date!)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.date.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                {...form.register('time')}
              />
              {form.formState.errors.time && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.time.message}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...form.register('location')}
              placeholder="Event venue or address"
            />
            {form.formState.errors.location && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.location.message}
              </p>
            )}
          </div>

          {/* Highlights */}
          <div>
            <Label>Event Highlights</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  placeholder="Add a highlight (e.g., Free pizza, Guest speaker)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                />
                <Button type="button" onClick={addHighlight} variant="outline">
                  Add
                </Button>
              </div>
              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {highlight}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeHighlight(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fee Structure */}
          <div className="space-y-4">
            <Label>Fee Structure</Label>
            <RadioGroup
              value={form.watch('rsvpFlow')}
              onValueChange={(value) => form.setValue('rsvpFlow', value as 'FREE' | 'PAID')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FREE" id="free" />
                <Label htmlFor="free">Free Event</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PAID" id="paid" />
                <Label htmlFor="paid">Paid Event</Label>
              </div>
            </RadioGroup>

            {form.watch('rsvpFlow') === 'PAID' && (
              <div className="ml-6">
                <Label htmlFor="price">Price (in dollars)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <MediaManager
            eventId={event.id}
            files={mediaFiles}
            onFilesChange={handleMediaFilesChange}
            maxFileSize={10}
            allowedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt']}
          />

          {/* Status */}
          <div>
            <Label>Event Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as 'scheduled' | 'draft' | 'canceled')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Save as Draft</SelectItem>
                <SelectItem value="scheduled">Publish Event</SelectItem>
                <SelectItem value="canceled">Cancel Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
