'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminUserDetail, AdminRegistration, EventSummary, PagedResult } from '@/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDate, getStatusColor, goBack } from '@/lib/utils';
import { ArrowLeft, Calendar, MapPin, Ticket, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/i18n';

type Tab = 'events' | 'registrations';

export default function AdminUserDetailPage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();
    const { t } = useTranslation();

    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('events');
    const [events, setEvents] = useState<PagedResult<EventSummary> | null>(null);
    const [registrations, setRegistrations] = useState<PagedResult<AdminRegistration> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [cancelRegistration, setCancelRegistration] = useState<{
        registrationId: string;
        eventTitle: string;
    } | null>(null);
    const [isCancelLoading, setIsCancelLoading] = useState(false);

    const [cancelEvent, setCancelEvent] = useState<{ id: string; title: string } | null>(null);
    const [isCancelEventLoading, setIsCancelEventLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
        if (!authLoading && isAuthenticated && role !== 'Admin') {
            setError(t('errors.unauthorized'));
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, role, router]);

    useEffect(() => {
        if (isAuthenticated && role === 'Admin' && userId) {
            api.get<AdminUserDetail>(`/admin/users/${userId}`)
                .then(res => setUser(res.data))
                .catch(() => setError('Failed to load user.'))
                .finally(() => setIsLoading(false));
        }
    }, [isAuthenticated, role, userId]);

    const fetchEvents = async (page: number) => {
        try {
            const response = await api.get<PagedResult<EventSummary>>(`/admin/users/${userId}/events`, {
                params: { page, pageSize: 5 },
            });
            setEvents(response.data);
        } catch {
            setError('Failed to load events.');
        }
    };

    const fetchRegistrations = async (page: number) => {
        try {
            const response = await api.get<PagedResult<AdminRegistration>>(`/admin/users/${userId}/registrations`, {
                params: { page, pageSize: 5 },
            });
            setRegistrations(response.data);
        } catch {
            setError('Failed to load registrations.');
        }
    };

    useEffect(() => {
        if (isAuthenticated && role === 'Admin' && userId) {
            if (activeTab === 'events' && !events) {
                fetchEvents(1);
            }
            if (activeTab === 'registrations' && !registrations) {
                fetchRegistrations(1);
            }
        }
    }, [activeTab, isAuthenticated, role, userId]);

    const handleCancelRegistration = async () => {
        if (!cancelRegistration) return;
        setIsCancelLoading(true);
        try {
            await api.post(`/admin/users/${userId}/registrations/${cancelRegistration.registrationId}/cancel`);
            setRegistrations(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: prev.items.filter(r => r.registrationId !== cancelRegistration.registrationId),
                    totalCount: prev.totalCount - 1,
                };
            });
            setCancelRegistration(null);
        } catch {
            setError('Failed to cancel registration.');
        } finally {
            setIsCancelLoading(false);
        }
    };

    const handleCancelEvent = async () => {
        if (!cancelEvent) return;
        setIsCancelEventLoading(true);
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
            setIsCancelEventLoading(false);
        }
    };

    if (authLoading || (!isAuthenticated && !error)) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <button
                    onClick={() => goBack('/admin/users')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('back')}
                </button>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>
                ) : user && (
                    <>
                        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-lg">
                                        {user.fullName.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {user.role}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}>
                                        {user.isBlocked ? t('userDetail.blocked') : t('userDetail.active')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-6 text-sm text-gray-500">
                                <span>{t('userDetail.joined')} {formatDate(user.createdAt, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                <span>{user.eventsCount} {t('userDetail.eventsCount')}</span>
                                <span>{user.registrationsCount} {t('userDetail.registrationsCount')}</span>
                            </div>
                        </div>

                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                                    activeTab === 'events'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('userDetail.events')} ({user.eventsCount})
                            </button>
                            <button
                                onClick={() => setActiveTab('registrations')}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                                    activeTab === 'registrations'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {t('userDetail.registrations')} ({user.registrationsCount})
                            </button>
                        </div>

                        {activeTab === 'events' && (
                            <>
                                {events?.items.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-xl shadow-sm text-gray-500">
                                        {t('userDetail.noEvents')}
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
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/events/${event.id}`}
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            {t('events.view')}
                                                        </Link>
                                                        {event.status !== 'Cancelled' && event.status !== 'Completed' && (
                                                            <button
                                                                onClick={() => setCancelEvent({ id: event.id, title: event.title })}
                                                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 cursor-pointer ml-2"
                                                            >
                                                                <XCircle className="w-3 h-3" />
                                                                {t('events.cancel')}
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
                                                onPageChange={fetchEvents}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === 'registrations' && (
                            <>
                                {registrations?.items.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-xl shadow-sm text-gray-500">
                                        {t('userDetail.noRegistrations')}
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200 bg-gray-50">
                                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Event</th>
                                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ticket</th>
                                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {registrations?.items.map(reg => (
                                                        <tr key={reg.registrationId} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="px-6 py-4 text-sm text-gray-900">{reg.eventTitle}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{reg.ticketTypeName}</td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {reg.isFree ? 'Free' : `$${reg.ticketPrice}`}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                                    reg.ticketStatus === 'Active' ? 'bg-green-100 text-green-700'
                                                                        : reg.ticketStatus === 'Used' ? 'bg-blue-100 text-blue-700'
                                                                            : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                    {t(`status.${reg.ticketStatus}`)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {formatDate(reg.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                {reg.ticketStatus === 'Active' && (
                                                                    <button
                                                                        onClick={() => setCancelRegistration({
                                                                            registrationId: reg.registrationId,
                                                                            eventTitle: reg.eventTitle,
                                                                        })}
                                                                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 cursor-pointer ml-auto"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                        {t('events.cancel')}
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {registrations && (
                                            <Pagination
                                                page={registrations.page}
                                                totalPages={registrations.totalPages}
                                                hasNextPage={registrations.hasNextPage}
                                                hasPreviousPage={registrations.hasPreviousPage}
                                                onPageChange={fetchRegistrations}
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {cancelRegistration && (
                <ConfirmDialog
                    title={t('userDetail.cancelRegistration')}
                    message={t('userDetail.cancelRegistrationConfirm').replace('{{event}}', cancelRegistration.eventTitle)}
                    confirmLabel={t('userDetail.cancelRegistration')}
                    danger
                    onConfirm={handleCancelRegistration}
                    onClose={() => setCancelRegistration(null)}
                    isLoading={isCancelLoading}
                />
            )}

            {cancelEvent && (
                <ConfirmDialog
                    title={t('userDetail.cancelEvent')}
                    message={t('userDetail.cancelEventConfirm').replace('{{event}}', cancelEvent.title)}
                    confirmLabel={t('userDetail.cancelEvent')}
                    danger
                    onConfirm={handleCancelEvent}
                    onClose={() => setCancelEvent(null)}
                    isLoading={isCancelEventLoading}
                />
            )}
        </div>
    );
}
