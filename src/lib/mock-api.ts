

/**
 * @file Mock API implementation.
 * This file implements the API contract defined in `api.stub.ts` using mock data.
 * It simulates network latency and provides a realistic development environment.
 */
import { ulid } from 'ulid';
import type {
  Club,
  ClubQuery,
  Event,
  EventQuery,
  Order,
  Ticket,
  User,
  CreateClubPayload,
  UpdateClubPayload,
  CreateEventPayload,
  UpdateEventPayload,
  AttachReceiptPayload,
  ReviewOrderPayload,
  Membership,
  UpdateEmailPayload,
  UpdateContactInfoPayload,
  ClubFile,
  UploadFilePayload,
  ClubMember,
  DownloadClubFileResponse,
  Feedback,
  Proposal,
  Comment,
  CreateFeedbackPayload,
  CreateProposalPayload,
  CreateCommentPayload,
  Announcement,
  CreateAnnouncementPayload,
  RsvpPayload,
  Policy,
  CreatePolicyPayload,
  UpdatePolicyPayload,
  ActivityLogEntry,
} from '@/types/domain';
import { MOCK_DATA } from './mock-data';
import type { Role } from './permissions';

// ==========
// HELPERS & CONFIG
// ==========

const LATENCY_BASE = 400;
const sleep = (ms = LATENCY_BASE + Math.random() * 250) => new Promise(resolve => setTimeout(resolve, ms));
const clone = <T>(x: T): T => structuredClone(x);

// Centralized ID and time generation
const newId = (prefix: string) => `${prefix}_${ulid()}`;
const newOrderId = (date = new Date()) => {
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `ord_${ymd}_${ulid()}`.toUpperCase();
}
const nowISO = () => new Date().toISOString();

// Hardcoded user for mock environment
let _currentUserId: string | null = null;
let _currentUserRole: Role = 'User';

export const setCurrentUser = (userId: string, role: Role) => {
    _currentUserId = userId;
    _currentUserRole = role;
}

const getCurrentUserId = (): string => {
    if (!_currentUserId) {
        // Fallback to the stable user from mock-data if not set.
        const defaultUser = MOCK_DATA.users[0];
        if (!defaultUser) {
            throw new Error("No users found in mock data.");
        }
        _currentUserId = defaultUser.id;
        _currentUserRole = 'User'; // Default role
    }
    return _currentUserId;
}



// Pre-indexed data for faster lookups
const idx = {
  users: new Map(MOCK_DATA.users.map(u => [u.id, u])),
  clubs: new Map(MOCK_DATA.clubs.map(c => [c.id, c])),
  events: new Map(MOCK_DATA.events.map(e => [e.id, e])),
  orders: new Map(MOCK_DATA.orders.map(o => [o.id, o])),
  tickets: new Map(MOCK_DATA.tickets.map(t => [t.id, t])),
  policies: new Map(MOCK_DATA.policies.map(p => [p.id, p])),
  activityLog: new Map(MOCK_DATA.activityLog.map(l => [l.id, l])),
};

function findOrFail<T>(m: Map<string, T>, id: string, type: string): T {
  const value = m.get(id);
  if (!value) throw new Error(`${type} ${id} not found`);
  return value;
}

// ==========
// USERS API
// ==========
export async function listUsers(): Promise<User[]> {
    await sleep();
    return clone(MOCK_DATA.users);
}

export async function getUser(userId: string): Promise<User> {
  await sleep();
   if (!idx.users.has(userId)) {
      const user = MOCK_DATA.users.find(u => u.id === userId);
      if (user) {
        idx.users.set(userId, user);
      } else {
        throw new Error(`User ${userId} not found`);
      }
   }
  return clone(findOrFail(idx.users, userId, 'User'));
}

export async function listUserClubs(userId: string): Promise<Club[]> {
  await sleep();
  const myClubIds = MOCK_DATA.memberships
    .filter(m => m.userId === userId && m.status === 'approved')
    .map(m => m.clubId);

  const myClubs = myClubIds.map(id => findOrFail(idx.clubs, id, 'Club'));
  
  if (_currentUserRole === 'PPMK' && userId === getCurrentUserId()) {
     const ppmkClub = MOCK_DATA.clubs.find(c => c.id === 'club_ppmk');
     if (ppmkClub && !myClubs.some(c => c.id === 'club_ppmk')) {
         myClubs.unshift(ppmkClub);
     }
   }

  return clone(myClubs);
}

