'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Navbar from './Navbar';

type AuthStatus = 'checking' | 'authed' | 'unauthed';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isAuthenticated()) {
      setStatus('authed');
    } else {
      setStatus('unauthed');
      router.replace('/login');
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [router]);

  if (status !== 'authed') return null;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}