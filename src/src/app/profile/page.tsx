
'use client';
import { useAuth } from '@/context/auth-context';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page redirects to the logged-in user's profile page.
export default function ProfilePage() {
    const { user } = useAuth();
    useEffect(() => {
        if (user?.id) {
            redirect(`/profile/${user.id}`);
        }
    }, [user]);

    return null; // Or a loading spinner
}
