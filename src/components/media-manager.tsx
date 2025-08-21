'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image, FileText, Download, Eye, Trash2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  category: 'image' | 'document' | 'other';
}

interface MediaManagerProps {
  eventId?: string;
  files: MediaFile[];
  onFilesChange: (files: MediaFile[]) => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
}

export default function MediaManager({ 
  eventId, 
  files, 
  onFilesChange, 
  maxFileSize = 10,
  allowedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.gif'],
  className 
}: MediaManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileCategory = (type: string): 'image' | 'document' | 'other' => {
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf') || type.includes('doc') || type.includes('text')) return 'document';
    return 'other';
  };

  const getFileIcon = (category: 'image' | 'document' | 'other') => {
    switch (category) {
      case 'image':
        return Image;
      case 'document':
        return FileText;
      default:
        return FileText;
    }
  };

  const handleFileUpload = async (selectedFiles: FileList | File[]) => {
    setUploading(true);
    
    try {
      const newFiles: MediaFile[] = [];
      
      for (const file of Array.from(selectedFiles)) {
        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          toast({
            variant: 'destructive',
            title: 'File too large',
            description: `${file.name} exceeds the ${maxFileSize}MB limit.`,
          });
          continue;
        }

        // Validate file type
        const isAllowed = allowedTypes.some(type => {
          if (type.includes('*')) {
            return file.type.startsWith(type.replace('*', ''));
          }
          return file.name.toLowerCase().endsWith(type) || file.type === type;
        });

        if (!isAllowed) {
          toast({
            variant: 'destructive',
            title: 'Invalid file type',
            description: `${file.name} is not an allowed file type.`,
          });
          continue;
        }

        // Create URL for preview (in real app, upload to cloud storage)
        const url = URL.createObjectURL(file);
        
        const mediaFile: MediaFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          category: getFileCategory(file.type),
        };

        newFiles.push(mediaFile);
      }

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles]);
        toast({
          title: 'Files uploaded',
          description: `${newFiles.length} file(s) uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
    toast({
      title: 'File deleted',
      description: 'File has been removed successfully.',
    });
  };

  const handlePreview = (file: MediaFile) => {
    if (file.category === 'image') {
      // Open image in new tab for preview
      window.open(file.url, '_blank');
    } else {
      // For documents, trigger download
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Media & Files
          </CardTitle>
          <CardDescription>
            Upload images, documents, and other files for your event. Max size: {maxFileSize}MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
              uploading && 'opacity-50 pointer-events-none'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="region"
            aria-label="File upload area"
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: Images, PDFs, Documents ({allowedTypes.join(', ')})
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={uploading}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Choose files to upload"
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
            <CardDescription>
              Manage your event media and attachments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.category);
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {file.category === 'image' ? (
                          <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size)}</span>
                          <Badge variant="outline" className="text-xs">
                            {file.category}
                          </Badge>
                          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(file)}
                        aria-label={file.category === 'image' ? `Preview ${file.name}` : `Download ${file.name}`}
                      >
                        {file.category === 'image' ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Delete ${file.name}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete File</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{file.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteFile(file.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
