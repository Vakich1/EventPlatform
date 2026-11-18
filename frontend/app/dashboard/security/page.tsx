'use client'

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck } from 'lucide-react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';
import api from '@/lib/api';
import { TwoFactorSetupResult, TwoFactorStatus } from '@/types';

export default function SecurityPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { t } = useTranslation();
    const [enabled, setEnabled] = useState(false);
    const [setup, setSetup] = useState<TwoFactorSetupResult | null>(null);
    const [code, setCode] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        api.get<TwoFactorStatus>('/auth/2fa')
            .then(r => setEnabled(r.data.isEnabled))
            .catch(() => setEnabled(false));
    }, [authLoading, isAuthenticated]);

    const startSetup = async () => {
        setBusy(true);
        setError(null);
        setMessage(null);
        try {
            const { data } = await api.post<TwoFactorSetupResult>('/auth/2fa/setup');
            setSetup(data);
        } catch {
            setError(t('ui.security.setupFailed'));
        } finally {
            setBusy(false);
        }
    };

    const enable = async () => {
        setBusy(true);
        setError(null);
        setMessage(null);
        try {
            await api.post('/auth/2fa/enable', { code });
            setEnabled(true);
            setSetup(null);
            setCode('');
            setMessage(t('ui.security.enabled'));
        } catch {
            setError(t('ui.auth.invalidTwoFactor'));
        } finally {
            setBusy(false);
        }
    };

    const disable = async () => {
        setBusy(true);
        setError(null);
        setMessage(null);
        try {
            await api.post('/auth/2fa/disable', { code });
            setEnabled(false);
            setSetup(null);
            setCode('');
            setMessage(t('ui.security.disabled'));
        } catch {
            setError(t('ui.auth.invalidTwoFactor'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <AppShell kind="user">
            <PageHeader title={t('ui.security.title')} subtitle={t('ui.security.subtitle')} />
            {message && <Alert tone="success">{message}</Alert>}
            {error && <Alert tone="danger">{error}</Alert>}
            <div className="card flex flex-col gap-5">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-brand-600" aria-hidden="true" />
                    <div>
                        <h2 className="text-base font-semibold text-ink">{t('ui.security.twoFactor')}</h2>
                        <p className="mt-1 text-sm text-muted">
                            {enabled ? t('ui.security.statusOn') : t('ui.security.statusOff')}
                        </p>
                    </div>
                </div>

                {!enabled && !setup && (
                    <button type="button" className="btn btn-primary w-fit" disabled={busy} onClick={startSetup}>
                        {t('ui.security.enable')}
                    </button>
                )}

                {setup && !setup.isEnabled && (
                    <div className="flex flex-col gap-4">
                        <p className="text-sm text-muted">{t('ui.security.scanHint')}</p>
                        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                            <div className="rounded-[12px] border border-line bg-white p-3">
                                <QRCodeSVG value={setup.authenticatorUri} size={160} />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-ink">{t('ui.security.manualSecret')}</p>
                                <code className="mt-1 block break-all rounded-[8px] bg-neutral-bg px-3 py-2 text-xs">{setup.secret}</code>
                            </div>
                        </div>
                        <div>
                            <label className="label" htmlFor="enable-code">{t('ui.auth.twoFactorCode')}</label>
                            <input
                                id="enable-code"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                inputMode="numeric"
                                maxLength={6}
                                className="input max-w-xs tracking-[0.3em]"
                                placeholder="000000"
                            />
                        </div>
                        <button type="button" className="btn btn-primary w-fit" disabled={busy || code.length !== 6} onClick={enable}>
                            {t('ui.security.confirmEnable')}
                        </button>
                    </div>
                )}

                {enabled && (
                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="label" htmlFor="disable-code">{t('ui.auth.twoFactorCode')}</label>
                            <input
                                id="disable-code"
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                inputMode="numeric"
                                maxLength={6}
                                className="input max-w-xs tracking-[0.3em]"
                                placeholder="000000"
                            />
                        </div>
                        <button type="button" className="btn btn-secondary w-fit" disabled={busy || code.length !== 6} onClick={disable}>
                            {t('ui.security.disable')}
                        </button>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
