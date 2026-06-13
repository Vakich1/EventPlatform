'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus, Shield } from 'lucide-react';

export default function Navbar() {
    const { isAuthenticated, isLoading, role, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

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
                                <Link
                                    href="/events/create"
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Event
                                </Link>
                                <Link
                                    href="/dashboard"
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Dashboard
                                </Link>
                                {role === 'Admin' && (
                                    <Link
                                        href="/admin"
                                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}