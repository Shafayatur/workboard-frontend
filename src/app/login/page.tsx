'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const user = await login(email, password);
      setUser(user);
      router.push('/tasks');
    } catch {
      setError('Could not sign in with those details.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl mb-1">Sign in</h1>
        <p className="text-muted text-sm mb-8">Get to your tasks and traces.</p>

        <label className="block font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border-[1.5px] border-line px-3.5 py-3 text-sm mb-4 outline-none focus:border-red"
          placeholder="you@studio.com"
        />

        <label className="block font-mono text-[10px] tracking-wider uppercase text-muted mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border-[1.5px] border-line px-3.5 py-3 text-sm mb-2 outline-none focus:border-red"
          placeholder="••••••••••"
        />

        {error && <p className="text-red text-xs mt-2">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red text-white font-semibold text-sm py-3 mt-6 disabled:opacity-60"
        >
          {isLoading ? 'Signing in…' : 'Enter'}
        </button>
      </form>
    </main>
  );
}
