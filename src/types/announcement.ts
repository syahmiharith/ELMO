export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  clubId: string;
  clubName: string;
  status: 'draft' | 'published' | 'archived';
  pinned: boolean;
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published';
  pinned?: boolean;
  tags?: string[];
}

export interface UpdateAnnouncementPayload extends Partial<CreateAnnouncementPayload> {
  status?: 'draft' | 'published' | 'archived';
}

export interface AnnouncementQuery {
  clubId?: string;
  status?: 'draft' | 'published' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  pinned?: boolean;
  page?: number;
  pageSize?: number;
}
