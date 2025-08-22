

/**
 * @file This file contains mock data for local development.
 * It is the single source of truth for all placeholder content.
 */
import type { Club, Event, Order, Ticket, User, Membership, ClubFile, Announcement, Feedback, Proposal, Comment, Policy, ActivityLogEntry } from '@/types/domain';
import { ulid } from 'ulid';

const newId = (prefix: string) => `${prefix}_${ulid()}`;
const newOrderId = (date = new Date()) => {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `ord_${ymd}_${ulid()}`.toUpperCase();
}
const nowISO = () => new Date().toISOString();

// A single, stable user for the initial render to prevent hydration errors.
// A random user will be generated on the client-side in the AuthProvider.
const MOCK_USERS: User[] = [
    {
        id: 'usr_default_nami',
        name: 'Nami',
        email: 'elmo-terbakar@gmail.com',
        avatarUrl: 'https://placehold.co/100x100.png',
        firstName: 'Nami',
        lastName: '',
        phone: '(555) 123-4567',
        universityName: 'Pokok',
        studentId: '987654321',
        address: {
            street: '1 Istana',
            city: 'Kerajaan Langit',
            state: 'Besut',
            zip: '22200',
            country: 'my',
        },
        isPersonalized: true,
    },
    {
        id: 'usr_admin_alex',
        name: 'Alex Doe',
        email: 'alex.doe@university.edu',
        avatarUrl: 'https://placehold.co/100x100.png',
        firstName: 'Alex',
        lastName: 'Doe',
        phone: '(555) 555-5555',
        universityName: 'Nexus University',
        studentId: '555555555',
        address: {
            street: '789 Admin Way',
            city: 'Metropolis',
            state: 'California',
            zip: '90210',
            country: 'us',
        },
        isPersonalized: true,
    },
    {
        id: 'usr_test_ben',
        name: 'Ben Carter',
        email: 'ben.carter@university.edu',
        avatarUrl: 'https://placehold.co/100x100.png',
        firstName: 'Ben',
        lastName: 'Carter',
        phone: '(555) 234-5678',
        universityName: 'Nexus University',
        studentId: '123456789',
        address: {
            street: '456 College Rd',
            city: 'Metropolis',
            state: 'California',
            zip: '90210',
            country: 'us',
        },
        isPersonalized: false,
    },
    {
        id: 'usr_test_casey',
        name: 'Casey Day',
        email: 'casey.day@university.edu',
        avatarUrl: 'https://placehold.co/100x100.png',
        firstName: 'Casey',
        lastName: 'Day',
        phone: '(555) 345-6789',
        universityName: 'Quantum State',
        studentId: '234567890',
        address: {
            street: '789 Quantum Blvd',
            city: 'Quantum Valley',
            state: 'New York',
            zip: '10001',
            country: 'us',
        },
        isPersonalized: true,
    }
];


const clubData = [
  { id: 'club_innovate', name: 'Innovate & Create Club', category: 'Technology', featured: true, content: 'This is the place where creativity meets technology.' },
  { id: 'club_debate', name: 'Debate Society', category: 'Arts & Culture', featured: false, content: 'Engage in stimulating discussions.' },
  { id: 'club_esports', name: 'E-Sports Arena', category: 'Sports & Recreation', featured: true, content: 'Join the top gamers on campus.' },
  { id: 'club_green', name: 'Green Thumb Society', category: 'Community & Service', featured: false, content: 'Help us make the campus a greener place.' },
  { id: 'club_film', name: 'Film Critics Circle', category: 'Arts & Culture', featured: false, content: 'Share your love for cinema.' },
  { id: 'club_startup', name: 'Startup Hub', category: 'Academic & Professional', featured: true, content: 'Your journey from idea to IPO starts here.' },
];

const MOCK_CLUBS: Club[] = clubData.map(c => ({
    id: c.id,
    name: c.name,
    category: c.category,
    description: `${c.content} A community for students to connect, learn, and grow together.`,
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 0, // Will be calculated
    isFeatured: c.featured,
    announcements: [],
    membershipType: 'open',
    featuredContent: {
        title: `Welcome to the ${c.name}!`,
        content: c.content
    }
}));

