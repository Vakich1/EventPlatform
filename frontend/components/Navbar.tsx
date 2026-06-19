'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Globe } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function Navbar() {
    const { isAuthenticated, isLoading, role, isApprovedOrganizer, logout } = useAuth();
    const { language, setLanguage, t } = useTranslation();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const canCreateEvent = role === 'Admin' || (role === 'Organizer' && isApprovedOrganizer);

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    EventPlatform
                </Link>
                {!isLoading && (
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                {canCreateEvent && (
                                    <Link
                                        href="/events/create"
                                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t('nav.createEvent')}
                                    </Link>
                                )}
                                <Link
                                    href="/dashboard"
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    {t('nav.dashboard')}
                                </Link>
                                {role === 'Admin' && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        {t('nav.admin')}
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                                >
                                    {t('nav.signOut')}
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    {t('nav.signIn')}
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    {t('nav.register')}
                                </Link>
                            </>
                        )}
                        <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <button
                                onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
                                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-medium"
                            >
                                {language === 'ru' ? 'EN' : 'RU'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
