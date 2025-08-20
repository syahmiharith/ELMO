
/**
 * @file Mock API implementation.
 * This file implements the API contract defined in `api.stub.ts` using mock data.
 * It simulates network latency and provides a realistic development environment.
 */

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
} from '@/types/domain';
import { MOCK_DATA } from './mock-data';

// Simulate network latency
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const LATENCY = 500;

// ==========
// HELPERS
// ==========
function findOrFail<T extends { id: string }>(
  items: T[],
  id: string,
  typeName: string
): T {
  const item = items.find((i) => i.id === id);
  if (!item) {
    throw new Error(`${typeName} with ID ${id} not found.`);
  }
  return item;
}

// ==========
// CLUBS API
// ==========
export async function listClubs(query?: ClubQuery): Promise<Club[]> {
  await sleep(LATENCY);
  let clubs = [...MOCK_DATA.clubs];

  if (query?.search) {
    const searchTerm = query.search.toLowerCase();
    clubs = clubs.filter(c => c.name.toLowerCase().includes(searchTerm));
  }
  if (query?.category && query.category !== 'all') {
    clubs = clubs.filter(c => c.category.toLowerCase().replace(' & ', '-') === query.category);
  }

  if (query?.page && query?.pageSize) {
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    return clubs.slice(start, end);
  }

  return clubs;
}

export async function getClub(clubId: string): Promise<Club> {
  await sleep(LATENCY);
  return findOrFail(MOCK_DATA.clubs, clubId, 'Club');
}

export async function listClubMembers(clubId: string): Promise<User[]> {
  await sleep(LATENCY);
  // In a real app, this would be a join table lookup.
  // Here, we just return all mock users for simplicity for any valid club.
  findOrFail(MOCK_DATA.clubs, clubId, 'Club');
  return MOCK_DATA.users;
}

export async function listClubEvents(clubId: string): Promise<Event[]> {
  await sleep(LATENCY);
  return MOCK_DATA.events.filter((event) => event.club.id === clubId);
}

