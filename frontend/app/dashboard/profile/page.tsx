'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, UserRound } from 'lucide-react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Avatar from '@/components/ui/Avatar';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';
import api from '@/lib/api';
import { CurrentUser } from '@/types';

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd className="text-sm font-medium text-ink break-all">{value}</dd>
        </div>
    );
}

export default function ProfilePage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { t } = useTranslation();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        api.get<CurrentUser>('/auth/me')
            .then(r => setUser(r.data))
            .catch(() => setError(t('ui.profile.loadFailed')));
    }, [authLoading, isAuthenticated, t]);

    const roleLabel = (role: string) => {
        if (role === 'Admin') return t('ui.profile.roleAdmin');
        if (role === 'Organizer') return t('ui.profile.roleOrganizer');
        return t('ui.profile.roleUser');
    };

    return (
        <AppShell kind="user">
            <PageHeader title={t('ui.profile.title')} subtitle={t('ui.profile.subtitle')} />
            {error && <Alert tone="danger">{error}</Alert>}
            {!user && !error ? (
                <div className="card p-6 text-sm text-muted">{t('loading')}</div>
            ) : user ? (
                <div className="card flex flex-col gap-6 p-6">
                    <div className="flex items-center gap-4">
                        <Avatar name={user.fullName || user.email} size="lg" />
                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-semibold text-ink">{user.fullName}</h2>
                            <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
                        </div>
                    </div>

                    <dl>
                        <Row label={t('ui.profile.email')} value={user.email} />
                        <Row label={t('ui.profile.name')} value={user.fullName} />
                        <Row label={t('ui.profile.role')} value={roleLabel(user.role)} />
                        {user.role === 'Organizer' && (
                            <Row
                                label={t('ui.profile.organizerStatus')}
                                value={user.isApprovedOrganizer ? t('ui.profile.organizerApproved') : t('ui.profile.organizerPending')}
                            />
                        )}
                        <Row
                            label={t('ui.profile.signInMethods')}
                            value={[
                                user.hasPassword ? t('ui.profile.methodPassword') : null,
                                user.linkedGoogle ? t('ui.profile.methodGoogle') : null,
                            ].filter(Boolean).join(' · ') || t('ui.profile.methodUnknown')}
                        />
                        <Row
                            label={t('ui.profile.twoFactor')}
                            value={user.twoFactorEnabled ? t('ui.profile.twoFactorOn') : t('ui.profile.twoFactorOff')}
                        />
                        <Row
                            label={t('ui.profile.memberSince')}
                            value={new Date(user.createdAt).toLocaleDateString()}
                        />
                    </dl>

                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/security" className="btn btn-secondary">
                            <Shield aria-hidden="true" />
                            {t('ui.nav.security')}
                        </Link>
                        <Link href="/dashboard" className="btn btn-ghost">
                            <UserRound aria-hidden="true" />
                            {t('ui.nav.tickets')}
                        </Link>
                    </div>
                </div>
            ) : null}
        </AppShell>
    );
}
