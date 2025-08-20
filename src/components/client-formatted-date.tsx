
'use client';

import { useState, useEffect } from 'react';

// A simple component to format dates on the client to avoid hydration errors
export function ClientFormattedDate({ date, options }: { date: string | number | Date, options: Intl.DateTimeFormatOptions }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    // A simple hack to avoid re-rendering with a different format on the server.
    // We can use a more robust solution if needed.
    const tempOptions = {...options};
    setFormattedDate(new Date(date).toLocaleString('en-US', tempOptions));
  }, [date, options]);

  // Render a placeholder on the server and initial client render
  if (!formattedDate) {
    return null; // Or a loading skeleton
  }

  return <>{formattedDate}</>;
}
