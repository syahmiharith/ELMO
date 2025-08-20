
'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// This page is no longer used and redirects to the profile page.
export default function RecommendationsPage() {
  useEffect(() => {
    redirect('/profile');
  }, []);

  return null;
}