// Add PPMK club
MOCK_CLUBS.unshift({
    id: 'club_ppmk',
    name: 'PPMK',
    category: 'Official',
    description: 'Official space for PPMK administration and announcements.',
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 1,
    isFeatured: true,
    announcements: [],
    membershipType: 'invite-only',
    featuredContent: {
        title: 'PPMK Administration',
        content: 'This is the official space for PPMK-related activities.'
    }
});


const eventTitles = ['Workshop', 'Seminar', 'Competition', 'Social Mixer', 'Guest Speaker', 'Hackathon', 'Fundraiser', 'Exhibition', 'Screening', 'Tournament'];
const eventLocations = ['Grand Auditorium', 'Student Union', 'Library Hall', 'Innovation Hub', 'Quad', 'Lecture Hall 3B', 'Online', 'E-Sports Arena'];

type RawEvent = Omit<Event, 'club'>;

const generateEvents = (count: number): Event[] => {
    const events: Event[] = [];
    for (let i = 0; i < count; i++) {
        const club = MOCK_CLUBS[Math.floor(Math.random() * MOCK_CLUBS.length)];
        const isPaid = Math.random() > 0.6;
        const price = isPaid ? Math.floor(Math.random() * 50) * 100 + 500 : 0;
        const date = new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);
        events.push({
            id: newId('evt'),
            name: `${club.name} ${eventTitles[Math.floor(Math.random() * eventTitles.length)]}`,
            clubId: club.id,
            date: date.toISOString(),
            location: eventLocations[Math.floor(Math.random() * eventLocations.length)],
            description: `Join us for an exciting event focused on our club's activities. A great opportunity to learn, network, and have fun.`,
            imageUrl: 'https://placehold.co/600x400.png',
            status: 'available',
            highlights: ['Networking', 'Learning', 'Fun'],
            rsvpFlow: isPaid ? 'PAID' : 'FREE',
            price: price,
            viewerRsvpStatus: 'none',
            rsvpCount: Math.floor(Math.random() * 200),
        });
    }
    return events;
}

const MOCK_EVENTS: Event[] = generateEvents(25);

const MOCK_MEMBERSHIPS: Membership[] = [
    // Nami (usr_default_nami) - PPMK
    { clubId: 'club_innovate', userId: 'usr_default_nami', status: 'approved', role: 'Admin', joinedAt: nowISO() },
    { clubId: 'club_debate', userId: 'usr_default_nami', status: 'approved', role: 'Member', joinedAt: nowISO() },
    { clubId: 'club_esports', userId: 'usr_default_nami', status: 'approved', role: 'Member', joinedAt: nowISO() },
    { clubId: 'club_ppmk', userId: 'usr_default_nami', status: 'approved', role: 'Member', joinedAt: nowISO() },
    { clubId: 'club_green', userId: 'usr_default_nami', status: 'pending', role: 'Member', joinedAt: nowISO() },

    // Alex Doe (usr_admin_alex) - Club Admin
    { clubId: 'club_startup', userId: 'usr_admin_alex', status: 'approved', role: 'Admin', joinedAt: nowISO() },
    { clubId: 'club_esports', userId: 'usr_admin_alex', status: 'approved', role: 'Member', joinedAt: nowISO() },
    
    // Other users' memberships
    { clubId: 'club_innovate', userId: MOCK_USERS[2].id, status: 'approved', role: 'Member', joinedAt: nowISO() },
    { clubId: 'club_innovate', userId: MOCK_USERS[3].id, status: 'pending', role: 'Member', joinedAt: nowISO() },
    { clubId: 'club_startup', userId: MOCK_USERS[2].id, status: 'approved', role: 'Member', joinedAt: nowISO() },
    { clubId: 'club_esports', userId: MOCK_USERS[3].id, status: 'approved', role: 'Admin', joinedAt: nowISO() },
];


const MOCK_ORDERS: Order[] = [];
const MOCK_TICKETS: Ticket[] = [];

// Only generate orders for the default user
const user = MOCK_USERS[0];
const numEvents = 3;
const eventIndices = new Set<number>();
while (eventIndices.size < numEvents) {
    eventIndices.add(Math.floor(Math.random() * MOCK_EVENTS.length));
}

