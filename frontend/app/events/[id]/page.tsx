'use client'

import {useParams, useRouter} from "next/navigation";
import {useAuth} from "@/context/AuthContext";
import {useEffect, useState} from "react";
import {EventDetail, UserRegistration} from "@/types";
import api from "@/lib/api";
import { Calendar, MapPin, Ticket, ArrowLeft, Users } from 'lucide-react';
import Navbar from "@/components/Navbar";
import { formatDate, getStatusColor } from '@/lib/utils';
import EventDetailSkeleton from "@/components/EventDetailSkeleton";

export default function EventDetailPage () {
    const { id } = useParams<{ id: string}>();
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [userRegistration, setUserRegistration] = useState<UserRegistration | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [registeringTicketId, setRegisteringTicketId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get(`/events/${id}`)
                setEvent(response.data);

                if (isAuthenticated) {
                    try {
                        const regResponse = await api.get<UserRegistration>(`/registrations/my/${id}`);
                        setUserRegistration(regResponse.data);
                    } catch {}
                }
            } catch {
                router.push("/");
            } finally {
                setIsLoading(false);
            }
        };
        if (!authLoading) load();
    }, [id, router, isAuthenticated, authLoading]);

    const handleRegister = async (ticketTypeId: string, isFree: boolean) => {
        if (!isAuthenticated) {
            router.push("/auth/login");
            return;
        }

        setRegisteringTicketId(ticketTypeId);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isFree) {
                await api.post('/registrations', {
                    eventId: id,
                    ticketTypeId,
                });
                setSuccessMessage('Successfully registered! Check your email for the ticket.');
                const regResponse = await api.get<UserRegistration>(`/registrations/my/${id}`);
                setUserRegistration(regResponse.data);
            } else {
                const response = await api.post('/registrations/payment-intent', {
                    eventId: id,
                    ticketTypeId,
                });
                // TODO: интегрировать Stripe Elements для оплаты
                // Пока показываем clientSecret для демонстрации
                setSuccessMessage(`Payment intent created. Client secret: ${response.data.clientSecret.substring(0, 20)}...`);
            }
            const updated = await api.get(`/events/${id}`);
            setEvent(updated.data);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || 'Registration failed.');
            } else {
                setError('Registration failed.');
            }
        } finally {
            setRegisteringTicketId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <EventDetailSkeleton />
            </div>
        );
    }

    if(!event) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-3 ${getStatusColor(event.status)}`}>
                                {event.status}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                            <p className="text-gray-500 mt-1">by {event.organizerName}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Start</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(event.startDate, undefined, true)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">End</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(event.endDate, undefined, true)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="text-sm font-medium text-gray-900">{event.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">About this event</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </div>

                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {event.status === 'Published' && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Ticket className="w-5 h-5" />
                                Tickets
                            </h2>
                            <div className="space-y-3">
                                {event.ticketTypes.map((ticketType) => (
                                    <div
                                        key={ticketType.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{ticketType.name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-sm text-gray-500">
                                                    {ticketType.isFree ? 'Free' : `$${ticketType.price}`}
                                                </p>
                                                <span className="text-gray-300">•</span>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {ticketType.availableQuantity} of {ticketType.totalQuantity} available
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRegister(ticketType.id, ticketType.isFree)}
                                            disabled={
                                                ticketType.availableQuantity === 0 ||
                                                registeringTicketId === ticketType.id ||
                                                !!userRegistration
                                            }
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                        >
                                            {userRegistration?.ticketTypeId === ticketType.id
                                                ? '✓ Registered'
                                                : registeringTicketId === ticketType.id
                                                    ? 'Processing...'
                                                    : ticketType.availableQuantity === 0
                                                        ? 'Sold out'
                                                        : ticketType.isFree
                                                            ? 'Register'
                                                            : `Buy - $${ticketType.price}`}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}