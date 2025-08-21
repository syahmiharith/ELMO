

/**
 * @file API function stubs.
 * This file defines the contract for the backend API.
 * These functions are not implemented and will throw an error if called.
 * They are used to ensure the frontend code is consistent with the backend API.
 * The actual implementation is in `mock-api.ts` for local development.
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
} from '@/types/domain';

// A utility function to make it clear that a function is not implemented.
function unimplemented(name: string): any {
  throw new Error(`UNIMPLEMENTED: ${name}`);
}

// ==========
// USERS API
// ==========

/**
 * getUser - Fetches the details of a single user by their ID.
 * @param {string} userId - The unique identifier for the user.
 * @returns {Promise<User>} A promise that resolves to the user object.
 * @Auth Public access.
 * @Errors Throws a 404 error if the user is not found.
 * @Example `const user = await getUser('user-1');`
 */
export async function getUser(userId: string): Promise<User> {
  unimplemented('getUser');
}

/**
 * listUserClubs - Fetches the list of clubs a specific user is a member of.
 * @param {string} userId - The ID of the user whose clubs to fetch.
 * @returns {Promise<Club[]>} A promise that resolves to an array of the user's clubs.
 * @Auth Requires at least student-level authentication.
 * @Errors Throws an error if the user is not found or not authenticated.
 * @Example `const userClubs = await listUserClubs('user-2');`
 */
export async function listUserClubs(userId: string): Promise<Club[]> {
  unimplemented('listUserClubs');
}


// ==========
// CLUBS API
// ==========

/**
 * listClubs - Fetches a paginated list of clubs, with optional filtering.
 * @param {ClubQuery} [query] - Optional query parameters for searching and filtering.
 * @returns {Promise<Club[]>} A promise that resolves to an array of clubs.
 * @Auth Public access. Visibility of clubs is determined by the server.
 * @Errors Throws an error if the network request fails.
 * @Example `const clubs = await listClubs({ search: 'Tech', category: 'Technology' });`
 */
export async function listClubs(query?: ClubQuery): Promise<Club[]> {
  unimplemented('listClubs');
}

/**
 * getClub - Fetches the details of a single club by its ID.
 * @param {string} clubId - The unique identifier for the club.
 * @returns {Promise<Club>} A promise that resolves to the club object.
 * @Auth Public access.
 * @Errors Throws a 404 error if the club is not found.
 * @Example `const club = await getClub('club-1');`
 */
export async function getClub(clubId: string): Promise<Club> {
  unimplemented('getClub');
}

/**
 * listClubMembers - Fetches a list of members for a specific club.
 * @param {string} clubId - The unique identifier for the club.
 * @returns {Promise<ClubMember[]>} A promise that resolves to an array of user objects with their roles.
 * @Auth Requires at least student-level authentication. Member visibility may be restricted by club settings.
 * @Errors Throws an error if the club is not found or the user lacks permission.
 * @Example `const members = await listClubMembers('club-1');`
 */
export async function listClubMembers(clubId: string): Promise<ClubMember[]> {
  unimplemented('listClubMembers');
}

/**
 * listClubEvents - Fetches a list of events hosted by a specific club.
 * @param {string} clubId - The unique identifier for the club.
 * @returns {Promise<Event[]>} A promise that resolves to an array of event objects.
 * @Auth Public access.
 * @Errors Throws an error if the club is not found.
 * @Example `const events = await listClubEvents('club-1');`
 */
export async function listClubEvents(clubId: string): Promise<Event[]> {
  unimplemented('listClubEvents');
}

/**
 * listClubFiles - Fetches a list of files for a specific club.
 * @param {string} clubId - The unique identifier for the club.
 * @returns {Promise<ClubFile[]>} A promise that resolves to an array of file objects.
 * @Auth Requires at least member-level authentication. Visibility is determined by file permissions.
 * @Errors Throws an error if the club is not found or the user lacks permission.
 * @Example `const files = await listClubFiles('club-1');`
 */
