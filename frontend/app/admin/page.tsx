'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminStats } from '@/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import StatsCard from '@/components/StatsCard';
import { Users, Calendar, Ticket, Ban, CheckCircle, Clock, XCircle, FileText, ArrowLeft, UserCog, CalendarX, UserCheck } from 'lucide-react';
import { goBack } from '@/lib/utils';
import Link from 'next/link';

export default function AdminPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
        if (!authLoading && isAuthenticated && role !== 'Admin') {
            setError('You do not have admin access.');
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, role, router]);

    useEffect(() => {
        if (isAuthenticated && role === 'Admin') {
            api.get<AdminStats>('/admin/stats')
                .then(res => setStats(res.data))
                .catch(() => setError('Failed to load statistics.'))
                .finally(() => setIsLoading(false));
        }
    }, [isAuthenticated, role]);

    if (authLoading || (!isAuthenticated && !error)) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <button
                    onClick={() => goBack('/dashboard')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                                <div className="h-8 bg-gray-200 rounded w-16" />
                            </div>
                        ))}
                    </div>
                ) : stats && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatsCard label="Total Users" value={stats.totalUsers} icon={Users} />
                            <StatsCard label="Blocked Users" value={stats.blockedUsers} icon={Ban} color="text-red-600" />
                            <StatsCard label="Total Events" value={stats.totalEvents} icon={Calendar} />
                            <StatsCard label="Registrations" value={stats.totalRegistrations} icon={Ticket} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatsCard label="Published" value={stats.publishedEvents} icon={CheckCircle} color="text-green-600" />
                            <StatsCard label="Draft" value={stats.draftEvents} icon={FileText} color="text-gray-600" />
                            <StatsCard label="Completed" value={stats.completedEvents} icon={Clock} color="text-blue-600" />
                            <StatsCard label="Cancelled" value={stats.cancelledEvents} icon={XCircle} color="text-red-600" />
                        </div>

                        <div className="flex gap-4">
                            <Link
                                href="/admin/users"
                                className="flex-1 bg-blue-600 rounded-xl p-6 text-white hover:bg-blue-700 transition-colors flex items-center gap-4"
                            >
                                <div className="p-3 bg-blue-500 rounded-lg">
                                    <UserCog className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Manage Users</h3>
                                    <p className="text-blue-200 text-sm">View, block, or unblock users</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/events"
                                className="flex-1 bg-blue-600 rounded-xl p-6 text-white hover:bg-blue-700 transition-colors flex items-center gap-4"
                            >
                                <div className="p-3 bg-blue-500 rounded-lg">
                                    <CalendarX className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Manage Events</h3>
                                    <p className="text-blue-200 text-sm">View or cancel any event</p>
                                </div>
                            </Link>
                            <Link
                                href="/admin/organizers"
                                className="flex-1 bg-blue-600 rounded-xl p-6 text-white hover:bg-blue-700 transition-colors flex items-center gap-4"
                            >
                                <div className="p-3 bg-blue-500 rounded-lg">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Organizer Approvals</h3>
                                    <p className="text-blue-200 text-sm">Approve or reject organizer requests</p>
                                </div>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
