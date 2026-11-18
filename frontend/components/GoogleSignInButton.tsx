'use client'

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useTranslation } from '@/i18n';

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
    const [ready, setReady] = useState(false);
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (!ready || !clientId || !containerRef.current || !window.google || disabled) return;
        containerRef.current.innerHTML = '';
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: { credential?: string }) => {
                if (response.credential) void onCredential(response.credential);
            },
        });
        window.google.accounts.id.renderButton(containerRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
        });
    }, [ready, clientId, disabled, onCredential]);

    if (!clientId) {
        return (
            <p className="text-center text-xs text-muted">
                {t('ui.auth.googleNotConfigured')}
            </p>
        );
    }

    return (
        <>
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={() => setReady(true)}
            />
            <div ref={containerRef} className={`flex justify-center ${disabled ? 'pointer-events-none opacity-60' : ''}`} />
        </>
    );
}
