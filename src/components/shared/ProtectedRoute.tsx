'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Read auth synchronously on first render so we don't flash protected
  // content before the effect below has a chance to redirect.
  const [authed] = useState(() => isAuthenticated());

  useEffect(() => {
    if (!authed) router.replace('/login');
  }, [authed, router]);

  if (!authed) return null;
  return <>{children}</>;
}
