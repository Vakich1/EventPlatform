'use client'

import {useRouter} from "next/navigation";
import {useAuth} from "@/context/AuthContext";
import {useEffect, useState} from "react";
import {EventSummary, PagedResult} from "@/types";
import api from "@/lib/api";
import Link from 'next/link';
import {  Plus } from 'lucide-react';
import Navbar from "@/components/Navbar";
import DashboardEventCardSkeleton from "@/components/DashboardEventCardSkeleton";
import DashboardEventCard from "@/components/DashboardEventCard";
import Pagination from "@/components/Pagination";

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, logout} = useAuth();
    const [events, setEvents] = useState<PagedResult<EventSummary> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadEvents = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await api.get<PagedResult<EventSummary>>("/events/my", {
                params: { page, pageSize: 10 } ,
            });
            setEvents(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            const load = async () => {
                await loadEvents(1);
            };
            load();
        }
    }, [isAuthenticated, authLoading]);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Events</h1>

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <DashboardEventCardSkeleton key={i} />
                        ))}
                    </div>
                ) : events?.items.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500 mb-4">You haven&#39;t created any events yet.</p>
                        <Link
                            href="/events/create"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Create your first event
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
            </div>
        </div>
    );
}