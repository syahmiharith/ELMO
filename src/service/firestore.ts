
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Club, ClubEvent, User, ApprovalRequest } from '@elmo/shared-types';

/**
 * Fetches a single user document from Firestore by their ID.
 * @param uid The user's ID.
 * @returns A promise that resolves to the User object or null if not found.
 */
export async function getUser(uid: string): Promise<User | null> {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
    } else {
        return null;
    }
}

/**
 * Creates a new user document in Firestore.
 * @param userData The partial user data for the new user.
 * @returns A promise that resolves when the document is created.
 */
export async function createUser(userData: Partial<User> & { id: string, email: string, name: { display: string } }) {
    const userDocRef = doc(db, 'users', userData.id);
    const now = Date.now();
    const newUser: User = {
        universityIds: [],
        verificationStatus: 'unverified',
        ...userData,
        consents: { tos: now, privacy: now },
        audit: { createdAt: now, updatedAt: now, lastEditedBy: userData.id }
    };
    await setDoc(userDocRef, newUser);
}


/**
 * Fetches all approved clubs from Firestore.
 * @returns A promise that resolves to an array of Club objects.
 */
export async function getClubs(): Promise<Club[]> {
    // In a real app, you'd have more complex querying/filtering,
    // but for now, we fetch all and filter client-side.
    const clubsCollection = collection(db, 'clubs');
    const querySnapshot = await getDocs(clubsCollection);

    const clubs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Club));

    // Filtering for 'approved' on the client as a placeholder
    return clubs.filter(c => c.isApproved);
}

/**
 * Fetches all published events from Firestore.
 * @returns A promise that resolves to an array of ClubEvent objects.
 */
export async function getEvents(): Promise<ClubEvent[]> {
    const eventsCollection = collection(db, 'events');
    const q = query(eventsCollection, where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);

    const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ClubEvent));

    return events;
}

/**
 * Fetches all users from Firestore.
 * @returns A promise that resolves to an array of User objects.
 */
export async function getUsers(): Promise<User[]> {
    const usersCollection = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollection);

    const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as User));

    return users;
}

/**
 * Fetches all pending approval requests from Firestore.
 * @returns A promise that resolves to an array of ApprovalRequest objects.
 */
export async function getPendingApprovalRequests(): Promise<ApprovalRequest[]> {
    const requestsCollection = collection(db, 'approvalRequests');
    const q = query(requestsCollection, where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);

    const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ApprovalRequest));

    return requests;
}

