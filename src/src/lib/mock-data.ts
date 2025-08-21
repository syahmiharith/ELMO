
/**
 * @file This file contains mock data for local development.
 * It is the single source of truth for all placeholder content.
 */
import type { Club, Event, Order, Ticket, User, Membership, ClubFile, Announcement, Feedback, Proposal, Comment } from '@/types/domain';
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
        id: 'usr_default',
        name: 'Alex Doe',
        email: 'alex.doe@university.edu',
        avatarUrl: 'https://placehold.co/100x100.png',
        firstName: 'Alex',
        lastName: 'Doe',
        phone: '(555) 123-4567',
        universityName: 'Nexus University',
        studentId: '987654321',
        address: {
            street: '123 University Ave',
            city: 'Metropolis',
            state: 'California',
            zip: '90210',
            country: 'us',
        },
        isPersonalized: true,
    }
];


const clubData = [
  { name: 'Innovate & Create Club', category: 'Technology', featured: true, content: 'This is the place where creativity meets technology.' },
  { name: 'Debate Society', category: 'Arts & Culture', featured: false, content: 'Engage in stimulating discussions.' },
  { name: 'E-Sports Arena', category: 'Sports & Recreation', featured: true, content: 'Join the top gamers on campus.' },
  { name: 'Green Thumb Society', category: 'Community & Service', featured: false, content: 'Help us make the campus a greener place.' },
  { name: 'Film Critics Circle', category: 'Arts & Culture', featured: false, content: 'Share your love for cinema.' },
  { name: 'Startup Hub', category: 'Academic & Professional', featured: true, content: 'Your journey from idea to IPO starts here.' },
  { name: 'Outdoor Adventures', category: 'Sports & Recreation', featured: false, content: 'Explore the great outdoors with us.' },
  { name: 'AI & Robotics Group', category: 'Technology', featured: true, content: 'Building the future of AI and robotics.' },
  { name: 'Volunteer Network', category: 'Community & Service', featured: true, content: 'Making a difference in our local community.' },
  { name: 'Photography Club', category: 'Arts & Culture', featured: false, content: 'Capture moments and tell stories.' },
  { name: 'Future Leaders Association', category: 'Academic & Professional', featured: false, content: 'Develop your leadership skills.' },
  { name: 'Yoga & Wellness', category: 'Sports & Recreation', featured: false, content: 'Find your balance and inner peace.' },
  { name: 'Culinary Arts Society', category: 'Arts & Culture', featured: true, content: 'Explore different cuisines with us.' },
  { name: 'Code for Good', category: 'Technology', featured: false, content: 'Using technology to solve social problems.' },
  { name: 'Investment Group', category: 'Academic & Professional', featured: false, content: 'Learn about financial markets.' },
];

const MOCK_CLUBS: Club[] = clubData.map(c => ({
    id: newId('clb'),
    name: c.name,
    category: c.category,
    description: `${c.content} A community for students to connect, learn, and grow together.`,
    imageUrl: 'https://placehold.co/600x400.png',
    memberCount: 0, // Will be calculated
    isFeatured: c.featured,
    announcements: [],
    featuredContent: {
        title: `Welcome to the ${c.name}!`,
        content: c.content
    }
}));


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

const generateMemberships = (): Membership[] => {
    const memberships: Membership[] = [];
    // Only generate memberships for the default user
    const user = MOCK_USERS[0];
    const numClubs = 5;
    const clubIndices = new Set<number>();
    while(clubIndices.size < numClubs) {
        clubIndices.add(Math.floor(Math.random() * MOCK_CLUBS.length));
    }

    clubIndices.forEach(clubIndex => {
        const club = MOCK_CLUBS[clubIndex];
        memberships.push({
            clubId: club.id,
            userId: user.id,
            status: 'approved',
            role: 'Member',
            joinedAt: nowISO(),
        });
    });

    // Assign some admins (2 per club)
    MOCK_CLUBS.forEach(club => {
        const potentialAdmins = memberships.filter(m => m.clubId === club.id);
        if (potentialAdmins.length > 0) {
            potentialAdmins[0].role = 'Admin';
        }
    });
    
    return memberships;
}

const MOCK_MEMBERSHIPS = generateMemberships();

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
MOCK_CLUBS[0].announcements = MOCK_ANNOUNCEMENTS;


const MOCK_FEEDBACK: Feedback[] = [
    {
        id: newId('fb'),
        clubId: MOCK_CLUBS[0].id,
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
        clubId: MOCK_CLUBS[0].id,
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
};