export async function listClubFiles(clubId: string): Promise<ClubFile[]> {
    unimplemented('listClubFiles');
}

// ==========
// EVENTS API
// ==========

/**
 * listEvents - Fetches a paginated list of all events, with optional filtering and sorting. By default, events are sorted by relevance to the user (location, interests).
 * @param {EventQuery} [query] - Optional query parameters for searching, filtering, and sorting.
 * @returns {Promise<Event[]>} A promise that resolves to an array of events.
 * @Auth Public access.
 * @Errors Throws an error if the network request fails.
 * @Example `const events = await listEvents({ search: 'Summit', sortBy: 'popularity' });`
 */
export async function listEvents(query?: EventQuery): Promise<Event[]> {
  unimplemented('listEvents');
}

/**
 * getEvent - Fetches the details of a single event by its ID.
 * @param {string} eventId - The unique identifier for the event.
 * @returns {Promise<Event>} A promise that resolves to the event object.
 * @Auth Public access.
 * @Errors Throws a 404 error if the event is not found.
 * @Example `const event = await getEvent('event-1');`
 */
export async function getEvent(eventId: string): Promise<Event> {
  unimplemented('getEvent');
}

// ==========
// PERSONALIZED API (MY-*)
// ==========

/**
 * listMyClubs - Fetches the list of clubs the current user is a member of.
 * @returns {Promise<Club[]>} A promise that resolves to an array of the user's clubs.
 * @Auth Requires student-level authentication.
 * @Errors Throws an error if the user is not authenticated.
 * @Example `const myClubs = await listMyClubs();`
 */
export async function listMyClubs(): Promise<Club[]> {
  unimplemented('listMyClubs');
}

/**
 * listMyMemberships - Fetches all memberships (approved, pending, etc.) for the current user.
 * @returns {Promise<Membership[]>} A promise that resolves to an array of the user's memberships.
 * @Auth Requires student-level authentication.
 * @Errors Throws an error if the user is not authenticated.
 * @Example `const myMemberships = await listMyMemberships();`
 */
export async function listMyMemberships(): Promise<Membership[]> {
    unimplemented('listMyMemberships');
}

/**
 * listMyOrders - Fetches the order history for the current user.
 * @returns {Promise<Order[]>} A promise that resolves to an array of the user's orders.
 * @Auth Requires student-level authentication.
 * @Errors Throws an error if the user is not authenticated.
 * @Example `const myOrders = await listMyOrders();`
 */
export async function listMyOrders(): Promise<Order[]> {
  unimplemented('listMyOrders');
}

/**
 * listMyTickets - Fetches the list of tickets for the current user.
 * @returns {Promise<Ticket[]>} A promise that resolves to an array of the user's tickets.
 * @Auth Requires student-level authentication.
 * @Errors Throws an error if the user is not authenticated.
 * @Example `const myTickets = await listMyTickets();`
 */
export async function listMyTickets(): Promise<Ticket[]> {
  unimplemented('listMyTickets');
}

// ==========
// ORDERS & TICKETS API
// ==========

/**
 * getOrder - Fetches the details of a single order by its ID.
 * @param {string} orderId - The unique identifier for the order.
 * @returns {Promise<Order>} A promise that resolves to the order object.
 * @Auth Requires ownership or manager-level permissions.
 * @Errors Throws a 404 if not found or 403 if forbidden.
 * @Example `const order = await getOrder('ORD-001');`
 */
export async function getOrder(orderId: string): Promise<Order> {
  unimplemented('getOrder');
}

/**
 * listEventOrders - Fetches all orders associated with a specific event.
 * @param {string} eventId - The unique identifier for the event.
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders.
 * @Auth Requires club admin or university admin permissions for the event's club.
 * @Errors Throws an error if the user lacks permissions.
 * @Example `const orders = await listEventOrders('event-1');`
 */
export async function listEventOrders(eventId: string): Promise<Order[]> {
  unimplemented('listEventOrders');
}

