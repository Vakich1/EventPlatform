'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { EventSummary, MyRegistration, PagedResult } from '@/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import DashboardEventCard from '@/components/DashboardEventCard';
import DashboardEventCardSkeleton from '@/components/DashboardEventCardSkeleton';
import RegistrationCard from '@/components/RegistrationCard';
import RegistrationCardSkeleton from '@/components/RegistrationCardSkeleton';
import Pagination from '@/components/Pagination';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/i18n';

type Tab = 'events' | 'registrations';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();
    const { t } = useTranslation();

    const isOrganizerOrAdmin = role === 'Organizer' || role === 'Admin';
    const [activeTab, setActiveTab] = useState<Tab>(isOrganizerOrAdmin ? 'events' : 'registrations');

    const [events, setEvents] = useState<PagedResult<EventSummary> | null>(null);
    const [registrations, setRegistrations] = useState<PagedResult<MyRegistration> | null>(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);
    const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);

    const loadEvents = async (page: number) => {
        setIsLoadingEvents(true);
        try {
            const response = await api.get<PagedResult<EventSummary>>('/events/my', {
                params: { page, pageSize: 10 },
            });
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const loadRegistrations = async (page: number) => {
        setIsLoadingRegistrations(true);
        try {
            const response = await api.get<PagedResult<MyRegistration>>('/registrations/my', {
                params: { page, pageSize: 10 },
            });
            setRegistrations(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingRegistrations(false);
        }
    };

    useEffect(() => {
        if (!authLoading && isAuthenticated && isOrganizerOrAdmin) {
            loadEvents(1);
        }
        if (!authLoading && isAuthenticated && !isOrganizerOrAdmin) {
            loadRegistrations(1);
        }
    }, [isAuthenticated, authLoading, isOrganizerOrAdmin]);

    useEffect(() => {
        if (activeTab === 'registrations' && !registrations) {
            loadRegistrations(1);
        }
    }, [activeTab]);

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                    {activeTab === 'events' && isOrganizerOrAdmin && (
                        <Link
                            href="/events/create"
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {t('dashboard.createEvent')}
                        </Link>
                    )}
                </div>

                {isOrganizerOrAdmin && (
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                                activeTab === 'events'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t('dashboard.myEvents')}
                        </button>
                        <button
                            onClick={() => setActiveTab('registrations')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                                activeTab === 'registrations'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t('dashboard.myRegistrations')}
                        </button>
                    </div>
                )}

                {activeTab === 'events' && (
                    <>
                        {isLoadingEvents ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <DashboardEventCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : events?.items.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                                <p className="text-gray-500 mb-4">{t('events.noEvents')}</p>
                                <Link
                                    href="/events/create"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    {t('events.createFirst')}
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {events?.items.map((event) => (
                                        <DashboardEventCard key={event.id} event={event} />
                                    ))}
                                </div>
                                {events && (
                                    <Pagination
                                        page={events.page}
                                        totalPages={events.totalPages}
                                        hasNextPage={events.hasNextPage}
                                        hasPreviousPage={events.hasPreviousPage}
                                        onPageChange={loadEvents}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}

                {activeTab === 'registrations' && (
                    <>
                        {isLoadingRegistrations ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <RegistrationCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : registrations?.items.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                                <p className="text-gray-500 mb-4">{t('events.noRegistrations')}</p>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                                >
                                    {t('events.browseEvents')}
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {registrations?.items.map((registration) => (
                                        <RegistrationCard
                                            key={registration.registrationId}
                                            registration={registration}
                                        />
                                    ))}
                                </div>
                                {registrations && (
                                    <Pagination
                                        page={registrations.page}
                                        totalPages={registrations.totalPages}
                                        hasNextPage={registrations.hasNextPage}
                                        hasPreviousPage={registrations.hasPreviousPage}
                                        onPageChange={loadRegistrations}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
