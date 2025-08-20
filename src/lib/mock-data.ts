
/**
 * @file This file contains mock data for local development.
 * It is the single source of truth for all placeholder content.
 */
import type { Club, Event, Order, Ticket, User, Membership } from '@/types/domain';

// A generic user for mock data
const MOCK_USER: User = {
  id: 'user-1',
  name: 'Jane Doe',
  email: 'user@university.edu',
  avatarUrl: 'https://placehold.co/100x100.png',
  firstName: 'Jane',
  lastName: 'Doe',
  phone: '(123) 456-7890',
  universityName: 'Nexus University',
  studentId: '123456789',
  address: {
      street: '123 University Ave',
      city: 'Metropolis',
      state: 'California',
      zip: '90210',
      country: 'us',
  },
  isPersonalized: false, // Start with false to show the nudge
};

const MOCK_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'Innovate & Create Club',
    category: 'Technology',
    description: 'A place for tech enthusiasts to collaborate on projects and explore new technologies.',
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 128,
    isFeatured: true,
  },
  {
    id: 'club-2',
    name: 'Debate Society',
    category: 'Arts & Culture',
    description: 'Sharpen your public speaking and critical thinking skills with us.',
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 75,
    isFeatured: false,
  },
  {
    id: 'club-3',
    name: 'E-Sports Arena',
    category: 'Sports & Recreation',
    description: 'Competitive gaming and casual play for all skill levels.',
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 250,
    isFeatured: true,
  },
  {
    id: 'club-4',
    name: 'Green Thumb Society',
    category: 'Community & Service',
    description: 'Promoting sustainability and campus beautification through gardening.',
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 45,
    isFeatured: false,
  },
  {
    id: 'club-5',
    name: 'Film Critics Circle',
    category: 'Arts & Culture',
    description: 'Watch, discuss, and analyze films from all genres and eras.',
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 88,
    isFeatured: false,
  },
  {
    id: 'club-6',
    name: 'Startup Hub',
    category: 'Academic & Professional',
    description: 'Connect with aspiring entrepreneurs and build the next big thing.',
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 150,
    isFeatured: true,
  },
];