/**
 * getTicket - Fetches the details of a single ticket by its ID for check-in.
 * @param {string} ticketId - The unique identifier for the ticket.
 * @returns {Promise<Ticket>} A promise that resolves to the ticket object.
 * @Auth Requires club admin or university admin permissions for the ticket's event.
 * @Errors Throws a 404 if not found or 403 if forbidden.
 * @Example `const ticket = await getTicket('TKT-001');`
 */
export async function getTicket(ticketId: string): Promise<Ticket> {
  unimplemented('getTicket');
}

// ==========
// FEEDBACK API
// ==========

/**
 * listClubFeedback - Fetches a list of feedback for a specific club.
 * @param {string} clubId - The unique identifier for the club.
 * @returns {Promise<Feedback[]>} A promise that resolves to an array of feedback objects.
 * @Auth Requires admin permission for the club.
 */
export async function listClubFeedback(clubId: string): Promise<Feedback[]> {
    unimplemented('listClubFeedback');
}

/**
 * createClubFeedback - Submits new feedback for a club.
 * @param {string} clubId - The unique identifier for the club.
 * @param {CreateFeedbackPayload} payload - The feedback data.
 * @returns {Promise<Feedback>} The newly created feedback object.
 * @Auth Requires member permission for the club.
 */
export async function createClubFeedback(clubId: string, payload: CreateFeedbackPayload): Promise<Feedback> {
    unimplemented('createClubFeedback');
}

// ==========
// PROPOSALS API
// ==========

/**
 * listClubProposals - Fetches a list of proposals for a specific club.
 * @param {string} clubId - The unique identifier for the club.
 * @returns {Promise<Proposal[]>} A promise that resolves to an array of proposal objects.
 * @Auth Requires admin permission for the club.
 */
export async function listClubProposals(clubId: string): Promise<Proposal[]> {
    unimplemented('listClubProposals');
}

/**
 * createClubProposal - Submits a new proposal for a club.
 * @param {string} clubId - The unique identifier for the club.
 * @param {CreateProposalPayload} payload - The proposal data.
 * @returns {Promise<Proposal>} The newly created proposal object.
 * @Auth Requires admin permission for the club.
 */
export async function createClubProposal(clubId: string, payload: CreateProposalPayload): Promise<Proposal> {
    unimplemented('createClubProposal');
}

// ==========
// COMMENTS API
// ==========

/**
 * listFeedbackComments - Fetches comments for a feedback item.
 * @param {string} feedbackId - The unique identifier for the feedback.
 * @returns {Promise<Comment[]>} A promise that resolves to an array of comment objects.
 */
export async function listFeedbackComments(feedbackId: string): Promise<Comment[]> {
    unimplemented('listFeedbackComments');
}

/**
 * createFeedbackComment - Adds a comment to a feedback item.
 * @param {string} feedbackId - The unique identifier for the feedback.
 * @param {CreateCommentPayload} payload - The comment data.
 * @returns {Promise<Comment>} The newly created comment object.
 */
export async function createFeedbackComment(feedbackId: string, payload: CreateCommentPayload): Promise<Comment> {
    unimplemented('createFeedbackComment');
}

/**
 * listProposalComments - Fetches comments for a proposal.
 * @param {string} proposalId - The unique identifier for the proposal.
 * @returns {Promise<Comment[]>} A promise that resolves to an array of comment objects.
 */
export async function listProposalComments(proposalId: string): Promise<Comment[]> {
    unimplemented('listProposalComments');
}

/**
 * createProposalComment - Adds a comment to a proposal.
 * @param {string} proposalId - The unique identifier for the proposal.
 * @param {CreateCommentPayload} payload - The comment data.
 * @returns {Promise<Comment>} The newly created comment object.
 */
export async function createProposalComment(proposalId: string, payload: CreateCommentPayload): Promise<Comment> {
    unimplemented('createProposalComment');
}


// ==========
// MUTATIONS
// ==========

