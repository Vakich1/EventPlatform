'use client'

import {useEffect, useState} from "react";
import {EventSummary, PagedResult} from "@/types";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import EventCardSkeleton from "@/components/EventCardSkeleton";
import EventCard from "@/components/EventCard";
import Pagination from "@/components/Pagination";
import { useTranslation } from "@/i18n";

export default function HomePage() {
    const [events, setEvents] = useState<PagedResult<EventSummary> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    const fetchEvents = async (search: string, page: number) => {
        setIsLoading(true);
        try {
            const response = await api.get<PagedResult<EventSummary>>('/events', {
                params: {
                    searchTerm: search || undefined,
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
        const load = async () => {
            await fetchEvents('', 1);
        };
        load();
    }, []);

    const handleSearch = () => {
        setActiveSearch(searchTerm)
        fetchEvents(searchTerm, 1)
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
                                            fetchEvents('', 1);
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
                                onPageChange={(page) => fetchEvents(searchTerm, page)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
