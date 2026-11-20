'use client'

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useTranslation } from '@/i18n';
import api from '@/lib/api';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: Record<string, unknown>) => void;
                    renderButton: (parent: HTMLElement, config: Record<string, unknown>) => void;
                };
            };
        };
    }
}

export default function GoogleSignInButton({
    onCredential,
    disabled,
}: {
    onCredential: (idToken: string) => void | Promise<void>;
    disabled?: boolean;
}) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const onCredentialRef = useRef(onCredential);
    const [scriptReady, setScriptReady] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    onCredentialRef.current = onCredential;

    useEffect(() => {
        if (window.google?.accounts?.id) setScriptReady(true);
    }, []);

    useEffect(() => {
        let cancelled = false;
        api.get<{ clientId?: string | null }>('/auth/google/config')
            .then(r => {
                if (!cancelled) setClientId(r.data.clientId?.trim() || null);
            })
            .catch(() => {
                if (!cancelled) setClientId(null);
            })
            .finally(() => {
                if (!cancelled) setLoaded(true);
            });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!loaded || !scriptReady || !clientId || !containerRef.current || !window.google || disabled) return;
        const el = containerRef.current;
        el.innerHTML = '';
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: { credential?: string }) => {
                if (response.credential) void onCredentialRef.current(response.credential);
            },
        });
        window.google.accounts.id.renderButton(el, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
        });
    }, [loaded, scriptReady, clientId, disabled]);

    if (loaded && !clientId) {
        return (
            <p className="text-center text-xs text-muted">
                {t('ui.auth.googleNotConfigured')}
            </p>
        );
    }

    if (!loaded) return null;

    return (
        <>
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => setScriptReady(true)}
                onReady={() => setScriptReady(true)}
            />
            <div ref={containerRef} className={`flex justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`} />
        </>
    );
}
