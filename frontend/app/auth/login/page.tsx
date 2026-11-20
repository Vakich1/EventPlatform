'use client'

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';
import AuthShell from '@/components/AuthShell';
import Alert from '@/components/ui/Alert';
import GoogleSignInButton from '@/components/GoogleSignInButton';

const loginSchema = z.object({
    email: z.string().email('ui.auth.errEmail'),
    password: z.string().min(1, 'ui.auth.errPassword'),
});

const codeSchema = z.object({
    code: z.string().regex(/^\d{6}$/, 'ui.auth.errTwoFactorCode'),
});

type LoginForm = z.infer<typeof loginSchema>;
type CodeForm = z.infer<typeof codeSchema>;

export default function LoginPage() {
    const { login, verifyTwoFactor, loginWithGoogle } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);

    const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
    const codeForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) });

    const finish = useCallback(() => {
        if (document.referrer && new URL(document.referrer).origin === location.origin && !document.referrer.includes('/auth/')) router.back();
        else router.push('/');
    }, [router]);

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const outcome = await login(data.email, data.password);
            if (outcome.requiresTwoFactor) {
                setTwoFactorToken(outcome.twoFactorToken);
                return;
            }
            finish();
        } catch {
            setError(t('auth.invalidCredentials'));
        } finally {
            setIsLoading(false);
        }
    };

    const onVerify = async (data: CodeForm) => {
        if (!twoFactorToken) return;
        setIsLoading(true);
        setError(null);
        try {
            await verifyTwoFactor(twoFactorToken, data.code);
            finish();
        } catch {
            setError(t('ui.auth.invalidTwoFactor'));
        } finally {
            setIsLoading(false);
        }
    };

    const onGoogle = useCallback(async (idToken: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const outcome = await loginWithGoogle(idToken);
            if (outcome.requiresTwoFactor) {
                setTwoFactorToken(outcome.twoFactorToken);
                return;
            }
            finish();
        } catch {
            setError(t('ui.auth.googleFailed'));
        } finally {
            setIsLoading(false);
        }
    }, [finish, loginWithGoogle, t]);

    if (twoFactorToken) {
        return (
            <AuthShell title={t('ui.auth.twoFactorTitle')} subtitle={t('ui.auth.twoFactorSubtitle')}>
                {error && <Alert tone="danger">{error}</Alert>}
                <form onSubmit={codeForm.handleSubmit(onVerify)} className="flex flex-col gap-5" noValidate>
                    <div>
                        <label className="label" htmlFor="code">{t('ui.auth.twoFactorCode')}</label>
                        <div className="relative">
                            <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" aria-hidden="true" />
                            <input
                                id="code"
                                {...codeForm.register('code')}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                className="input input-with-icon tracking-[0.3em]"
                                placeholder="000000"
                            />
                        </div>
                        {codeForm.formState.errors.code && (
                            <p className="field-error" role="alert">{t(codeForm.formState.errors.code.message ?? '')}</p>
                        )}
                    </div>
                    <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
                        {isLoading ? t('auth.signingIn') : t('ui.auth.verifyCode')}
                    </button>
                    <button type="button" className="btn btn-ghost w-full" onClick={() => { setTwoFactorToken(null); setError(null); }}>
                        {t('back')}
                    </button>
                </form>
            </AuthShell>
        );
    }

    return (
        <AuthShell title={t('ui.auth.loginTitle')} subtitle={t('ui.auth.loginSubtitle')}>
            {error && <Alert tone="danger">{error}</Alert>}
            <form onSubmit={loginForm.handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
                <div>
                    <label className="label" htmlFor="email">{t('auth.email')}</label>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" aria-hidden="true" />
                        <input id="email" {...loginForm.register('email')} aria-invalid={!!loginForm.formState.errors.email} autoComplete="email" type="email" className="input input-with-icon" placeholder="you@example.com" />
                    </div>
                    {loginForm.formState.errors.email && <p className="field-error" role="alert">{t(loginForm.formState.errors.email.message ?? '')}</p>}
                </div>
                <div>
                    <label className="label" htmlFor="password">{t('auth.password')}</label>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" aria-hidden="true" />
                        <input id="password" {...loginForm.register('password')} aria-invalid={!!loginForm.formState.errors.password} autoComplete="current-password" type="password" className="input input-with-icon" placeholder="••••••••" />
                    </div>
                    {loginForm.formState.errors.password && <p className="field-error" role="alert">{t(loginForm.formState.errors.password.message ?? '')}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
                    {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                </button>
            </form>
            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted">{t('ui.auth.or')}</span>
                <div className="h-px flex-1 bg-line" />
            </div>
            <GoogleSignInButton onCredential={onGoogle} disabled={isLoading} />
            <p className="text-center text-sm text-muted">
                {t('ui.auth.noAccount')}{' '}
                <Link href="/auth/register" className="font-semibold text-brand-600 hover:underline">{t('ui.auth.signUp')}</Link>
            </p>
        </AuthShell>
    );
}