// ==========
// CLUBS API
// ==========
export async function listClubs(query?: ClubQuery): Promise<Club[]> {
  await sleep();
  let clubs = [...MOCK_DATA.clubs]; // trust memberCount

  if (query?.search) {
    const q = query.search.toLowerCase();
    clubs = clubs.filter(c => c.name.toLowerCase().includes(q));
  }
  if (query?.category && query.category !== 'all') {
    const key = query.category.toLowerCase().replace(' & ', '-');
    clubs = clubs.filter(c => c.category.toLowerCase().replace(' & ', '-') === key);
  }

  if (query?.sortBy === 'relevance') {
    const uid = getCurrentUserId();
    clubs.sort((a,b) => {
      const aIs = MOCK_DATA.memberships.some(m => m.userId === uid && m.clubId === a.id && m.status === 'approved');
      const bIs = MOCK_DATA.memberships.some(m => m.userId === uid && m.clubId === b.id && m.status === 'approved');
      if (aIs !== bIs) return aIs ? -1 : 1;
      return b.memberCount - a.memberCount;
    });
  } else {
    // Default stable sort
    clubs.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  if (query?.page && query?.pageSize) {
    const start = (query.page - 1) * query.pageSize;
    return clubs.slice(start, start + query.pageSize).map(clone);
  }

  return clone(clubs);
}

export async function getClub(clubId: string): Promise<Club> {
  await sleep();
  return clone(findOrFail(idx.clubs, clubId, 'Club'));
}

export async function listClubMembers(clubId: string): Promise<ClubMember[]> {
  await sleep();
  const memberships = MOCK_DATA.memberships.filter(
    m => m.clubId === clubId && m.status === 'approved'
  );

  const members = memberships.map(m => {
    const user = findOrFail(idx.users, m.userId, 'User');
    return {
      ...user,
      role: m.role || 'Member',
    };
  });

  return clone(members);
}

export async function listClubMembershipRequests(clubId: string): Promise<User[]> {
    await sleep();
    const requestingUserIds = MOCK_DATA.memberships
        .filter(m => m.clubId === clubId && m.status === 'pending')
        .map(m => m.userId);
    
    const users = requestingUserIds.map(userId => findOrFail(idx.users, userId, 'User'));
    return clone(users);
}

export async function listClubEvents(clubId: string): Promise<Event[]> {
  await sleep();
  const events = MOCK_DATA.events.filter(event => event.clubId === clubId);
  return clone(events);
}

export async function listClubFiles(clubId: string): Promise<ClubFile[]> {
    await sleep();
    findOrFail(idx.clubs, clubId, 'Club');
    return clone(MOCK_DATA.files.filter(f => f.clubId === clubId));
}

// ==========
// EVENTS API
// ==========
export async function listEvents(query?: EventQuery): Promise<Event[]> {
  await sleep();
  let events = [...MOCK_DATA.events];

  if (query?.price === 'free') {
    events = events.filter(e => e.price === 0);
  } else if (query?.price === 'paid') {
    events = events.filter(e => e.price > 0);
  }

  if (query?.sortBy === 'popularity') {
    events.sort((a, b) => {
        if (a.status === 'ppmk' && b.status !== 'ppmk') return -1;
        if (b.status === 'ppmk' && a.status !== 'ppmk') return 1;
        return (b.rsvpCount ?? 0) - (a.rsvpCount ?? 0)
    });
  } else if (query?.sortBy === 'relevance') {
    const uid = getCurrentUserId();
    events.sort((a, b) => {
      const aAttending = MOCK_DATA.tickets.some(t => t.event.id === a.id && t.userId === uid);
      const bAttending = MOCK_DATA.tickets.some(t => t.event.id === b.id && t.userId === uid);
      if (aAttending !== bAttending) return aAttending ? -1 : 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  } else {
    // Default stable sort
    events.sort((a,b) => {
        if (a.status === 'ppmk' && b.status !== 'ppmk') return -1;
        if (b.status === 'ppmk' && a.status !== 'ppmk') return 1;
        return new Date(a.date).getTime() - new Date(b.date).getTime()
    });
  }

  if (query?.page && query?.pageSize) {
    const start = (query.page - 1) * query.pageSize;
    return events.slice(start, start + query.pageSize).map(clone);
  }

  return clone(events);
}

export async function getEvent(eventId: string): Promise<Event> {
  await sleep();
  return clone(findOrFail(idx.events, eventId, 'Event'));
}

// ==========
// PERSONALIZED API (MY-*)
// ==========
export async function listMyClubs(): Promise<Club[]> {
  await sleep();
  const uid = getCurrentUserId();
  return listUserClubs(uid);
}

export async function listMyAdminClubs(): Promise<Club[]> {
    await sleep();
    if (_currentUserRole === 'PPMK') {
        return clone(MOCK_DATA.clubs);
    }
    const uid = getCurrentUserId();
    const adminClubIds = MOCK_DATA.memberships
        .filter(m => m.userId === uid && m.role === 'Admin' && m.status === 'approved')
        .map(m => m.clubId);

    const clubs = adminClubIds.map(id => findOrFail(idx.clubs, id, 'Club'));
    return clone(clubs);
}

export async function listMyMemberships(): Promise<Membership[]> {
    await sleep();
    const uid = getCurrentUserId();
    return clone(MOCK_DATA.memberships.filter(m => m.userId === uid));
}

export async function listMyOrders(): Promise<Order[]> {
  await sleep();
  const uid = getCurrentUserId();
  return clone(MOCK_DATA.orders.filter(o => o.userId === uid));
}

export async function listMyTickets(): Promise<Ticket[]> {
  await sleep();
  const uid = getCurrentUserId();
  const now = new Date();
  
  // Per requirements, only return upcoming, issued tickets, sorted by date.
  const myTickets = MOCK_DATA.tickets.filter(t => 
      t.userId === uid &&
      t.status === 'issued' &&
      new Date(t.event.date) >= now
  );
  
  myTickets.sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
  
  return clone(myTickets);
}

// ==========
// ORDERS & TICKETS API
// ==========
export async function getOrder(orderId: string): Promise<Order> {
  await sleep();
  return clone(findOrFail(idx.orders, orderId, 'Order'));
}

export async function listEventOrders(eventId: string): Promise<Order[]> {
  await sleep();
  return clone(MOCK_DATA.orders.filter(o => o.eventId === eventId));
}

export async function getTicket(ticketId: string): Promise<Ticket> {
  await sleep();
  return clone(findOrFail(idx.tickets, ticketId, 'Ticket'));
}

// ==========
// FEEDBACK & PROPOSALS API
// ==========
export async function listClubFeedback(clubId: string): Promise<Feedback[]> {
    await sleep();
    return clone(MOCK_DATA.feedback.filter(f => f.clubId === clubId));
}

export async function createClubFeedback(clubId: string, payload: CreateFeedbackPayload): Promise<Feedback> {
    await sleep();
    const newFeedback: Feedback = {
        id: newId('fb'),
        clubId: clubId,
        authorId: getCurrentUserId(),
        status: 'open',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...payload
    };
    MOCK_DATA.feedback.push(newFeedback);
    return clone(newFeedback);
}

export async function listClubProposals(clubId: string): Promise<Proposal[]> {
    await sleep();
    return clone(MOCK_DATA.proposals.filter(p => p.clubId === clubId));
}

export async function createClubProposal(clubId: string, payload: CreateProposalPayload): Promise<Proposal> {
    await sleep();
    const newProposal: Proposal = {
        id: newId('prp'),
        clubId: clubId,
        proposerId: getCurrentUserId(),
        status: 'draft',
        approvals: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...payload
    };
    MOCK_DATA.proposals.push(newProposal);
    return clone(newProposal);
}

export async function listFeedbackComments(feedbackId: string): Promise<Comment[]> {
    await sleep();
    return clone(MOCK_DATA.comments[feedbackId] || []);
}

export async function createFeedbackComment(feedbackId: string, payload: CreateCommentPayload): Promise<Comment> {
    await sleep();
    const newComment: Comment = {
        id: newId('cmt'),
        authorId: getCurrentUserId(),
        createdAt: Date.now(),
        ...payload
    };
    if (!MOCK_DATA.comments[feedbackId]) {
        MOCK_DATA.comments[feedbackId] = [];
    }
    MOCK_DATA.comments[feedbackId].push(newComment);
    return clone(newComment);
}

export async function listProposalComments(proposalId: string): Promise<Comment[]> {
    await sleep();
    return clone(MOCK_DATA.comments[proposalId] || []);
}

export async function createProposalComment(proposalId: string, payload: CreateCommentPayload): Promise<Comment> {
    await sleep();
    const newComment: Comment = {
        id: newId('cmt'),
        authorId: getCurrentUserId(),
        createdAt: Date.now(),
        ...payload
    };
    if (!MOCK_DATA.comments[proposalId]) {
        MOCK_DATA.comments[proposalId] = [];
    }
    MOCK_DATA.comments[proposalId].push(newComment);
    return clone(newComment);
}

// ==========
// POLICIES API
// ==========
export async function listPolicies(): Promise<Policy[]> {
    await sleep();
    return clone(MOCK_DATA.policies);
}

export async function createPolicy(payload: CreatePolicyPayload): Promise<Policy> {
    await sleep();
    const newPolicy: Policy = {
        id: newId('pol'),
        status: 'draft',
        createdAt: nowISO(),
        updatedAt: nowISO(),
        ...payload,
    };
    MOCK_DATA.policies.push(newPolicy);
    idx.policies.set(newPolicy.id, newPolicy);
    return clone(newPolicy);
}

export async function updatePolicy(policyId: string, payload: UpdatePolicyPayload): Promise<Policy> {
    await sleep();
    const policy = findOrFail(idx.policies, policyId, 'Policy');
    Object.assign(policy, payload, { updatedAt: nowISO() });
    return clone(policy);
}

// ==========
// ACTIVITY LOG API
// ==========
export async function listActivityLog(): Promise<ActivityLogEntry[]> {
    await sleep();
    // Return sorted by most recent
    const logs = [...MOCK_DATA.activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return clone(logs);
}


// ==========
// MUTATIONS
// ==========
export async function createClub(payload: CreateClubPayload): Promise<Club> {
  await sleep();
  const newClub: Club = {
    id: newId('clb'),
    ...payload,
    memberCount: 0,
    isFeatured: false,
    announcements: [],
  };
  MOCK_DATA.clubs.push(newClub);
  idx.clubs.set(newClub.id, newClub);
  return clone(newClub);
}

export async function updateClub(clubId: string, payload: UpdateClubPayload): Promise<Club> {
  await sleep();
  const club = findOrFail(idx.clubs, clubId, 'Club');
  Object.assign(club, payload);
  return clone(club);
}

export async function archiveClub(clubId: string): Promise<{ success: boolean }> {
  await sleep();
  findOrFail(idx.clubs, clubId, 'Club');
  MOCK_DATA.clubs = MOCK_DATA.clubs.filter(c => c.id !== clubId);
  idx.clubs.delete(clubId);
  return { success: true };
}

export async function requestMembership(clubId: string): Promise<Membership> {
  await sleep();
  const uid = getCurrentUserId();
  const existingMembership = MOCK_DATA.memberships.find(m => m.clubId === clubId && m.userId === uid);
  if (existingMembership) {
    throw new Error('You already have a membership or pending request for this club.');
  }

  const membership: Membership = {
    clubId,
    userId: uid,
    status: 'pending',
    role: 'Member',
    joinedAt: nowISO(),
  };
  MOCK_DATA.memberships.push(membership);
  return clone(membership);
}

export async function approveMembership(clubId: string, userId: string): Promise<Membership> {
  await sleep();
  const membership = MOCK_DATA.memberships.find(m => m.clubId === clubId && m.userId === userId);
  if (!membership) throw new Error('Membership request not found.');
  
  membership.status = 'approved';
  // Denormalized count update
  const club = findOrFail(idx.clubs, clubId, 'Club');
  club.memberCount = MOCK_DATA.memberships.filter(m => m.clubId === clubId && m.status === 'approved').length;
  return clone(membership);
}

export async function rejectMembership(clubId: string, userId: string): Promise<{ success: boolean }> {
  await sleep();
  const index = MOCK_DATA.memberships.findIndex(m => m.clubId === clubId && m.userId === userId);
  if (index === -1) throw new Error('Membership request not found.');
  
  MOCK_DATA.memberships.splice(index, 1);
  return { success: true };
}

export async function cancelMembershipRequest(clubId: string): Promise<{ success: boolean }> {
    await sleep();
    const uid = getCurrentUserId();
    const index = MOCK_DATA.memberships.findIndex(m => m.clubId === clubId && m.userId === uid && m.status === 'pending');
    if (index === -1) throw new Error('No pending request found to cancel.');
    
    MOCK_DATA.memberships.splice(index, 1);
    return { success: true };
}

export async function leaveClub(clubId: string): Promise<{ success: boolean }> {
  await sleep();
  const uid = getCurrentUserId();
  const index = MOCK_DATA.memberships.findIndex(m => m.clubId === clubId && m.userId === uid);
  if (index > -1) {
    MOCK_DATA.memberships.splice(index, 1);
    // Denormalized count update
    const club = findOrFail(idx.clubs, clubId, 'Club');
    club.memberCount = MOCK_DATA.memberships.filter(m => m.clubId === clubId && m.status === 'approved').length;
  }
  return { success: true };
}

export async function createEvent(clubId: string, payload: CreateEventPayload): Promise<Event> {
  await sleep();
  const rawEvent = {
    id: newId('evt'),
    ...payload,
    clubId,
    viewerRsvpStatus: 'none' as const,
  };
  MOCK_DATA.events.push(rawEvent);
  idx.events.set(rawEvent.id, rawEvent);
  return clone(rawEvent);
}

export async function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<Event> {
  await sleep();
  const event = findOrFail(idx.events, eventId, 'Event');
  Object.assign(event, payload);
  return clone(event);
}

export async function cancelEvent(eventId: string): Promise<{ success: boolean }> {
  await sleep();
  findOrFail(idx.events, eventId, 'Event');
  MOCK_DATA.events = MOCK_DATA.events.filter(e => e.id !== eventId);
  idx.events.delete(eventId);
  return { success: true };
}

export async function rsvpEvent(eventId: string, quantity: number): Promise<Order> {
  await sleep();
  const uid = getCurrentUserId();
  const event = findOrFail(idx.events, eventId, 'Event');

  if (MOCK_DATA.tickets.some(t => t.event.id === eventId && t.userId === uid)) {
    throw new Error('You already have a ticket for this event.');
  }

  // This flow now immediately creates a 'paid' order and issues tickets.
  // A real app would have a multi-step process with a payment gateway.
  const order = await createOrder({ eventId, quantity });
  order.status = 'paid'; // Simulate successful payment
  idx.orders.set(order.id, order); // Update the index with the new status

  // Issue tickets since the order is now considered paid
  for (let i = 0; i < quantity; i++) {
    const ticket: Ticket = {
      id: newId('tck'),
      orderId: order.id,
      userId: uid,
      event: { id: event.id, name: event.name, date: event.date, location: event.location, price: event.price },
      qrCodeUrl: 'https://placehold.co/150x150.png',
      status: 'issued',
      issuedAt: nowISO(),
    };
    MOCK_DATA.tickets.push(ticket);
    idx.tickets.set(ticket.id, ticket);
  }
  
  event.rsvpCount = (event.rsvpCount ?? 0) + quantity;

  return clone(order);
}


export async function cancelRsvp(eventId: string): Promise<{ success: boolean }> {
  await sleep();
  const uid = getCurrentUserId();
  const event = findOrFail(idx.events, eventId, 'Event');
  const userTicketsForEvent = MOCK_DATA.tickets.filter(t => t.event.id === eventId && t.userId === uid);

  if (userTicketsForEvent.length === 0) {
    event.viewerRsvpStatus = 'none';
    return { success: true };
  }
  
  const ticketIds = userTicketsForEvent.map(t => t.id);
  const orderIds = [...new Set(userTicketsForEvent.map(t => t.orderId))];

  MOCK_DATA.tickets = MOCK_DATA.tickets.filter(t => !ticketIds.includes(t.id));
  ticketIds.forEach(id => idx.tickets.delete(id));

  MOCK_DATA.orders = MOCK_DATA.orders.filter(o => !orderIds.includes(o.id));
  orderIds.forEach(id => idx.orders.delete(id));

  event.viewerRsvpStatus = 'none';
  event.rsvpCount = Math.max(0, (event.rsvpCount ?? 0) - userTicketsForEvent.length);
  return { success: true };
}

export async function createOrder(payload: { eventId: string, quantity: number }): Promise<Order> {
    await sleep();
    const event = findOrFail(idx.events, payload.eventId, 'Event');
    const newOrder: Order = {
        id: newOrderId(),
        userId: getCurrentUserId(),
        clubId: event.clubId,
        eventId: event.id,
        itemName: `${event.name} Ticket (x${payload.quantity})`,
        total: event.price * payload.quantity,
        status: 'awaiting_payment',
        createdAt: nowISO(),
    };
    MOCK_DATA.orders.push(newOrder);
    idx.orders.set(newOrder.id, newOrder);
    return clone(newOrder);
}

export async function attachReceipt(payload: AttachReceiptPayload): Promise<Order> {
  await sleep();
  const order = findOrFail(idx.orders, payload.orderId, 'Order');
  order.receiptUrl = 'https://placehold.co/300x200.png';
  order.status = 'under_review';
  return clone(order);
}

export async function reviewOrder(payload: ReviewOrderPayload): Promise<Order> {
  await sleep();
  const order = findOrFail(idx.orders, payload.orderId, 'Order');
  order.status = payload.isApproved ? 'paid' : 'rejected';
  
  // If approved, issue tickets now
  if (payload.isApproved && order.eventId) {
     const event = findOrFail(idx.events, order.eventId, 'Event');
     const quantity = (order.total / event.price) || 1;
     for (let i = 0; i < quantity; i++) {
        const ticket: Ticket = {
            id: newId('tck'),
            orderId: order.id,
            userId: order.userId,
            event: { id: event.id, name: event.name, date: event.date, location: event.location, price: event.price },
            qrCodeUrl: 'https://placehold.co/150x150.png',
            status: 'issued',
            issuedAt: nowISO(),
        };
        MOCK_DATA.tickets.push(ticket);
        idx.tickets.set(ticket.id, ticket);
     }
  }

  return clone(order);
}

export async function checkInTicket(ticketId: string): Promise<Ticket> {
  await sleep();
  const ticket = findOrFail(idx.tickets, ticketId, 'Ticket');
  if (ticket.status === 'redeemed') throw new Error('Ticket has already been redeemed.');
  
  ticket.status = 'redeemed';
  ticket.redeemedAt = nowISO();
  return clone(ticket);
}

// User Profile Mutations
export async function updateUserEmail(payload: UpdateEmailPayload): Promise<{ success: boolean }> {
  await sleep();
  const user = findOrFail(idx.users, getCurrentUserId(), 'User');
  if (!payload.newEmail.includes('@')) throw new Error('Invalid email format.');
  
  user.email = payload.newEmail;
  return { success: true };
}

export async function updateContactInfo(payload: UpdateContactInfoPayload): Promise<{ success: boolean }> {
    await sleep();
    const user = findOrFail(idx.users, getCurrentUserId(), 'User');
    Object.assign(user, payload);
    
    if (payload.firstName || payload.lastName) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    
    return { success: true };
}

// File Mutations
export async function uploadClubFile(clubId: string, payload: UploadFilePayload): Promise<ClubFile> {
    await sleep();
    const club = findOrFail(idx.clubs, clubId, 'Club');
    const newFile: ClubFile = {
        id: newId('file'),
        clubId: club.id,
        name: payload.name,
        url: 'https://example.com/mock-file.pdf',
        permission: payload.permission,
        uploadedAt: nowISO(),
        uploaderId: getCurrentUserId(),
    };
    MOCK_DATA.files.push(newFile);
    return clone(newFile);
}

export async function downloadClubFile(fileId: string): Promise<DownloadClubFileResponse> {
    await sleep();
    const file = findOrFail(new Map(MOCK_DATA.files.map(f => [f.id, f])), fileId, 'ClubFile');
    return { downloadUrl: file.url };
}

// Announcement Mutations
export async function createAnnouncement(clubId: string, payload: CreateAnnouncementPayload): Promise<Announcement> {
    await sleep();
    const club = findOrFail(idx.clubs, clubId, 'Club');
    const newAnnouncement: Announcement = {
        id: newId('ann'),
        clubId: club.id,
        ...payload,
        createdAt: nowISO(),
    };

    if (!club.announcements) {
        club.announcements = [];
    }
    club.announcements.unshift(newAnnouncement);
    return clone(newAnnouncement);
}
