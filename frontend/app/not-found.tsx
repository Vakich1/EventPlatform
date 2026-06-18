'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n';

export default function NotFound() {
    const { t } = useTranslation();
    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('errors.notFound')}</h2>
                <p className="text-gray-500 mb-8">{t('errors.notFound')}</p>
                <Link
                    href="/"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    {t('errors.backToHome')}
                </Link>
            </div>
        </div>
    );
}