// ==========
// EVENTS API
// ==========
export async function listEvents(query?: EventQuery): Promise<Event[]> {
  await sleep(LATENCY);
  let events = [...MOCK_DATA.events];

  // Mock sorting logic
  if (query?.sortBy === 'popularity') {
    // Sort by the number of RSVPs in descending order.
    events.sort((a, b) => b.rsvpCount - a.rsvpCount);
  } else if (query?.sortBy === 'relevance') {
     // Simple mock: events user is attending are most relevant, then sort by date
    events.sort((a, b) => {
      if (a.viewerRsvpStatus === 'attending' && b.viewerRsvpStatus !== 'attending') return -1;
      if (a.viewerRsvpStatus !== 'attending' && b.viewerRsvpStatus === 'attending') return 1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  if (query?.page && query?.pageSize) {
    const start = (query.page - 1) * query.pageSize;
    const end = start + query.pageSize;
    return events.slice(start, end);
  }

  return events;
}

export async function getEvent(eventId: string): Promise<Event> {
  await sleep(LATENCY);
  return findOrFail(MOCK_DATA.events, eventId, 'Event');
}

// ==========
// PERSONALIZED API (MY-*)
// ==========
export async function listMyClubs(): Promise<Club[]> {
  await sleep(LATENCY);
  const myClubIds = MOCK_DATA.memberships
    .filter((m) => m.status === 'approved')
    .map((m) => m.clubId);
  return MOCK_DATA.clubs.filter((c) => myClubIds.includes(c.id));
}

export async function listMyMemberships(): Promise<Membership[]> {
    await sleep(LATENCY);
    return MOCK_DATA.memberships.filter(m => m.userId === 'user-1');
}

export async function listMyOrders(): Promise<Order[]> {
  await sleep(LATENCY);
  return MOCK_DATA.orders;
}

export async function listMyTickets(): Promise<Ticket[]> {
  await sleep(LATENCY);
  return MOCK_DATA.tickets;
}

// ==========
// ORDERS & TICKETS API
// ==========
export async function getOrder(orderId: string): Promise<Order> {
  await sleep(LATENCY);
  return findOrFail(MOCK_DATA.orders, orderId, 'Order');
}

export async function listEventOrders(eventId: string): Promise<Order[]> {
  await sleep(LATENCY);
  return MOCK_DATA.orders.filter((o) => o.eventId === eventId);
}

export async function getTicket(ticketId: string): Promise<Ticket> {
  await sleep(LATENCY);
  return findOrFail(MOCK_DATA.tickets, ticketId, 'Ticket');
}

// ==========
// MUTATIONS
// ==========
export async function createClub(payload: CreateClubPayload): Promise<Club> {
  await sleep(LATENCY);
  const newClub: Club = {
    id: `club-${Date.now()}`,
    ...payload,
    memberCount: 0,
    isFeatured: false,
  };
  MOCK_DATA.clubs.push(newClub);
  return newClub;
}

export async function updateClub(clubId: string, payload: UpdateClubPayload): Promise<Club> {
  await sleep(LATENCY);
  const club = findOrFail(MOCK_DATA.clubs, clubId, 'Club');
  Object.assign(club, payload);
  return club;
}

export async function archiveClub(clubId: string): Promise<{ success: boolean }> {
  await sleep(LATENCY);
  const index = MOCK_DATA.clubs.findIndex((c) => c.id === clubId);
  if (index === -1) {
    throw new Error(`Club with ID ${clubId} not found.`);
  }
  MOCK_DATA.clubs.splice(index, 1);
  return { success: true };
}

export async function requestMembership(clubId: string): Promise<Membership> {
  await sleep(LATENCY);
  const existingMembership = MOCK_DATA.memberships.find(m => m.clubId === clubId && m.userId === 'user-1');
  if (existingMembership) {
    throw new Error('You already have a membership or pending request for this club.');
  }

  const membership: Membership = {
    clubId,
    userId: 'user-1', // Mock current user
    status: 'pending',
    joinedAt: new Date().toISOString(),
  };
  MOCK_DATA.memberships.push(membership);
  return membership;
}

export async function approveMembership(clubId: string, userId: string): Promise<Membership> {
  await sleep(LATENCY);
  const membership = MOCK_DATA.memberships.find(
    (m) => m.clubId === clubId && m.userId === userId
  );
  if (!membership) {
    throw new Error('Membership request not found.');
  }
  membership.status = 'approved';
  return membership;
}

export async function rejectMembership(clubId: string, userId: string): Promise<{ success: boolean }> {
  await sleep(LATENCY);
  const membership = MOCK_DATA.memberships.find(
    (m) => m.clubId === clubId && m.userId === userId
  );
   if (!membership) {
    throw new Error('Membership request not found.');
  }
  membership.status = 'rejected';
  return { success: true };
}

export async function cancelMembershipRequest(clubId: string): Promise<{ success: boolean }> {
    await sleep(LATENCY);
    const index = MOCK_DATA.memberships.findIndex(m => m.clubId === clubId && m.userId === 'user-1' && m.status === 'pending');
    if (index === -1) {
        throw new Error('No pending request found to cancel.');
    }
    MOCK_DATA.memberships.splice(index, 1);
    return { success: true };
}

export async function leaveClub(clubId: string): Promise<{ success: boolean }> {
  await sleep(LATENCY);
  const index = MOCK_DATA.memberships.findIndex(
    (m) => m.clubId === clubId && m.userId === 'user-1'
  );
  if (index > -1) {
    MOCK_DATA.memberships.splice(index, 1);
  }
  return { success: true };
}

export async function createEvent(clubId: string, payload: CreateEventPayload): Promise<Event> {
  await sleep(LATENCY);
  const club = findOrFail(MOCK_DATA.clubs, clubId, 'Club');
  const newEvent: Event = {
    id: `event-${Date.now()}`,
    ...payload,
    club: { id: club.id, name: club.name },
    viewerRsvpStatus: 'none',
  };
  MOCK_DATA.events.push(newEvent);
  return newEvent;
}

export async function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<Event> {
  await sleep(LATENCY);
  const event = findOrFail(MOCK_DATA.events, eventId, 'Event');
  Object.assign(event, payload);
  return event;
}

export async function cancelEvent(eventId: string): Promise<{ success: boolean }> {
  await sleep(LATENCY);
  const index = MOCK_DATA.events.findIndex((e) => e.id === eventId);
  if (index === -1) {
    throw new Error(`Event with ID ${eventId} not found.`);
  }
  MOCK_DATA.events.splice(index, 1);
  return { success: true };
}

export async function rsvpEvent(eventId: string): Promise<Order | { success: boolean }> {
  await sleep(LATENCY);
  const event = findOrFail(MOCK_DATA.events, eventId, 'Event');
  event.viewerRsvpStatus = 'attending';
  event.rsvpCount += 1;

  if (event.rsvpFlow === 'PAID') {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: 'user-1',
      eventId: event.id,
      itemName: `${event.name} Ticket`,
      total: event.price,
      status: 'awaiting_payment',
      createdAt: new Date().toISOString(),
    };
    MOCK_DATA.orders.push(newOrder);
    return newOrder;
  }
  
  return { success: true };
}

export async function cancelRsvp(eventId: string): Promise<{ success: boolean }> {
  await sleep(LATENCY);
  const event = findOrFail(MOCK_DATA.events, eventId, 'Event');
  event.viewerRsvpStatus = 'none';
  event.rsvpCount -= 1;
  return { success: true };
}

export async function createOrder(payload: { eventId: string }): Promise<Order> {
    await sleep(LATENCY);
    const event = findOrFail(MOCK_DATA.events, payload.eventId, 'Event');
    const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        userId: 'user-1',
        eventId: event.id,
        itemName: `${event.name} Ticket`,
        total: event.price,
        status: 'awaiting_payment',
        createdAt: new Date().toISOString(),
    };
    MOCK_DATA.orders.push(newOrder);
    return newOrder;
}

export async function attachReceipt(payload: AttachReceiptPayload): Promise<Order> {
  await sleep(LATENCY);
  const order = findOrFail(MOCK_DATA.orders, payload.orderId, 'Order');
  order.receiptUrl = 'https://placehold.co/300x200.png'; // Mock URL
  order.status = 'under_review';
  return order;
}

export async function reviewOrder(payload: ReviewOrderPayload): Promise<Order> {
  await sleep(LATENCY);
  const order = findOrFail(MOCK_DATA.orders, payload.orderId, 'Order');
  order.status = payload.isApproved ? 'paid' : 'rejected';
  return order;
}

export async function checkInTicket(ticketId: string): Promise<Ticket> {
  await sleep(LATENCY);
  const ticket = findOrFail(MOCK_DATA.tickets, ticketId, 'Ticket');
  if (ticket.status === 'redeemed') {
    throw new Error('Ticket has already been redeemed.');
  }
  ticket.status = 'redeemed';
  ticket.redeemedAt = new Date().toISOString();
  return ticket;
}

// User Profile Mutations
export async function updateUserEmail(payload: UpdateEmailPayload): Promise<{ success: boolean }> {
  await sleep(LATENCY);
  const user = findOrFail(MOCK_DATA.users, 'user-1', 'User');
  // In a real app, you'd have more robust validation
  if (!payload.newEmail.includes('@')) {
    throw new Error('Invalid email format.');
  }
  user.email = payload.newEmail;
  console.log(`Mock API: User email updated to ${payload.newEmail}`);
  return { success: true };
}

export async function updateContactInfo(payload: UpdateContactInfoPayload): Promise<{ success: boolean }> {
    await sleep(LATENCY);
    const user = findOrFail(MOCK_DATA.users, 'user-1', 'User');
    
    // Update user object with payload data
    Object.assign(user, payload);
    
    // In a real app, you might update the user's full name if first/last name changes
    if (payload.firstName || payload.lastName) {
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    
    console.log('Mock API: User contact info updated', user);
    return { success: true };
}

    