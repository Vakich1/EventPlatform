'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-8xl font-bold text-red-500 mb-4">500</h1>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                <p className="text-gray-500 mb-8">An unexpected error occurred.</p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        Try again
                    </button>
                    <Link
                        href="/"
                        className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}