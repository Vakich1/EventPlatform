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
import { ArrowLeft, Calendar, MapPin, Ticket, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n';

export default function AdminPendingEventsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();
    const { t } = useTranslation();
    const [events, setEvents] = useState<PagedResult<EventSummary> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve' | 'reject';
        eventId: string;
        eventTitle: string;
    } | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
        if (!authLoading && isAuthenticated && role !== 'Admin') {
            setError(t('errors.unauthorized'));
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, role, router]);

    const fetchEvents = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await api.get<PagedResult<EventSummary>>('/admin/events/pending', {
                params: { page, pageSize: 10 },
            });
            setEvents(response.data);
        } catch {
            setError('Failed to load pending events.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && role === 'Admin') {
            fetchEvents(1);
        }
    }, [isAuthenticated, role]);

    const handleAction = async () => {
        if (!confirmAction) return;
        setIsActionLoading(true);
        try {
            if (confirmAction.type === 'approve') {
                await api.post(`/admin/events/${confirmAction.eventId}/approve`);
            } else {
                await api.post(`/admin/events/${confirmAction.eventId}/reject`);
            }
            setEvents(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: prev.items.filter(e => e.id !== confirmAction.eventId),
                    totalCount: prev.totalCount - 1,
                };
            });
            setConfirmAction(null);
        } catch {
            setError('Failed to process request.');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (authLoading || (!isAuthenticated && !error)) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <Link
                    href="/admin"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('back')}
                </Link>

                <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{t('admin.pendingEventApprovals')}</h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

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
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t('admin.noPendingEvents')}</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {events?.items.map(event => (
                                <div key={event.id} className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                                                {t(`status.${event.status}`)}
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
                                                {event.availableTickets} {t('events.ticketsAvailable')}
                                            </span>
                                            <span className="text-gray-400">{t('events.by')} {event.organizerName}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {t('events.view')}
                                        </Link>
                                        <button
                                            onClick={() => setConfirmAction({ type: 'approve', eventId: event.id, eventTitle: event.title })}
                                            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 cursor-pointer"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            {t('admin.approve')}
                                        </button>
                                        <button
                                            onClick={() => setConfirmAction({ type: 'reject', eventId: event.id, eventTitle: event.title })}
                                            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 cursor-pointer"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {t('admin.reject')}
                                        </button>
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
                                onPageChange={fetchEvents}
                            />
                        )}
                    </>
                )}
            </div>

            {confirmAction && (
                <ConfirmDialog
                    title={confirmAction.type === 'approve' ? t('admin.approveEvent') : t('admin.rejectEvent')}
                    message={confirmAction.type === 'approve'
                        ? t('admin.approveEventConfirm').replace('{{name}}', confirmAction.eventTitle)
                        : t('admin.rejectEventConfirm').replace('{{name}}', confirmAction.eventTitle)
                    }
                    confirmLabel={confirmAction.type === 'approve' ? t('admin.approve') : t('admin.reject')}
                    danger={confirmAction.type === 'reject'}
                    onConfirm={handleAction}
                    onClose={() => setConfirmAction(null)}
                    isLoading={isActionLoading}
                />
            )}
        </div>
    );
}
