'use client'

import Link from 'next/link';
import Logo from '@/components/Logo';
import { useTranslation } from '@/i18n';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="border-t border-line bg-white">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between xl:px-0">
                <div className="flex items-center gap-4">
                    <Logo />
                    <span className="text-xs font-medium text-subtle">© 2026 EventPlatform</span>
                </div>
                <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted" aria-label={t('ui.footer.nav')}>
                    <Link href="/for-organizers" className="hover:text-ink">{t('ui.footer.organizers')}</Link>
                    <Link href="/help" className="hover:text-ink">{t('ui.footer.help')}</Link>
                    <Link href="/terms" className="hover:text-ink">{t('ui.footer.terms')}</Link>
                    <Link href="/privacy" className="hover:text-ink">{t('ui.footer.privacy')}</Link>
                </nav>
            </div>
        </footer>
    );
}