eventIndices.forEach(eventIndex => {
    const event = MOCK_EVENTS[eventIndex];
    const orderId = newOrderId();
    const order: Order = {
        id: orderId,
        userId: user.id,
        eventId: event.id,
        clubId: event.clubId,
        itemName: `${event.name} Ticket`,
        total: event.price,
        status: 'paid',
        createdAt: nowISO(),
    };
    MOCK_ORDERS.push(order);

    const ticket: Ticket = {
        id: newId('tck'),
        orderId,
        userId: user.id,
        event: {
            id: event.id,
            name: event.name,
            date: event.date,
            location: event.location,
            price: event.price,
        },
        qrCodeUrl: 'https://placehold.co/150x150.png',
        status: 'issued',
        issuedAt: nowISO(),
    };
    MOCK_TICKETS.push(ticket);
});

// Add an order that is "under_review" for testing the approvals page
const reviewEvent = MOCK_EVENTS.find(e => e.clubId === 'club_innovate' && e.price > 0);
if (reviewEvent) {
    const reviewOrder: Order = {
        id: newOrderId(),
        userId: MOCK_USERS[2].id, // Ben Carter is buying
        clubId: reviewEvent.clubId,
        eventId: reviewEvent.id,
        itemName: `${reviewEvent.name} Ticket (x1)`,
        total: reviewEvent.price,
        status: 'under_review',
        createdAt: nowISO(),
        receiptUrl: 'https://placehold.co/300x400.png',
    };
    MOCK_ORDERS.push(reviewOrder);
}


const MOCK_FILES: ClubFile[] = [
    {
        id: newId('file'),
        clubId: MOCK_CLUBS[0].id,
        name: 'Project Phoenix - Initial Proposal.pdf',
        url: '#',
        permission: 'member_only',
        uploadedAt: '2024-10-01T10:00:00Z',
        uploaderId: MOCK_USERS[0].id,
    },
    {
        id: newId('file'),
        clubId: MOCK_CLUBS[0].id,
        name: 'Club Budget Q4 2024.xlsx',
        url: '#',
        permission: 'admin_only',
        uploadedAt: '2024-10-02T14:30:00Z',
        uploaderId: MOCK_USERS[0].id,
    },
    {
        id: newId('file'),
        clubId: MOCK_CLUBS[0].id,
        name: 'General Meeting Minutes - Sep 2024.docx',
        url: '#',
        permission: 'member_only',
        uploadedAt: '2024-09-30T18:00:00Z',
        uploaderId: MOCK_USERS[0].id,
    }
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
    {
        id: newId('ann'),
        clubId: MOCK_CLUBS[0].id,
        title: 'Welcome to the New Semester!',
        content: 'We are excited to kick off another great semester. Our first meeting will be next Tuesday at 7 PM in the main hall. We have a lot of exciting projects planned, so don\'t miss it!',
        author: { id: MOCK_USERS[0].id, name: MOCK_USERS[0].name, avatarUrl: MOCK_USERS[0].avatarUrl },
        createdAt: '2024-09-01T12:00:00Z',
    },
    {
        id: newId('ann'),
        clubId: MOCK_CLUBS[0].id,
        title: 'Call for Project Ideas',
        content: 'Have a cool project idea you want to work on? Submit your proposals by the end of the week. The best ideas will be selected for our semester-long build cycle.',
        author: { id: MOCK_USERS[0].id, name: MOCK_USERS[0].name, avatarUrl: MOCK_USERS[0].avatarUrl },
        createdAt: '2024-09-05T15:30:00Z',
    }
];
// Add announcements back to the club
MOCK_CLUBS[1].announcements = MOCK_ANNOUNCEMENTS;


const MOCK_FEEDBACK: Feedback[] = [
    {
        id: newId('fb'),
        clubId: MOCK_CLUBS[1].id,
        authorId: MOCK_USERS[0].id,
        anonymous: false,
        audience: 'admin',
        title: 'Website Bug Report',
        body: 'The events page on the club website is not loading correctly on mobile.',
        category: 'bug',
        status: 'open',
        createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
        updatedAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
    }
];

const MOCK_PROPOSALS: Proposal[] = [
    {
        id: newId('prp'),
        clubId: MOCK_CLUBS[1].id,
        proposerId: MOCK_USERS[0].id, // An admin
        type: 'event',
        summary: 'Proposal for a 24-hour hackathon next semester.',
        details: 'This document outlines the plan, budget, and logistics for hosting a university-wide hackathon.',
        attachments: [],
        status: 'under_review',
        requiredApprovers: ['super_admin'],
        approvals: [],
        createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
        updatedAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
    }
];

