'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, Upload, X } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import MediaManager from '@/components/media-manager';

import type { CreateEventPayload, Event } from '@/types/domain';
import { createEvent } from '@/lib/api';

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
  status: z.enum(['scheduled', 'draft']),
  imageUrl: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  clubId: string;
  onSuccess?: (event: Event) => void;
  onCancel?: () => void;
}

export default function CreateEventForm({ clubId, onSuccess, onCancel }: CreateEventFormProps) {
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      highlights: [],
      rsvpFlow: 'FREE',
      price: 0,
      status: 'draft',
      imageUrl: '',
    },
  });

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

      const payload: CreateEventPayload = {
        name: data.name,
        description: data.description,
        date: eventDate.toISOString(),
        location: data.location,
        highlights: highlights.length > 0 ? highlights : undefined,
        rsvpFlow: data.rsvpFlow,
        price: data.rsvpFlow === 'PAID' ? Math.round(data.price * 100) : 0, // Convert to cents
        status: data.status,
        imageUrl: data.imageUrl || 'https://placehold.co/400x200.png', // Default placeholder
        rsvpCount: 0,
      };

      const newEvent = await createEvent(clubId, payload);
      
      toast({
        title: 'Event Created',
        description: `${newEvent.name} has been created successfully.`,
      });

      onSuccess?.(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create event. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>
          Fill in the details to create a new event for your club.
        </CardDescription>
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
              onValueChange={(value) => form.setValue('status', value as 'scheduled' | 'draft')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Save as Draft</SelectItem>
                <SelectItem value="scheduled">Publish Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
