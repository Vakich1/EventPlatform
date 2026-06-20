'use client';

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';

export default function AccessDenied() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <ShieldOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h1 className="text-8xl font-bold text-red-500 mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Доступ запрещён</h2>
                <p className="text-gray-500 mb-8">У вас нет прав для просмотра этой страницы.</p>
                <Link
                    href="/"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                    На главную
                </Link>
            </div>
        </div>
    );
}
