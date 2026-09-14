'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface LinksProps {
    variant?: 'desktop-header' | 'mobile-bottom' | 'mobile-drawer';
    activeHref?: string;
    onNavigate?: () => void;
}

export default function Links({
    variant = 'desktop-header',
    activeHref,
    onNavigate,
}: LinksProps) {
    const pathname = usePathname();
    const t = useTranslations('Navigation');

    const navItems = [
        {
            key: 'customers',
            label: t('customers'),
            href: '/customers',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            ),
        },
        {
            key: 'details',
            label: t('details'),
            href: '/details',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                </svg>
            ),
        },
        {
            key: 'cashBook',
            label: t('cashBook'),
            href: '/cash-book',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            ),
        },
        {
            key: 'exchange',
            label: t('exchange'),
            href: '/exchange',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                </svg>
            ),
        },
        {
            key: 'settings',
            label: t('settings'),
            href: '/settings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                </svg>
            ),
        },
    ];

    const isCurrentActive = (itemHref: string) => {
        if (activeHref) return activeHref === itemHref;
        if (itemHref === '/') return pathname === '/';
        return pathname.startsWith(itemHref);
    };

    // 1. Large Screen Desktop Header Nav (Pill style matching headerForLargescreen.png)
    if (variant === 'desktop-header') {
        return (
            <nav className="flex items-center gap-1.5 p-1 bg-surface-subtle/80 backdrop-blur rounded-2xl border border-surface-border">
                {navItems.map(item => {
                    const active = isCurrentActive(item.href);
                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            onClick={onNavigate}
                            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 select-none ${active
                                    ? 'bg-surface text-brand shadow-sm border border-surface-border'
                                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-hover/60'
                                }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        );
    }

    // 2. Mobile Bottom Docked Navigation Bar (Exact match to Cash Book Register.png)
    if (variant === 'mobile-bottom') {
        return (
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-surface-border px-2 py-1.5 lg:hidden shadow-2xl">
                <div className="flex items-center justify-around max-w-lg mx-auto">
                    {navItems.map(item => {
                        const active = isCurrentActive(item.href);
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                onClick={onNavigate}
                                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all duration-200 ${active
                                        ? 'text-brand scale-105'
                                        : 'text-content-muted hover:text-content-primary'
                                    }`}
                            >
                                <div
                                    className={`p-1.5 rounded-xl transition-all ${active
                                            ? 'bg-brand/15 text-brand shadow-glow-brand'
                                            : 'text-content-muted'
                                        }`}
                                >
                                    {item.icon}
                                </div>
                                <span className="tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        );
    }

    // 3. Mobile Drawer / Sidebar variant (if needed)
    return (
        <nav className="flex flex-col gap-1 w-full">
            {navItems.map(item => {
                const active = isCurrentActive(item.href);
                return (
                    <Link
                        key={item.key}
                        href={item.href}
                        onClick={onNavigate}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                ? 'bg-brand/15 text-brand border border-brand/30'
                                : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                            }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
