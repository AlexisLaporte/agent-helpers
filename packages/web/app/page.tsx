'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to browse page (main dashboard)
    redirect('/browse');
  }, []);

  return null;
}