const MOCK_EVENTS: Event[] = [
  {
    id: 'event-1',
    name: 'Annual Tech Summit',
    club: { id: 'club-1', name: 'Innovate & Create Club' },
    date: '2024-10-26T10:00:00Z',
    location: 'Grand Auditorium',
    description: 'Featuring keynote speakers from top tech companies and workshops on AI, blockchain, and more.',
    imageUrl: 'https://placehold.co/600x400.png',
    status: 'hot',
    highlights: ['Keynote speakers', 'AI workshops', 'Networking'],
    rsvpFlow: 'PAID',
    price: 5000, // $50.00
    viewerRsvpStatus: 'attending',
    rsvpCount: 212,
  },
  {
    id: 'event-2',
    name: 'Charity Bake Sale',
    club: { id: 'club-4', name: 'Green Thumb Society' },
    date: '2024-11-05T12:00:00Z',
    location: 'Student Union Plaza',
    description: 'Delicious treats for a good cause. All proceeds go to local community gardens.',
    imageUrl: 'https://placehold.co/600x400.png',
    status: 'available',
    highlights: ['For a cause', 'Delicious food'],
    rsvpFlow: 'FREE',
    price: 0,
    viewerRsvpStatus: 'interested',
    rsvpCount: 88,
  },
  {
    id: 'event-3',
    name: 'Gaming Tournament: Nexus Legends',
    club: { id: 'club-3', name: 'E-Sports Arena' },
    date: '2024-11-15T18:00:00Z',
    location: 'E-Sports Arena, Building C',
    description: 'Compete for glory and prizes in our biggest tournament of the year.',
    imageUrl: 'https://placehold.co/600x400.png',
    status: 'available',
    highlights: ['Prizes', 'Free to play', 'Competitive'],
    rsvpFlow: 'FREE',
    price: 0,
    viewerRsvpStatus: 'none',
    rsvpCount: 150,
  },
  {
    id: 'event-4',
    name: 'Classic Cinema Night: Sci-Fi',
    club: { id: 'club-5', name: 'Film Critics Circle' },
    date: '2024-11-20T19:00:00Z',
    location: 'Lecture Hall 3B',
    description: 'A screening and discussion of a classic science fiction masterpiece.',
    imageUrl: 'https://placehold.co/600x400.png',
    status: 'hot',
    highlights: ['Free popcorn', 'Discussion panel'],
    rsvpFlow: 'FREE',
    price: 0,
    viewerRsvpStatus: 'attending',
    rsvpCount: 180,
  },
  {
    id: 'event-5',
    name: 'Entrepreneurship Pitch Night',
    club: { id: 'club-6', name: 'Startup Hub' },
    date: '2024-11-28T19:00:00Z',
    location: 'Innovation Hall',
    description: 'Present your startup ideas to a panel of judges and potential investors.',
    imageUrl: 'https://placehold.co/600x400.png',
    status: 'available',
    highlights: ['Pitch competition', 'Networking', 'Investor panel'],
    rsvpFlow: 'FREE',
    price: 0,
    viewerRsvpStatus: 'none',
    rsvpCount: 95,
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    userId: MOCK_USER.id,
    eventId: null,
    itemName: 'Club Membership Fee',
    createdAt: '2024-09-01T10:00:00Z',
    total: 2500,
    status: 'paid',
  },
  {
    id: 'ORD-002',
    userId: MOCK_USER.id,
    eventId: 'event-1',
    itemName: 'Tech Summit Ticket',
    createdAt: '2024-09-15T11:00:00Z',
    total: 5000,
    status: 'paid',
  },
  {
    id: 'ORD-003',
    userId: MOCK_USER.id,
    eventId: null,
    itemName: 'E-Sports Jersey',
    createdAt: '2024-09-20T14:00:00Z',
    total: 4500,
    status: 'awaiting_payment',
  },
  {
    id: 'ORD-004',
    userId: MOCK_USER.id,
    eventId: 'event-1',
    itemName: 'Workshop Material Fee',
    createdAt: '2024-10-02T09:00:00Z',
    total: 1500,
    status: 'paid',
  },
  {
    id: 'ORD-005',
    userId: MOCK_USER.id,
    eventId: null,
    itemName: 'Charity Donation',
    createdAt: '2024-10-05T13:00:00Z',
    total: 2000,
    status: 'under_review',
  },
];

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TKT-001',
    orderId: 'ORD-002',
    userId: MOCK_USER.id,
    event: {
      id: 'event-1',
      name: 'Annual Tech Summit',
      date: '2024-10-26T10:00:00Z',
      location: 'Grand Auditorium, Seat A12',
    },
    qrCodeUrl: 'https://placehold.co/150x150.png',
    status: 'issued',
    issuedAt: '2024-09-15T11:00:01Z',
  },
  {
    id: 'TKT-002',
    orderId: 'ORD-00X', // Fictional order for free event
    userId: MOCK_USER.id,
    event: {
      id: 'event-4',
      name: 'Classic Cinema Night: Sci-Fi',
      date: '2024-11-20T19:00:00Z',
      location: 'Lecture Hall 3B, General Admission',
    },
    qrCodeUrl: 'https://placehold.co/150x150.png',
    status: 'issued',
    issuedAt: '2024-09-18T11:00:01Z',
  },
];

const MOCK_MEMBERSHIPS: Membership[] = [
  { clubId: 'club-1', userId: MOCK_USER.id, status: 'approved', joinedAt: '2024-09-01T10:00:00Z' },
  { clubId: 'club-2', userId: MOCK_USER.id, status: 'approved', joinedAt: '2024-09-02T10:00:00Z' },
  { clubId: 'club-3', userId: MOCK_USER.id, status: 'pending', joinedAt: '2024-09-03T10:00:00Z' },
];

export const MOCK_DATA = {
  clubs: MOCK_CLUBS,
  events: MOCK_EVENTS,
  orders: MOCK_ORDERS,
  tickets: MOCK_TICKETS,
  users: [MOCK_USER],
  memberships: MOCK_MEMBERSHIPS,
};
