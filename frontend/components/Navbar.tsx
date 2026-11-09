'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Calendar, CalendarCheck, ChevronDown, Globe, LayoutDashboard, ListChecks, LogOut, LucideIcon, Menu, Plus, Ticket, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';
import Logo from '@/components/Logo';
import Avatar from '@/components/ui/Avatar';
import api from '@/lib/api';

interface MenuItem {
    href: string;
    label: string;
    icon: LucideIcon;
    active: boolean;
    count?: number;
}

export default function Navbar() {
    const { isAuthenticated, isLoading, role, isApprovedOrganizer, userName, logout } = useAuth();
    const { language, setLanguage, t } = useTranslation();
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);
    const [counts, setCounts] = useState<{ events: number; orgs: number }>({ events: 0, orgs: 0 });
    const profileRef = useRef<HTMLDivElement>(null);
    const adminRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
            if (adminRef.current && !adminRef.current.contains(e.target as Node)) setAdminOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    useEffect(() => {
        if (role !== 'Admin') return;
        Promise.all([
            api.get('/admin/events/pending', { params: { page: 1, pageSize: 1 } }).catch(() => null),
            api.get('/admin/organizers/pending', { params: { page: 1, pageSize: 1 } }).catch(() => null),
        ]).then(([e, o]) => setCounts({ events: e?.data?.totalCount ?? 0, orgs: o?.data?.totalCount ?? 0 }));
    }, [role, pathname]);

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        router.push('/');
    };

    const canCreateEvent = role === 'Admin' || (role === 'Organizer' && isApprovedOrganizer);
    const links = [
        { href: '/', label: t('ui.nav.events'), active: pathname === '/' || pathname.startsWith('/events/') && !pathname.startsWith('/events/create') },
        ...(isAuthenticated ? [{ href: '/dashboard', label: t('ui.nav.tickets'), active: pathname === '/dashboard' }] : []),
        ...(isAuthenticated && canCreateEvent ? [{ href: '/dashboard/events', label: t('ui.nav.myEvents'), active: pathname.startsWith('/dashboard/events') || pathname.startsWith('/events/create') }] : []),
    ];
    const isAdmin = isAuthenticated && role === 'Admin';
    const adminActive = pathname.startsWith('/admin');
    const adminItems: MenuItem[] = [
        { href: '/admin', label: t('ui.side.overview'), icon: LayoutDashboard, active: pathname === '/admin' },
        { href: '/admin/events/pending', label: t('ui.side.pendingEvents'), icon: ListChecks, active: pathname.startsWith('/admin/events/pending'), count: counts.events },
        { href: '/admin/organizers', label: t('ui.side.organizerRequests'), icon: UserPlus, active: pathname.startsWith('/admin/organizers'), count: counts.orgs },
        { href: '/admin/events', label: t('ui.side.allEvents'), icon: Calendar, active: pathname === '/admin/events' },
        { href: '/admin/users', label: t('ui.side.users'), icon: Users, active: pathname.startsWith('/admin/users') },
    ];
    const adminCount = counts.events + counts.orgs;
    const name = userName || t('ui.nav.profile');

    return (
        <header className="sticky top-0 z-40 border-b border-line bg-white">
            <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow">
                {t('events.skipToContent')}
            </a>
            <nav className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4 md:h-16 xl:px-0" aria-label="Main">
                <div className="flex items-center gap-6">
                    <Logo label={t('events.brandHome')} />
                    <div className="hidden items-center gap-1 lg:flex">
                        {links.map(l => (
                            <Link
                                key={l.href}
                                href={l.href}
                                aria-current={l.active ? 'page' : undefined}
                                className={`whitespace-nowrap rounded-[10px] px-3 py-2 text-sm transition-colors ${l.active ? 'bg-brand-50 font-semibold text-brand-700' : 'font-medium text-muted hover:text-ink'}`}
                            >
                                {l.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <div className="relative" ref={adminRef}>
                                <button
                                    onClick={() => setAdminOpen(o => !o)}
                                    aria-expanded={adminOpen}
                                    aria-haspopup="menu"
                                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 py-2 text-sm transition-colors ${adminActive ? 'bg-brand-50 font-semibold text-brand-700' : 'font-medium text-muted hover:text-ink'}`}
                                >
                                    {t('ui.nav.admin')}
                                    {adminCount > 0 && <span className="rounded-full bg-accent-500 px-[7px] text-xs font-medium leading-5 text-white">{adminCount}</span>}
                                    <ChevronDown className={`h-4 w-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                                </button>
                                {adminOpen && (
                                    <div role="menu" className="absolute left-0 top-full mt-2 w-64 rounded-[14px] border border-line bg-white p-1.5 shadow-card-hover">
                                        {adminItems.map(item => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    role="menuitem"
                                                    href={item.href}
                                                    aria-current={item.active ? 'page' : undefined}
                                                    onClick={() => setAdminOpen(false)}
                                                    className={`flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm ${item.active ? 'bg-brand-50 font-semibold text-brand-700' : 'font-medium text-muted hover:bg-neutral-bg hover:text-ink'}`}
                                                >
                                                    <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-brand-600' : ''}`} aria-hidden="true" />
                                                    <span className="flex-1 truncate">{item.label}</span>
                                                    {!!item.count && <span className="rounded-full bg-accent-500 px-[7px] text-xs font-medium leading-5 text-white">{item.count}</span>}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!isLoading && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                            aria-label={t('events.switchLanguage')}
                            className="hidden items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-sm font-medium text-muted hover:text-ink md:flex"
                        >
                            <Globe className="h-4 w-4 text-subtle" aria-hidden="true" />
                            {language.toUpperCase()}
                        </button>
                        {isAuthenticated ? (
                            <>
                                {canCreateEvent && (
                                    <Link href="/events/create" className="btn btn-primary hidden lg:inline-flex">
                                        <Plus aria-hidden="true" />
                                        {t('nav.createEvent')}
                                    </Link>
                                )}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setProfileOpen(o => !o)}
                                        aria-expanded={profileOpen}
                                        aria-haspopup="menu"
                                        className="flex items-center gap-2 rounded-[10px] p-1 hover:bg-neutral-bg"
                                    >
                                        <Avatar name={name} />
                                        <span className="hidden max-w-40 truncate text-sm font-medium text-ink xl:inline">{name}</span>
                                    </button>
                                    {profileOpen && (
                                        <div role="menu" className="absolute right-0 top-full mt-2 w-56 rounded-[14px] border border-line bg-white p-1.5 shadow-card-hover">
                                            <Link role="menuitem" href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-muted hover:bg-neutral-bg hover:text-ink">
                                                <Ticket className="h-4 w-4" aria-hidden="true" />
                                                {t('ui.nav.tickets')}
                                            </Link>
                                            {canCreateEvent && (
                                                <Link role="menuitem" href="/dashboard/events" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-muted hover:bg-neutral-bg hover:text-ink">
                                                    <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                                                    {t('ui.nav.myEvents')}
                                                </Link>
                                            )}
                                            <button role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm font-medium text-muted hover:bg-neutral-bg hover:text-ink">
                                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                                {t('nav.signOut')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="btn btn-ghost hidden md:inline-flex">{t('nav.signIn')}</Link>
                                <Link href="/auth/register" className="btn btn-primary hidden md:inline-flex">{t('nav.register')}</Link>
                                <Link href="/auth/login" className="btn btn-primary btn-sm md:hidden">{t('nav.signIn')}</Link>
                            </>
                        )}
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            aria-label={t('ui.nav.menu')}
                            aria-expanded={menuOpen}
                            className="btn btn-ghost btn-icon lg:hidden"
                        >
                            {menuOpen ? <X className="text-ink" /> : <Menu className="text-ink" />}
                        </button>
                    </div>
                )}
            </nav>
            {menuOpen && (
                <div className="border-t border-line px-4 py-3 lg:hidden">
                    <div className="flex flex-col gap-1">
                        {links.map(l => (
                            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className={`rounded-[10px] px-3 py-2.5 text-sm ${l.active ? 'bg-brand-50 font-semibold text-brand-700' : 'font-medium text-muted'}`}>
                                {l.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <>
                                <p className="caps-label mt-2 px-3 text-subtle">{t('ui.nav.admin')}</p>
                                {adminItems.map(item => (
                                    <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`rounded-[10px] px-3 py-2.5 text-sm ${item.active ? 'bg-brand-50 font-semibold text-brand-700' : 'font-medium text-muted'}`}>
                                        {item.label}{item.count ? ` · ${item.count}` : ''}
                                    </Link>
                                ))}
                            </>
                        )}
                        {canCreateEvent && (
                            <Link href="/events/create" onClick={() => setMenuOpen(false)} className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-muted">{t('nav.createEvent')}</Link>
                        )}
                        {!isAuthenticated && (
                            <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="rounded-[10px] px-3 py-2.5 text-sm font-medium text-muted">{t('nav.register')}</Link>
                        )}
                        <button onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')} className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium text-muted">
                            <Globe className="h-4 w-4" aria-hidden="true" />
                            {language === 'ru' ? 'English' : 'Русский'}
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
