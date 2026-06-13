'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EventSummary, PagedResult } from '@/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Search, XCircle, Calendar, MapPin, Ticket, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const STATUS_OPTIONS = ['All', 'Draft', 'Published', 'Completed', 'Cancelled'];

export default function AdminEventsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();
    const [events, setEvents] = useState<PagedResult<EventSummary> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [cancelEvent, setCancelEvent] = useState<{ id: string; title: string } | null>(null);
    const [isCancelLoading, setIsCancelLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
        if (!authLoading && isAuthenticated && role !== 'Admin') {
            setError('You do not have admin access.');
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, role, router]);

    const fetchEvents = async (search: string, status: string, page: number) => {
        setIsLoading(true);
        try {
            const response = await api.get<PagedResult<EventSummary>>('/admin/events', {
                params: {
                    searchTerm: search || undefined,
                    status: status === 'All' ? undefined : status,
                    page,
                    pageSize: 10,
                },
            });
            setEvents(response.data);
        } catch {
            setError('Failed to load events.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && role === 'Admin') {
            fetchEvents('', 'All', 1);
        }
    }, [isAuthenticated, role]);

    const handleSearch = () => {
        fetchEvents(searchTerm, statusFilter, 1);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        fetchEvents(searchTerm, status, 1);
    };

    const handleCancelEvent = async () => {
        if (!cancelEvent) return;
        setIsCancelLoading(true);
        try {
            await api.post(`/admin/events/${cancelEvent.id}/cancel`);
            setEvents(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: prev.items.map(e =>
                        e.id === cancelEvent.id ? { ...e, status: 'Cancelled' } : e
                    ),
                };
            });
            setCancelEvent(null);
        } catch {
            setError('Failed to cancel event.');
        } finally {
            setIsCancelLoading(false);
        }
    };

    if (authLoading || (!isAuthenticated && !error)) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Events</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search events..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        <Search className="w-4 h-4" />
                        Search
                    </button>
                </div>

                <div className="flex gap-2 mb-6">
                    {STATUS_OPTIONS.map(status => (
                        <button
                            key={status}
                            onClick={() => handleStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                ) : events?.items.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm text-gray-500">
                        No events found.
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {events?.items.map(event => (
                                <div key={event.id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                                                {event.status}
                                            </span>
                                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(event.startDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {event.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Ticket className="w-3 h-3" />
                                                {event.availableTickets} tickets
                                            </span>
                                            <span className="text-gray-400">by {event.organizerName}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            View
                                        </Link>
                                        {event.status !== 'Cancelled' && event.status !== 'Completed' && (
                                            <button
                                                onClick={() => setCancelEvent({ id: event.id, title: event.title })}
                                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 cursor-pointer"
                                            >
                                                <XCircle className="w-3 h-3" />
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {events && (
                            <Pagination
                                page={events.page}
                                totalPages={events.totalPages}
                                hasNextPage={events.hasNextPage}
                                hasPreviousPage={events.hasPreviousPage}
                                onPageChange={(page) => fetchEvents(searchTerm, statusFilter, page)}
                            />
                        )}
                    </>
                )}
            </div>

            {cancelEvent && (
                <ConfirmDialog
                    title="Cancel Event"
                    message={`Are you sure you want to cancel "${cancelEvent.title}"? This will cancel all active tickets.`}
                    confirmLabel="Cancel Event"
                    danger
                    onConfirm={handleCancelEvent}
                    onClose={() => setCancelEvent(null)}
                    isLoading={isCancelLoading}
                />
            )}
        </div>
    );
}
