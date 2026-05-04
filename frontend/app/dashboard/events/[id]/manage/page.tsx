'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { EventDetail } from '@/types';
import { getStatusColor, formatDate } from '@/lib/utils';
import { ArrowLeft, Plus, Ticket } from 'lucide-react';
import EventDetailSkeleton from '@/components/EventDetailSkeleton';

const updateEventSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(5000),
    location: z.string().min(1, 'Location is required').max(300),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
});

const addTicketTypeSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    price: z.number().min(0, 'Price cannot be negative'),
    totalQuantity: z.number().min(1, 'Quantity must be at least 1'),
});

type UpdateEventForm = z.infer<typeof updateEventSchema>;
type AddTicketTypeForm = z.infer<typeof addTicketTypeSchema>;

export default function ManageEventPage() {
    const { id } = useParams<{ id: string}>();
    const router = useRouter();

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const minDate = new Date();
    minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset());
    const minDateString = minDate.toISOString().slice(0, 16);

    const {
        register: registerEvent,
        handleSubmit: handleEventSubmit,
        reset: resetEventForm,
        formState: { errors: eventErrors},
    } = useForm<UpdateEventForm>({
        resolver: zodResolver(updateEventSchema),
    });

    const {
        register: registerTicket,
        handleSubmit: handleTicketSubmit,
        reset: resetTicketForm,
        formState: { errors: ticketErrors }
    } = useForm<AddTicketTypeForm>({
        resolver: zodResolver(addTicketTypeSchema),
    });

    useEffect(() => {
        const load = async () => {
            try {
                const response = await api.get<EventDetail>(`/events/${id}`)
                setEvent(response.data);

                const toLocalDateTimeString = (dateString: string) => {
                    const date = new Date(dateString);
                    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
                    return date.toISOString().slice(0, 16);
                }

                resetEventForm({
                    title: response.data.title,
                    description: response.data.description,
                    location: response.data.location,
                    startDate: toLocalDateTimeString(response.data.startDate),
                    endDate: toLocalDateTimeString(response.data.endDate),
                });
            } catch {
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id, router, resetEventForm]);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setError(null);
        setTimeout(() => setSuccessMessage(null), 3000);
    }

    const showError = (message: string) => {
        setError(message);
        setSuccessMessage(null);
    };

    const onUpdateEvent = async (data: UpdateEventForm) => {
        setIsSubmitting(true);
        try {
            await api.put(`/events/${id}`, {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            });
            showSuccess('Event updated successfully.');
            const response = await api.get<EventDetail>(`/events/${id}`)
            setEvent(response.data);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            showError(axiosErr.response?.data?.error || 'Failed to update event.')
        } finally {
            setIsSubmitting(false);
        }
    }

    const onAddTicketType = async (data: AddTicketTypeForm) => {
        setIsSubmitting(true);
        try {
            await api.post(`/events/${id}/ticket-types`, data);
            showSuccess('Ticket type added successfully.');
            resetTicketForm();
            setShowTicketForm(false);
            const response = await api.get<EventDetail>(`/events/${id}`);
            setEvent(response.data);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            showError(axiosErr.response?.data?.error || 'Failed to add ticket type.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        setIsSubmitting(true);
        try {
            await api.post(`/events/${id}/publish`);
            showSuccess('Event published successfully.');
            const response = await api.get<EventDetail>(`/events/${id}`);
            setEvent(response.data);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            showError(axiosErr.response?.data?.error || 'Failed to publish event.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this event?')) return;
        setIsSubmitting(true);
        try {
            await api.post(`/events/${id}/cancel`);
            showSuccess('Event cancelled.');
            const response = await api.get<EventDetail>(`/events/${id}`);
            setEvent(response.data);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            showError(axiosErr.response?.data?.error || 'Failed to cancel event.');
        } finally {
            setIsSubmitting(false);
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

    if (!event) return null;

    const isDraft = event.status === 'Draft';
    const isCancelled = event.status === 'Cancelled';

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                {/* Заголовок страницы */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-2 ${getStatusColor(event.status)}`}>
                            {event.status}
                        </span>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex items-center gap-3">
                        {isDraft && (
                            <button
                                onClick={handlePublish}
                                disabled={isSubmitting || event.ticketTypes.length === 0}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                title={event.ticketTypes.length === 0 ? 'Add at least one ticket type first' : ''}
                            >
                                Publish
                            </button>
                        )}
                        {!isCancelled && (
                            <button
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                Cancel Event
                            </button>
                        )}
                    </div>
                </div>

                {/* Сообщения */}
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

                {/* Форма редактирования */}
                {!isCancelled && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
                        <form onSubmit={handleEventSubmit(onUpdateEvent)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    {...registerEvent('title')}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {eventErrors.title && (
                                    <p className="mt-1 text-xs text-red-500">{eventErrors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    {...registerEvent('description')}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                                {eventErrors.description && (
                                    <p className="mt-1 text-xs text-red-500">{eventErrors.description.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    {...registerEvent('location')}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {eventErrors.location && (
                                    <p className="mt-1 text-xs text-red-500">{eventErrors.location.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                                    <input
                                        {...registerEvent('startDate')}
                                        type="datetime-local"
                                        min={minDateString}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {eventErrors.startDate && (
                                        <p className="mt-1 text-xs text-red-500">{eventErrors.startDate.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
                                    <input
                                        {...registerEvent('endDate')}
                                        type="datetime-local"
                                        min={minDateString}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {eventErrors.endDate && (
                                        <p className="mt-1 text-xs text-red-500">{eventErrors.endDate.message}</p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Типы билетов */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5" />
                            Ticket Types
                        </h2>
                        {isDraft && (
                            <button
                                onClick={() => setShowTicketForm(!showTicketForm)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                Add Ticket Type
                            </button>
                        )}
                    </div>

                    {/* Форма добавления типа билета */}
                    {showTicketForm && (
                        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">New Ticket Type</h3>
                            <form onSubmit={handleTicketSubmit(onAddTicketType)} className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            {...registerTicket('name')}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="General Admission"
                                        />
                                        {ticketErrors.name && (
                                            <p className="mt-1 text-xs text-red-500">{ticketErrors.name.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Price ($)</label>
                                        <input
                                            {...registerTicket('price', { valueAsNumber: true })}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                        {ticketErrors.price && (
                                            <p className="mt-1 text-xs text-red-500">{ticketErrors.price.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                                        <input
                                            {...registerTicket('totalQuantity', { valueAsNumber: true })}
                                            type="number"
                                            min="1"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="100"
                                        />
                                        {ticketErrors.totalQuantity && (
                                            <p className="mt-1 text-xs text-red-500">{ticketErrors.totalQuantity.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Adding...' : 'Add'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTicketForm(false);
                                            resetTicketForm();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Список типов билетов */}
                    {event.ticketTypes.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            No ticket types yet. Add at least one before publishing.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {event.ticketTypes.map((tt) => (
                                <div key={tt.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{tt.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {tt.isFree ? 'Free' : `$${tt.price}`} · {tt.totalQuantity - tt.availableQuantity}/{tt.totalQuantity} sold
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatDate(event.startDate, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}