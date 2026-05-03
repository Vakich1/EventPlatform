'use client'

import {useEffect, useState} from "react";
import {EventSummary, PagedResult} from "@/types";
import {useAuth} from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { Calendar, MapPin, Ticket } from 'lucide-react';

export default function HomePage() {
    const [events, setEvents] = useState<PagedResult<EventSummary> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearch, setActiveSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuth();

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        EventPlatform
                    </Link>
                    <div className="flex items-center gap-4">
                        {!isLoading && (
                            <>
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            href="/events/create"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Create Event
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/auth/login"
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Sign in
                                        </Link>
                                        <Link
                                            href="/auth/register"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <div className="bg-blue-600 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">Discover Amazing Events</h1>
                    <p className="text-blue-100 mb-8">Find and register for events happening near you</p>

                    <div className="max-w-xl mx-auto flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search events or locations..."
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSearch}
                            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : events?.items.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        No events found. Be the first to create one!
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events?.items.map((event) => (
                                <Link key={event.id} href={`/events/${event.id}`}>
                                    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer h-full">
                                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-3 ${
                                            event.status === 'Published'
                                                ? 'bg-green-100 text-green-700'
                                                : event.status === 'Cancelled'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {event.status}
                                        </span>

                                        <h3 className="font-semibold text-gray-900 mb-3 text-lg leading-tight">
                                            {event.title}
                                        </h3>

                                        <div className="space-y-2 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                                <span>{formatDate(event.startDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                <span>{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Ticket className="w-4 h-4 flex-shrink-0" />
                                                <span>{event.availableTickets} tickets available</span>
                                            </div>
                                        </div>

                                        <p className="mt-3 text-xs text-gray-400">
                                            by {event.organizerName}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {events && events.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                <button
                                    onClick={() => fetchEvents(searchTerm, events.page - 1)}
                                    disabled={!events.hasPreviousPage}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-600">
                                    Page {events.page} of {events.totalPages}
                                </span>
                                <button
                                    onClick={() => fetchEvents(searchTerm, events.page + 1)}
                                    disabled={!events.hasNextPage}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}