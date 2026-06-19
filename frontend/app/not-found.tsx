'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-blue-600 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Страница не найдена</h2>
                <p className="text-gray-500 mb-8">Запрашиваемая страница не существует.</p>
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
