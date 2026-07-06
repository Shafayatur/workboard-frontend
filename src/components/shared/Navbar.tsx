'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

const LINKS = [
    { href: '/tasks', label: 'Workboard' },
    { href: '/annotate', label: 'Trace' },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    function handleLogout() {
        logout();
        router.push('/login');
    }

    return (
        <header className="flex items-center justify-between px-8 py-4 border-b-2 border-ink">
            <span className="font-display font-extrabold text-lg">
                work<span className="text-red">board</span>
            </span>

            <nav className="flex items-center gap-6">
                {LINKS.map((link) => {
                    const active = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`font-mono text-xs uppercase tracking-wider transition-colors ${active ? 'text-ink font-semibold' : 'text-muted hover:text-ink'
                                }`}
                        >
                            {link.label}
                        </Link>
                    );
                })}
                <button
                    onClick={handleLogout}
                    className="font-mono text-xs uppercase tracking-wider text-muted hover:text-red transition-colors"
                >
                    Log out
                </button>
            </nav>
        </header>
    );
}