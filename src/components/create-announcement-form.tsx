'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Pin, AlertTriangle, Info, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import type { CreateAnnouncementPayload, Announcement } from '@/types/announcement';

const announcementSchema = z.object({
  title: z.string().min(1, 'Announcement title is required'),
  content: z.string().min(10, 'Announcement content must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['draft', 'published']),
  pinned: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface CreateAnnouncementFormProps {
  clubId: string;
  onSuccess?: (announcement: Announcement) => void;
  onCancel?: () => void;
}

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

// Mock API call - replace with actual API
const createAnnouncement = async (clubId: string, payload: CreateAnnouncementPayload): Promise<Announcement> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    id: `announcement-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: 'user-1',
    authorName: 'Club Admin',
    clubId,
    clubName: 'Mock Club',
    attachments: [],
  };
};

export default function CreateAnnouncementForm({ clubId, onSuccess, onCancel }: CreateAnnouncementFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      priority: 'medium',
      status: 'draft',
      pinned: false,
      tags: [],
    },
  });

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
    form.setValue('tags', updatedTags);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      setIsSubmitting(true);
      
      const payload: CreateAnnouncementPayload = {
        title: data.title,
        content: data.content,
        priority: data.priority,
        status: data.status,
        pinned: data.pinned || false,
        tags: tags.length > 0 ? tags : undefined,
      };

      const newAnnouncement = await createAnnouncement(clubId, payload);
      
      toast({
        title: 'Announcement Created',
        description: `${newAnnouncement.title} has been ${data.status === 'published' ? 'published' : 'saved as draft'}.`,
      });

      onSuccess?.(newAnnouncement);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create announcement. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priority = form.watch('priority');
  const PriorityIcon = priorityIcons[priority];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Create New Announcement</CardTitle>
        <CardDescription>
          Share important updates and information with your club members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Announcement Title *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="Enter announcement title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                {...form.register('content')}
                placeholder="Write your announcement content here..."
                rows={6}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>
          </div>

          {/* Priority and Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Priority Level</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(value) => form.setValue('priority', value as 'low' | 'medium' | 'high' | 'urgent')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      Low Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-yellow-500" />
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-red-500" />
                      Urgent
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 mt-2">
                <PriorityIcon className={`h-4 w-4 ${priorityColors[priority]}`} />
                <span className="text-sm text-muted-foreground capitalize">
                  {priority} priority announcement
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="pinned">Pin to Top</Label>
                <Switch
                  id="pinned"
                  checked={form.watch('pinned')}
                  onCheckedChange={(checked) => form.setValue('pinned', checked)}
                />
              </div>
              {form.watch('pinned') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Pin className="h-4 w-4" />
                  This announcement will be pinned to the top of the feed
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag (e.g., important, deadline, meeting)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Attachments */}
          <div>
            <Label>Attachments</Label>
            <div className="space-y-2">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-2">
                  <Label htmlFor="attachment-upload" className="cursor-pointer">
                    <span className="text-sm text-muted-foreground">
                      Click to upload files, or drag and drop
                    </span>
                  </Label>
                  <Input
                    id="attachment-upload"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Publication Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) => form.setValue('status', value as 'draft' | 'published')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Save as Draft</SelectItem>
                <SelectItem value="published">Publish Now</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {form.watch('status') === 'published' 
                ? 'This announcement will be immediately visible to all club members.'
                : 'Save as draft to publish later.'
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : form.watch('status') === 'published' ? 'Publish Announcement' : 'Save Draft'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