const MOCK_COMMENTS: Record<string, Comment[]> = {
    [MOCK_FEEDBACK[0].id]: [
        {
            id: newId('cmt'),
            authorId: MOCK_USERS[0].id,
            body: 'Thanks for the report! We are looking into this.',
            createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
        }
    ]
};

const MOCK_POLICIES: Policy[] = [
    {
        id: newId('pol'),
        title: 'University Code of Conduct',
        content: 'This document outlines the expected standards of behavior for all students and faculty. It covers academic integrity, respect for others, and responsible use of university resources.',
        status: 'published',
        authorId: 'usr_default_nami',
        category: 'general',
        scope: 'global',
        createdAt: '2023-08-15T09:00:00Z',
        updatedAt: '2024-01-20T11:30:00Z',
    },
    {
        id: newId('pol'),
        title: 'Club Financial Guidelines',
        content: 'All student clubs must adhere to these financial procedures for budgeting, spending, and reimbursement. This ensures transparency and responsible use of student activity funds.',
        status: 'published',
        authorId: 'usr_default_nami',
        category: 'finance',
        scope: 'university',
        createdAt: '2023-09-01T10:00:00Z',
        updatedAt: '2023-09-01T10:00:00Z',
    },
    {
        id: newId('pol'),
        title: 'Event Space Booking Policy (Draft)',
        content: 'This is a draft for a new, streamlined process for booking event spaces on campus. Please review and provide feedback before it is finalized.',
        status: 'draft',
        authorId: 'usr_default_nami',
        category: 'events',
        scope: 'university',
        createdAt: '2024-05-10T16:00:00Z',
        updatedAt: '2024-05-15T11:20:00Z',
    },
    {
        id: newId('pol'),
        title: 'Old Social Media Guidelines',
        content: 'These are the old guidelines for social media use. They have been archived and replaced by the new Digital Communcations Policy.',
        status: 'archived',
        authorId: 'usr_default_nami',
        category: 'general',
        scope: 'global',
        createdAt: '2022-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
    }
];

const MOCK_ACTIVITY_LOG: ActivityLogEntry[] = [
    {
        id: newId('log'),
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        actor: { id: 'usr_default_nami', name: 'Nami', role: 'Club Admin' },
        action: 'APPROVED_MEMBERSHIP',
        target: { id: 'usr_test_casey', name: 'Casey Day', url: '/profile/usr_test_casey' },
        details: { club: 'Innovate & Create Club' },
        status: 'SUCCESS',
    },
    {
        id: newId('log'),
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        actor: { id: 'usr_default_nami', name: 'Nami', role: 'PPMK' },
        action: 'UPDATED_POLICY',
        target: { id: MOCK_POLICIES[0].id, name: MOCK_POLICIES[0].title, url: '/admin/policy' },
        details: { changes: 'Updated content regarding AI usage.' },
        status: 'SUCCESS',
    },
    {
        id: newId('log'),
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        actor: { id: MOCK_USERS[1].id, name: MOCK_USERS[1].name, role: 'Club Admin' },
        action: 'ARCHIVED_CLUB',
        target: { id: 'club_film', name: 'Film Critics Circle', url: '/clubs/club_film' },
        details: { reason: 'Club is inactive for over a year.' },
        status: 'SUCCESS',
    },
];


// Update member counts after generating memberships
MOCK_CLUBS.forEach(club => {
    club.memberCount = MOCK_MEMBERSHIPS.filter(m => m.clubId === club.id && m.status === 'approved').length;
});


export const MOCK_DATA = {
  clubs: MOCK_CLUBS,
  events: MOCK_EVENTS,
  orders: MOCK_ORDERS,
  tickets: MOCK_TICKETS,
  users: MOCK_USERS,
  memberships: MOCK_MEMBERSHIPS,
  files: MOCK_FILES,
  feedback: MOCK_FEEDBACK,
  proposals: MOCK_PROPOSALS,
  comments: MOCK_COMMENTS,
  policies: MOCK_POLICIES,
  activityLog: MOCK_ACTIVITY_LOG,
};
