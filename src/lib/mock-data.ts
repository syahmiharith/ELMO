
import type { University, Club, User, ClubDocument, ApprovalRequest, InterestTag, ClubEvent, ClubAnnouncement, Membership } from './types';

export const universities: University[] = [
    { id: 'uni-1', name: 'State University', code: 'SU', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 'uni-2', name: 'Metropolis University', code: 'MU', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 'uni-3', name: 'Tech Institute', code: 'TI', createdAt: Date.now(), updatedAt: Date.now() },
];

export const interestTags: InterestTag[] = [
    { id: 'robotics', name: 'Robotics', synonyms: ['bots'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'ai', name: 'Artificial Intelligence', synonyms: ['machine learning', 'ml'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'esports', name: 'E-Sports', synonyms: ['gaming', 'competitive gaming'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'writing', name: 'Creative Writing', synonyms: ['poetry', 'fiction'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'debate', name: 'Debate', synonyms: ['public speaking'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'photography', name: 'Photography', synonyms: ['photo'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'music', name: 'Music', synonyms: ['band', 'orchestra', 'choir'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'volunteering', name: 'Volunteering', synonyms: ['community service'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'entrepreneurship', name: 'Entrepreneurship', synonyms: ['startups', 'business'], active: true, lang: 'en', createdBy: 'system' },
    { id: 'sustainability', name: 'Sustainability', synonyms: ['environment', 'green tech'], active: true, lang: 'en', createdBy: 'system' },
];

const now = Date.now();
const systemAudit = { createdAt: now, updatedAt: now, lastEditedBy: 'system' };
const consents = { tos: now, privacy: now };

export const memberships: Membership[] = [
    { id: 'mem-1', clubId: 'club-1', userId: 'user-2', role: 'officer', status: 'approved', duesStatus: 'paid', joinedAt: now, updatedAt: now },
    { id: 'mem-2', clubId: 'club-1', userId: 'user-3', role: 'member', status: 'approved', duesStatus: 'unpaid', joinedAt: now, updatedAt: now },
    { id: 'mem-3', clubId: 'club-2', userId: 'user-3', role: 'member', status: 'approved', duesStatus: 'paid', joinedAt: now, updatedAt: now },
    { id: 'mem-4', clubId: 'club-1', userId: 'user-4', role: 'owner', status: 'approved', duesStatus: 'paid', joinedAt: now, updatedAt: now },
    { id: 'mem-5', clubId: 'club-1', userId: 'user-5', role: 'member', status: 'approved', duesStatus: 'paid', joinedAt: now, updatedAt: now },
    { id: 'mem-6', clubId: 'club-1', userId: 'user-6', role: 'member', status: 'approved', duesStatus: 'unpaid', joinedAt: now, updatedAt: now },
    { id: 'mem-7', clubId: 'club-1', userId: 'user-pending-1', role: 'member', status: 'pending', duesStatus: 'unpaid', joinedAt: now, updatedAt: now },
    { id: 'mem-8', clubId: 'club-1', userId: 'user-pending-2', role: 'member', status: 'pending', duesStatus: 'unpaid', joinedAt: now, updatedAt: now },
    { id: 'mem-club-test', clubId: 'club-2', userId: 'club_test', role: 'officer', status: 'approved', duesStatus: 'paid', joinedAt: now, updatedAt: now },
    { id: 'mem-user-test', clubId: 'club-3', userId: 'user_test', role: 'member', status: 'approved', duesStatus: 'paid', joinedAt: now, updatedAt: now },
];


export const mockUsers: User[] = [
    {
        id: 'user-1',
        name: { display: 'Alice Super' },
        email: 'alice@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'superAdmin',
        universityIds: ['uni-1'],
        verificationStatus: 'verified',
        consents, audit: systemAudit,
        interests: ['robotics', 'ai', 'esports'],
        memberships: [],
    },
    {
        id: 'user-2',
        name: { display: 'Bob Officer' },
        email: 'bob@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'clubManager',
        universityIds: ['uni-1'],
        studentId: 'B-MGR-001',
        major: 'Mechanical Engineering',
        graduationYear: 2025,
        verificationStatus: 'verified',
        consents, audit: systemAudit,
        interests: ['robotics', 'ai'],
        memberships: memberships.filter(m => m.userId === 'user-2'),
    },
    {
        id: 'user-3',
        name: { display: 'Charlie Member' },
        email: 'charlie@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'member',
        universityIds: ['uni-1', 'uni-2'],
        studentId: 'C-MEM-002',
        major: 'English Literature',
        graduationYear: 2026,
        verificationStatus: 'pending',
        consents, audit: systemAudit,
        interests: ['debate', 'writing'],
        memberships: memberships.filter(m => m.userId === 'user-3'),
    },
    {
        id: 'user-4',
        name: { display: 'David Smith' },
        email: 'david@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'clubManager',
        universityIds: ['uni-1'],
        verificationStatus: 'verified',
        consents, audit: systemAudit,
        memberships: memberships.filter(m => m.userId === 'user-4'),
    },
    {
        id: 'user-5',
        name: { display: 'Emily Johnson' },
        email: 'emily@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'member',
        universityIds: ['uni-1'],
        verificationStatus: 'verified',
        consents, audit: systemAudit,
        memberships: memberships.filter(m => m.userId === 'user-5'),
    },
    {
        id: 'user-6',
        name: { display: 'Michael Brown' },
        email: 'michael@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'member',
        universityIds: ['uni-1'],
        verificationStatus: 'unverified',
        consents, audit: systemAudit,
        memberships: memberships.filter(m => m.userId === 'user-6'),
    },
    {
        id: 'user-pending-1',
        name: { display: 'Penelope Pending' },
        email: 'penny@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'member',
        universityIds: ['uni-1'],
        verificationStatus: 'pending',
        consents, audit: systemAudit,
        memberships: memberships.filter(m => m.userId === 'user-pending-1'),
    },
    {
        id: 'user-pending-2',
        name: { display: 'Peter Parker' },
        email: 'spidey@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'member',
        universityIds: ['uni-2'],
        verificationStatus: 'pending',
        consents, audit: systemAudit,
        memberships: memberships.filter(m => m.userId === 'user-pending-2'),
    },
    {
        id: 'user_test',
        name: { display: 'User Test' },
        email: 'user_test@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'member',
        universityIds: ['uni-3'],
        verificationStatus: 'verified',
        consents, audit: systemAudit,
        interests: ['photography', 'music'],
        memberships: memberships.filter(m => m.userId === 'user_test'),
    },
    {
        id: 'club_test',
        name: { display: 'Club Test' },
        email: 'club_test@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'clubManager',
        universityIds: ['uni-2'],
        verificationStatus: 'verified',
        consents, audit: systemAudit,
        interests: ['debate', 'volunteering'],
        memberships: memberships.filter(m => m.userId === 'club_test'),
    },
    {
        id: 'super_test',
        name: { display: 'Super Test' },
        email: 'super_test@example.com',
        photoUrl: 'https://placehold.co/100x100',
        roleHint: 'superAdmin',
        universityIds: ['uni-1', 'uni-2', 'uni-3'],
        verificationStatus: 'verified',
        consents, audit: systemAudit,
        interests: [],
        memberships: [],
    },
];

export const clubAnnouncements: ClubAnnouncement[] = [
    { id: 'ann-1', clubId: 'club-1', authorId: 'user-2', title: 'Welcome New Members!', content: 'We are thrilled to welcome all our new members. Our first general meeting will be next Monday. See you there!', bodyHtml: '<p>We are thrilled to welcome all our new members. Our first general meeting will be next Monday. See you there!</p>', createdAt: now, updatedAt: now, date: '2024-05-15', author: 'Bob Officer' },
    { id: 'ann-2', clubId: 'club-1', authorId: 'user-4', title: 'Hackathon Prep Session', content: 'Don\'t forget about the hackathon prep session this Friday. We will be finalizing teams and distributing starter kits.', bodyHtml: '<p>Don\'t forget about the hackathon prep session this Friday. We will be finalizing teams and distributing starter kits.</p>', createdAt: now, updatedAt: now, date: '2024-05-12', author: 'David Smith' },
    { id: 'ann-3', clubId: 'club-2', authorId: 'user-3', title: 'Tournament Sign-ups Closing Soon', content: 'If you want to compete in the regional tournament, please make sure your team is registered by this Wednesday. No late entries!', bodyHtml: '<p>If you want to compete in the regional tournament, please make sure your team is registered by this Wednesday. No late entries!</p>', createdAt: now, updatedAt: now, date: '2024-05-10', author: 'Charlie Member' },
];

export const clubs: Club[] = [
    {
        id: 'club-1',
        name: 'AI & Robotics Club',
        description: 'Exploring the frontiers of artificial intelligence and robotics. We host workshops, competitions, and guest lectures.',
        logoUrl: 'https://placehold.co/400x400',
        universityIds: ['uni-1'],
        visibility: 'public',
        status: 'active',
        isFeatured: true,
        isApproved: true, // Legacy field, will be removed
        interestTags: ['ai', 'robotics', 'entrepreneurship'],
        createdBy: 'user-1',
        audit: systemAudit,
        announcements: clubAnnouncements.filter(a => a.clubId === 'club-1'),
        university: universities[0] // Legacy field
    },
    {
        id: 'club-2',
        name: 'Debate Society',
        description: 'Honing public speaking and critical thinking skills through lively debates and discussions.',
        logoUrl: 'https://placehold.co/400x400',
        universityIds: ['uni-2'],
        visibility: 'public',
        status: 'active',
        isFeatured: false,
        isApproved: true, // Legacy field
        interestTags: ['debate'],
        createdBy: 'user-1',
        audit: systemAudit,
        announcements: clubAnnouncements.filter(a => a.clubId === 'club-2'),
        university: universities[1] // Legacy field
    },
    {
        id: 'club-3',
        name: 'Creative Writing Guild',
        description: 'A community for writers to share their work, receive feedback, and collaborate on projects.',
        logoUrl: 'https://placehold.co/400x400',
        universityIds: ['uni-1'],
        visibility: 'public',
        status: 'active',
        isFeatured: false,
        isApproved: true, // Legacy field
        interestTags: ['writing'],
        createdBy: 'user-1',
        audit: systemAudit,
        university: universities[0] // Legacy field
    },
    {
        id: 'club-4',
        name: 'E-Sports League',
        description: 'Competitive gaming across various popular titles. Join our teams and compete at the inter-university level.',
        logoUrl: 'https://placehold.co/400x400',
        universityIds: ['uni-2', 'uni-3'],
        visibility: 'public',
        status: 'active',
        isFeatured: true,
        isApproved: true, // Legacy field
        interestTags: ['esports'],
        createdBy: 'user-1',
        audit: systemAudit,
        university: universities[2] // Legacy field
    },
    {
        id: 'club-5',
        name: 'Photography Club',
        description: 'A newly proposed club for students passionate about photography. Awaiting for approval.',
        logoUrl: 'https://placehold.co/400x400',
        universityIds: ['uni-1'],
        visibility: 'public',
        status: 'pendingApproval',
        isFeatured: false,
        isApproved: false, // Legacy field
        interestTags: ['photography'],
        createdBy: 'user-3',
        audit: systemAudit,
        university: universities[1] // Legacy field
    },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

export const events: ClubEvent[] = [
    {
        id: 'event-1',
        name: 'AI Workshop',
        description: 'An introductory workshop on machine learning concepts. No prior experience required. Laptops are recommended.',
        imageUrl: 'https://placehold.co/600x400',
        category: 'Workshop',
        start: today.getTime(),
        end: today.getTime() + 2 * 60 * 60 * 1000,
        clubId: 'club-1',
        location: 'Tech Building, Room 101',
        rsvps: ['user-3', 'user-5'], // Legacy field
        price: 0, // Legacy field
        paymentMode: 'free',
        status: 'published',
        rsvpOpen: today.getTime() - 7 * 24 * 60 * 60 * 1000,
        rsvpClose: today.getTime(),
        visibility: 'public',
        capacity: 50,
        waitlistEnabled: true,
        requiresStudentVerification: false,
        requiresDuesPaid: false,
        timezone: 'America/New_York',
    },
    {
        id: 'event-2',
        name: 'Regional Debate Tournament',
        description: 'The annual regional debate tournament. Sign-ups for teams are now open. Spectators welcome.',
        imageUrl: 'https://placehold.co/600x400',
        category: 'Competition',
        start: tomorrow.getTime(),
        end: tomorrow.getTime() + 8 * 60 * 60 * 1000,
        clubId: 'club-2',
        location: 'Grand Auditorium',
        rsvps: ['user-3'], // Legacy field
        price: 15, // Legacy field
        paymentMode: 'external',
        organizerPayLink: 'https://www.paypal.com/paypalme/mytestaccount', // Example link
        currency: 'USD',
        status: 'published',
        rsvpOpen: today.getTime() - 14 * 24 * 60 * 60 * 1000,
        rsvpClose: tomorrow.getTime(),
        visibility: 'public',
        capacity: 100,
        waitlistEnabled: false,
        requiresStudentVerification: true,
        requiresDuesPaid: true,
        timezone: 'America/New_York',
    },
    {
        id: 'event-3',
        name: 'Open Mic Night',
        description: 'Share your poetry, stories, or stand-up comedy. A safe and supportive space for all creative writers.',
        imageUrl: 'https://placehold.co/600x400',
        category: 'Social',
        start: nextWeek.getTime(),
        end: nextWeek.getTime() + 3 * 60 * 60 * 1000,
        clubId: 'club-3',
        location: 'Student Union, Cafe Area',
        rsvps: [], // Legacy field
        price: 5, // Legacy field
        paymentMode: 'external',
        organizerPayLink: 'https://www.paypal.com/paypalme/mytestaccount',
        currency: 'USD',
        status: 'published',
        rsvpOpen: today.getTime(),
        rsvpClose: nextWeek.getTime(),
        visibility: 'campus',
        allowedUniversities: ['uni-1', 'uni-2'],
        capacity: 30,
        waitlistEnabled: true,
        requiresStudentVerification: false,
        requiresDuesPaid: false,
        timezone: 'America/New_York',
    },
    {
        id: 'event-4',
        name: 'Robotics Hackathon Kick-off',
        description: 'Kick-off meeting for the weekend-long robotics hackathon. Form teams, brainstorm ideas, and get ready to build.',
        imageUrl: 'https://placehold.co/600x400',
        category: 'Hackathon',
        start: new Date(today.getFullYear(), today.getMonth() + 1, 8).getTime(),
        end: new Date(today.getFullYear(), today.getMonth() + 1, 10).getTime(),
        clubId: 'club-1',
        location: 'Engineering Hub',
        rsvps: ['user-2', 'user-4', 'user-5'], // Legacy field
        price: 0, // Legacy field
        paymentMode: 'free',
        status: 'published',
        rsvpOpen: today.getTime(),
        rsvpClose: new Date(today.getFullYear(), today.getMonth() + 1, 8).getTime(),
        visibility: 'public',
        capacity: 80,
        waitlistEnabled: true,
        requiresStudentVerification: true,
        requiresDuesPaid: true,
        timezone: 'America/New_York',
    },
];


export const documents: ClubDocument[] = [
    { id: 'doc-1', clubId: 'club-1', name: 'Club Constitution.pdf', uploadedAt: '2023-09-02', url: '#', size: '1.2 MB', visibility: 'public' },
    { id: 'doc-2', clubId: 'club-1', name: 'Meeting Minutes - Oct 2023.docx', uploadedAt: '2023-10-30', url: '#', size: '345 KB', visibility: 'member' },
    { id: 'doc-3', clubId: 'club-1', name: 'Event Proposal - TechFair.pdf', uploadedAt: '2024-02-10', url: '#', size: '850 KB', visibility: 'manager' },
];

export const approvalRequests: ApprovalRequest[] = [
    { id: 'req-1', type: 'club', clubId: 'club-5', requesterId: 'user-3', createdAt: now, clubName: 'Photography Club', requesterName: 'Jane Doe', date: '2024-05-10', status: 'pending' },
    { id: 'req-2', type: 'event', clubId: 'club-1', requesterId: 'user-4', createdAt: now, clubName: 'AI & Robotics Club', requesterName: 'David Smith', date: '2024-05-08', status: 'pending' },
    { id: 'req-3', type: 'budget', clubId: 'club-2', requesterId: 'user-3', createdAt: now, status: 'approved', clubName: 'Debate Society', requesterName: 'Chris Wilson', date: '2024-05-05' },
    { id: 'req-4', type: 'membership', clubId: 'club-1', requesterId: 'user-pending-1', userId: 'user-pending-1', createdAt: now, clubName: 'AI & Robotics Club', requesterName: mockUsers.find(u => u.id === 'user-pending-1')!.name.display, date: '2024-05-18', status: 'pending' },
    { id: 'req-5', type: 'membership', clubId: 'club-1', requesterId: 'user-pending-2', userId: 'user-pending-2', createdAt: now, clubName: 'AI & Robotics Club', requesterName: mockUsers.find(u => u.id === 'user-pending-2')!.name.display, date: '2024-05-19', status: 'pending' }
];

// This logic is now handled by directly adding the memberships array to each user.
// mockUsers.forEach(user => {
//     (user as any).memberships = memberships.filter(m => m.userId === user.id);
// });
// mockUsers.forEach(user => {
//     if (user.roleHint === 'clubManager') {
//         user.role = 'clubManager';
//     } else if (user.roleHint === 'superAdmin') {
//         user.role = 'superAdmin';
//     } else {
//         user.role = 'member';
//     }
// });

clubs.forEach(club => {
    (club as any).memberIds = memberships.filter(m => m.clubId === club.id && m.status === 'approved').map(m => m.userId);
    (club as any).managerIds = memberships.filter(m => m.clubId === club.id && m.status === 'approved' && (m.role === 'officer' || m.role === 'owner')).map(m => m.userId);
});