// Club Mutations
/**
 * createClub - Creates a new club.
 * @param {CreateClubPayload} payload - The data for the new club.
 * @returns {Promise<Club>} The newly created club object.
 * @Auth Requires University Admin role.
 * @Errors Throws validation errors or permission errors.
 * @Example `const newClub = await createClub({ name: 'New Club', ... });`
 */
export async function createClub(payload: CreateClubPayload): Promise<Club> {
  unimplemented('createClub');
}

/**
 * updateClub - Updates an existing club's details.
 * @param {string} clubId - The ID of the club to update.
 * @param {UpdateClubPayload} payload - The data to update.
 * @returns {Promise<Club>} The updated club object.
 * @Auth Requires Club Admin or University Admin role for the club.
 * @Errors Throws validation errors, 404 if not found, or 403 if forbidden.
 * @Example `await updateClub('club-1', { description: 'A new description.' });`
 */
export async function updateClub(clubId: string, payload: UpdateClubPayload): Promise<Club> {
  unimplemented('updateClub');
}

/**
 * archiveClub - Archives a club, making it inactive.
 * @param {string} clubId - The ID of the club to archive.
 * @returns {Promise<{ success: boolean }>} A promise indicating success.
 * @Auth Requires University Admin role.
 * @Errors Throws 404 if not found, or 403 if forbidden.
 * @Example `await archiveClub('club-1');`
 */
export async function archiveClub(clubId: string): Promise<{ success: boolean }> {
  unimplemented('archiveClub');
}

// Membership Mutations
/**
 * requestMembership - Submits a request to join a club.
 * @param {string} clubId - The ID of the club to join.
 * @returns {Promise<Membership>} The pending membership object.
 * @Auth Requires student-level authentication.
 * @Errors Throws an error if the user has already requested or is a member.
 * @Example `await requestMembership('club-1');`
 */
export async function requestMembership(clubId: string): Promise<Membership> {
  unimplemented('requestMembership');
}

/**
 * approveMembership - Approves a pending membership request.
 * @param {string} clubId - The ID of the club.
 * @param {string} userId - The ID of the user to approve.
 * @returns {Promise<Membership>} The approved membership object.
 * @Auth Requires Club Admin or University Admin role for the club.
 * @Errors Throws 404 if request not found, or 403 if forbidden.
 * @Example `await approveMembership('club-1', 'user-2');`
 */
export async function approveMembership(clubId: string, userId: string): Promise<Membership> {
  unimplemented('approveMembership');
}

/**
 * rejectMembership - Rejects a pending membership request.
 * @param {string} clubId - The ID of the club.
 * @param {string} userId - The ID of the user to reject.
 * @returns {Promise<{ success: boolean }>} A promise indicating success.
 * @Auth Requires Club Admin or University Admin role for the club.
 * @Errors Throws 404 if request not found, or 403 if forbidden.
 * @Example `await rejectMembership('club-1', 'user-2');`
 */
export async function rejectMembership(clubId: string, userId: string): Promise<{ success: boolean }> {
  unimplemented('rejectMembership');
}

/**
 * cancelMembershipRequest - Cancels a user's own pending membership request.
 * @param {string} clubId - The ID of the club for which to cancel the request.
 * @returns {Promise<{ success: boolean }>} A promise indicating success.
 * @Auth Requires student-level authentication and a pending request for the club.
 * @Errors Throws an error if no pending request exists.
 * @Example `await cancelMembershipRequest('club-1');`
 */
export async function cancelMembershipRequest(clubId: string): Promise<{ success: boolean }> {
    unimplemented('cancelMembershipRequest');
}

/**
 * leaveClub - Allows a user to leave a club they are a member of.
 * @param {string} clubId - The ID of the club to leave.
 * @returns {Promise<{ success: boolean }>} A promise indicating success.
 * @Auth Requires student-level authentication and current membership.
 * @Errors Throws an error if the user is not a member.
 * @Example `await leaveClub('club-1');`
 */
