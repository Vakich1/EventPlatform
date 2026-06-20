'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { EventDetail } from '@/types';
import { getStatusColor, formatDate, goBack } from '@/lib/utils';
import { ArrowLeft, Plus, Ticket } from 'lucide-react';
import EventDetailSkeleton from '@/components/EventDetailSkeleton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useTranslation } from '@/i18n';

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
    const { t } = useTranslation();

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
        formState: { errors: eventErrors },
        reset: resetEventForm,
    } = useForm<UpdateEventForm>({
        resolver: zodResolver(updateEventSchema),
    });

    const {
        register: registerTicket,
        handleSubmit: handleTicketSubmit,
        formState: { errors: ticketErrors },
        reset: resetTicketForm,
    } = useForm<AddTicketTypeForm>({
        resolver: zodResolver(addTicketTypeSchema),
        defaultValues: { price: 0, totalQuantity: 100 },
    });

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const response = await api.get(`/events/${id}`);
                setEvent(response.data);
                resetEventForm({
                    title: response.data.title,
                    description: response.data.description,
                    location: response.data.location,
                    startDate: new Date(response.data.startDate).toISOString().slice(0, 16),
                    endDate: new Date(response.data.endDate).toISOString().slice(0, 16),
                });
            } catch {
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };
        loadEvent();
    }, [id, router, resetEventForm]);

    const isDraft = event?.status === 'Draft';
    const isCancelled = event?.status === 'Cancelled';
    const isPublished = event?.status === 'Published';
    const isUnderReview = event?.status === 'UnderReview';
    const isRejected = event?.status === 'Rejected';
    const canEdit = !isPublished && !isCancelled;
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

    const onUpdateEvent = async (data: UpdateEventForm) => {
        if (isDraft || isRejected) {
            setShowSubmitConfirm(true);
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await api.put(`/events/${id}`, {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            });
            setSuccessMessage(t('manage.savedSuccessfully') || 'Event updated successfully!');
            const response = await api.get(`/events/${id}`);
            setEvent(response.data);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || t('manage.failedToUpdate') || 'Failed to update event.');
            } else {
                setError(t('manage.failedToUpdate') || 'Failed to update event.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmSubmit = async () => {
        setShowSubmitConfirm(false);
        setIsSubmitting(true);
        setError(null);
        try {
            const formData = new FormData(document.querySelector('form') as HTMLFormElement);
            await api.put(`/events/${id}`, {
                title: formData.get('title'),
                description: formData.get('description'),
                location: formData.get('location'),
                startDate: new Date(formData.get('startDate') as string).toISOString(),
                endDate: new Date(formData.get('endDate') as string).toISOString(),
            });
            setSuccessMessage(t('manage.submittedForReview') || 'Event submitted for review!');
            const response = await api.get(`/events/${id}`);
            setEvent(response.data);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || t('manage.failedToUpdate') || 'Failed to update event.');
            } else {
                setError(t('manage.failedToUpdate') || 'Failed to update event.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onAddTicketType = async (data: AddTicketTypeForm) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await api.post(`/events/${id}/ticket-types`, data);
            setSuccessMessage(t('manage.ticketAdded') || 'Ticket type added successfully!');
            setShowTicketForm(false);
            resetTicketForm();
            const response = await api.get(`/events/${id}`);
            setEvent(response.data);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || t('manage.failedToAddTicket') || 'Failed to add ticket type.');
            } else {
                setError(t('manage.failedToAddTicket') || 'Failed to add ticket type.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await api.post(`/events/${id}/publish`);
            setSuccessMessage(t('manage.publishedSuccessfully') || 'Event published successfully!');
            const response = await api.get(`/events/${id}`);
            setEvent(response.data);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || t('manage.failedToPublish') || 'Failed to publish event.');
            } else {
                setError(t('manage.failedToPublish') || 'Failed to publish event.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!window.confirm(t('manage.cancelEventConfirm'))) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await api.post(`/events/${id}/cancel`);
            setSuccessMessage(t('manage.cancelledSuccessfully') || 'Event cancelled successfully!');
            const response = await api.get(`/events/${id}`);
            setEvent(response.data);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || t('manage.failedToCancel') || 'Failed to cancel event.');
            } else {
                setError(t('manage.failedToCancel') || 'Failed to cancel event.');
            }
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-8">
                <button
                    onClick={() => goBack('/dashboard')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('manage.back')}
                </button>

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-2 ${getStatusColor(event.status)}`}>
                            {t(`status.${event.status}`)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {isDraft && (
                            <button
                                onClick={handlePublish}
                                disabled={isSubmitting || event.ticketTypes.length === 0}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                title={event.ticketTypes.length === 0 ? 'Add at least one ticket type first' : ''}
                            >
                                {isSubmitting ? t('manage.publishing') : t('manage.publish')}
                            </button>
                        )}
                        {!isCancelled && (
                            <button
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            >
                                {t('manage.cancelEvent')}
                            </button>
                        )}
                    </div>
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

                {isRejected && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                        {t('manage.rejectedDesc')}
                    </div>
                )}

                {canEdit && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('events.aboutEvent')}</h2>
                        <form onSubmit={handleEventSubmit(onUpdateEvent)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('events.title')}</label>
                                <input
                                    {...registerEvent('title')}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {eventErrors.title && (
                                    <p className="mt-1 text-xs text-red-500">{eventErrors.title.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('events.description')}</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('events.location')}</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('events.startDate')}</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('events.endDate')}</label>
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
                                {isSubmitting ? t('manage.saving') : (isDraft || isRejected) ? t('manage.submitForReview') : t('manage.save')}
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Ticket className="w-5 h-5" />
                            {t('manage.tickets')}
                        </h2>
                        {isDraft && (
                            <button
                                onClick={() => setShowTicketForm(!showTicketForm)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                {t('manage.addTicket')}
                            </button>
                        )}
                    </div>

                    {showTicketForm && (
                        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">{t('manage.addTicket')}</h3>
                            <form onSubmit={handleTicketSubmit(onAddTicketType)} className="space-y-3">
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('manage.ticketName')}</label>
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
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('manage.ticketPrice')} ($)</label>
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
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('manage.ticketQuantity')}</label>
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
                                        {isSubmitting ? t('manage.processing') || 'Adding...' : t('manage.addTicket')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTicketForm(false);
                                            resetTicketForm();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                                    >
                                        {t('cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {event.ticketTypes.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">
                            {t('manage.noTickets')}
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {event.ticketTypes.map((tt) => (
                                <div key={tt.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{tt.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {tt.isFree ? t('free') : `$${tt.price}`} · {tt.totalQuantity - tt.availableQuantity}/{tt.totalQuantity} sold
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

            {showSubmitConfirm && (
                <ConfirmDialog
                    title={t('manage.submitForReview')}
                    message={t('manage.submitForReviewConfirm')}
                    confirmLabel={t('manage.submitForReview')}
                    onConfirm={handleConfirmSubmit}
                    onClose={() => setShowSubmitConfirm(false)}
                    isLoading={isSubmitting}
                />
            )}
        </div>
    );
}
