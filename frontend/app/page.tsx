'use client'

import {useEffect, useState} from "react";
import {EventSummary, PagedResult} from "@/types";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import EventCard from "@/components/EventCard";
import Pagination from "@/components/Pagination";
import { useTranslation } from "@/i18n";

const STATUS_OPTIONS = ['Published', 'Draft', 'Completed', 'Cancelled'] as const;

export default function HomePage() {
    const [events, setEvents] = useState<PagedResult<EventSummary> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Published');
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    const fetchEvents = async (search: string, status: string, page: number) => {
        setIsLoading(true);
        try {
            const response = await api.get<PagedResult<EventSummary>>('/events', {
                params: {
                    searchTerm: search || undefined,
                    status,
                    page,
                    pageSize: 9,
                },
            });
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents('', 'Published', 1);
    }, []);

    const handleSearch = () => {
        setActiveSearch(searchTerm);
        fetchEvents(searchTerm, statusFilter, 1);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        fetchEvents(searchTerm, status, 1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="bg-blue-600 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">{t('home.title')}</h1>
                    <p className="text-blue-100 mb-8">{t('home.subtitle')}</p>

                    <div className="max-w-xl mx-auto flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={t('home.searchPlaceholder')}
                                className="w-full px-4 py-3 rounded-lg text-gray-900 bg-white border-0 focus:outline-none shadow-md"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        if (activeSearch) {
                                            setActiveSearch('');
                                            fetchEvents('', statusFilter, 1);
                                        }
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                            {t('search')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
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
                            {t(`status.${status}`)}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <EventCardSkeleton key={i} />
                        ))}
                    </div>
                ) : events?.items.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        {t('home.noEvents')}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events?.items.map((event) => (
                                <EventCard key={event.id} event={event} />
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
        </div>
    );
}
