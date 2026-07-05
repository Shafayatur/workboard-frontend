'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

type AuthStatus = 'checking' | 'authed' | 'unauthed';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Both server and the client's very first render show 'checking' — identical
  // output on both sides, so there's nothing for hydration to mismatch on.
  // The real check only happens after mount, inside the effect below.
  const [status, setStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    // This IS "subscribing to an external system" (localStorage) per the
    // rule's own guidance; it can't run during render because localStorage
    // isn't available during SSR, which is the whole point of this component.
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
  return <>{children}</>;
}