export async function leaveClub(clubId: string): Promise<{ success: boolean }> {
  unimplemented('leaveClub');
}

// Event Mutations
/**
 * createEvent - Creates a new event for a club.
 * @param {string} clubId - The ID of the club creating the event.
 * @param {CreateEventPayload} payload - The data for the new event.
 * @returns {Promise<Event>} The newly created event object.
 * @Auth Requires Club Admin or University Admin role for the club.
 * @Errors Throws validation errors or permission errors.
 * @Example `const newEvent = await createEvent('club-1', { name: 'New Event', ... });`
 */
export async function createEvent(clubId: string, payload: CreateEventPayload): Promise<Event> {
  unimplemented('createEvent');
}

/**
 * updateEvent - Updates an existing event's details.
 * @param {string} eventId - The ID of the event to update.
 * @param {UpdateEventPayload} payload - The data to update.
 * @returns {Promise<Event>} The updated event object.
 * @Auth Requires Club Admin or University Admin role for the event's club.
 * @Errors Throws 404 if not found, 403 if forbidden.
 * @Example `await updateEvent('event-1', { location: 'New Location' });`
 */
export async function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<Event> {
  unimplemented('updateEvent');
}

/**
 * cancelEvent - Cancels an event.
 * @param {string} eventId - The ID of the event to cancel.
 * @returns {Promise<{ success: boolean }>} A promise indicating success.
 * @Auth Requires Club Admin or University Admin role for the event's club.
 * @Errors Throws 404 if not found, or 403 if forbidden.
 * @Example `await cancelEvent('event-1');`
 */
export async function cancelEvent(eventId: string): Promise<{ success: boolean }> {
  unimplemented('cancelEvent');
}

/**
 * rsvpEvent - Creates an RSVP for an event, resulting in an order and tickets.
 * @param {string} eventId - The ID of the event to RSVP to.
 * @param {number} quantity - The number of tickets to request.
 * @returns {Promise<Order>} A promise that resolves to the newly created order.
 * @Auth Requires student-level authentication.
 * @Errors Throws an error if RSVPs are closed or user is already registered.
 * @Example `const order = await rsvpEvent('event-1', 2);`
 */
export async function rsvpEvent(eventId: string, quantity: number): Promise<Order> {
  unimplemented('rsvpEvent');
}

/**
 * cancelRsvp - Cancels an existing RSVP for an event.
 * @param {string} eventId - The ID of the event to cancel the RSVP for.
 * @returns {Promise<{ success: boolean }>} A promise indicating success.
 * @Auth Requires student-level authentication and an existing RSVP.
 * @Errors Throws an error if no RSVP exists for the user.
 * @Example `await cancelRsvp('event-1');`
 */
export async function cancelRsvp(eventId: string): Promise<{ success: boolean }> {
  unimplemented('cancelRsvp');
}

// Order & Ticket Mutations
/**
 * createOrder - Creates a new order (typically initiated from an RSVP).
 * @param {{ eventId: string, quantity: number }} payload - The payload containing the event ID and quantity.
 * @returns {Promise<Order>} The newly created order object.
 * @Auth Requires student-level authentication.
 * @Errors Throws validation or permission errors.
 * @Example `const order = await createOrder({ eventId: 'event-1', quantity: 2 });`
 */
export async function createOrder(payload: { eventId: string, quantity: number }): Promise<Order> {
  unimplemented('createOrder');
}

/**
 * attachReceipt - Attaches a payment receipt to an order.
 * @param {AttachReceiptPayload} payload - The order ID and receipt data URI.
 * @returns {Promise<Order>} The updated order object with status 'under_review'.
 * @Auth Requires ownership of the order.
 * @Errors Throws 404 if order not found, or if order is not in 'awaiting_payment' status.
 * @Example `await attachReceipt({ orderId: 'ORD-003', receiptDataUri: 'data:...' });`
 */
export async function attachReceipt(payload: AttachReceiptPayload): Promise<Order> {
  unimplemented('attachReceipt');
}

/**
 * reviewOrder - Approves or rejects an order after reviewing a receipt.
 * @param {ReviewOrderPayload} payload - The order ID and review decision.
 * @returns {Promise<Order>} The updated order object.
 * @Auth Requires Club Admin or University Admin role for the event's club.
 * @Errors Throws 404 if order not found, or if order is not in 'under_review' status.
 * @Example `await reviewOrder({ orderId: 'ORD-005', isApproved: true });`
 */
export async function reviewOrder(payload: ReviewOrderPayload): Promise<Order> {
  unimplemented('reviewOrder');
}

/**
 * checkInTicket - Redeems a ticket, marking it as used.
 * @param {string} ticketId - The ID of the ticket to check in.
 * @returns {Promise<Ticket>} The updated ticket object with status 'redeemed'.
 * @Auth Requires Club Admin or University Admin role for the ticket's event.
 * @Errors Throws 404 if ticket not found, or if ticket has already been redeemed.
 * @Example `await checkInTicket('TKT-001');`
 */
export async function checkInTicket(ticketId: string): Promise<Ticket> {
  unimplemented('checkInTicket');
}

// User Profile Mutations
/**
 * updateUserEmail - Updates the user's email address.
 * @param {UpdateEmailPayload} payload - The new email for the user.
 * @returns {Promise<{ success: boolean }>} A promise indicating success.
 * @Auth Requires user to be authenticated.
 * @Errors Throws validation errors.
 * @Example `await updateUserEmail({ newEmail: 'new.email@university.edu' });`
 */
export async function updateUserEmail(payload: UpdateEmailPayload): Promise<{ success: boolean }> {
    unimplemented('updateUserEmail');
}

/**
 * updateContactInfo - Updates the user's contact information.
 * @param {UpdateContactInfoPayload} payload - The contact info for the user.
 * @returns {Promise<{ success: boolean }>} A promise indicating success.
 * @Auth Requires user to be authenticated.
 * @Errors Throws validation errors.
 * @Example `await updateContactInfo({ firstName: 'John' });`
 */
export async function updateContactInfo(payload: UpdateContactInfoPayload): Promise<{ success: boolean }> {
    unimplemented('updateContactInfo');
}

// File Mutations
/**
 * uploadClubFile - Uploads a file to a club's shared resources.
 * @param {string} clubId - The ID of the club.
 * @param {UploadFilePayload} payload - The file data and permissions.
 * @returns {Promise<ClubFile>} The newly created file object.
 * @Auth Requires Club Admin or University Admin role for the club.
 * @Errors Throws validation errors, 404 if club not found, or 403 if forbidden.
 * @Example `await uploadClubFile('club-1', { name: 'Meeting Notes.pdf', ... });`
 */
export async function uploadClubFile(clubId: string, payload: UploadFilePayload): Promise<ClubFile> {
    unimplemented('uploadClubFile');
}

/**
 * downloadClubFile - Gets a secure download URL for a club file.
 * @param {string} fileId - The ID of the file to download.
 * @returns {Promise<DownloadClubFileResponse>} A promise that resolves to an object containing the download URL.
 * @Auth Requires at least member-level authentication for the club.
 * @Errors Throws 404 if file not found, or 403 if forbidden.
 * @Example `const { downloadUrl } = await downloadClubFile('file-1');`
 */
export async function downloadClubFile(fileId: string): Promise<DownloadClubFileResponse> {
    unimplemented('downloadClubFile');
}


// Announcement Mutations
/**
 * createAnnouncement - Creates a new announcement for a club.
 * @param {string} clubId - The ID of the club.
 * @param {CreateAnnouncementPayload} payload - The data for the new announcement.
 * @returns {Promise<Announcement>} The newly created announcement object.
 * @Auth Requires Club Admin role for the club.
 */
export async function createAnnouncement(clubId: string, payload: CreateAnnouncementPayload): Promise<Announcement> {
    unimplemented('createAnnouncement');
}
