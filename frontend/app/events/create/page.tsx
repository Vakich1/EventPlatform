'use client'

import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, MapPin, Send } from 'lucide-react';
import api from '@/lib/api';
import AppShell from '@/components/AppShell';
import EventCard from '@/components/EventCard';
import PageHeader from '@/components/ui/PageHeader';
import Stepper from '@/components/ui/Stepper';
import Alert from '@/components/ui/Alert';
import DateTimePicker from '@/components/ui/DateTimePicker';
import MapPicker from '@/components/ui/MapPicker';
import { apiError, fmt } from '@/lib/utils';
import { useTranslation } from '@/i18n';

const createEventSchema = z.object({
    title: z.string().min(1, 'ui.create.errTitle').max(200),
    description: z.string().min(1, 'ui.create.errDescription').max(5000),
    location: z.string().min(1, 'ui.create.errLocation').max(300),
    startDate: z.string().min(1, 'ui.create.errStart'),
    endDate: z.string().min(1, 'ui.create.errEnd'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'ui.create.errEndAfter',
    path: ['endDate'],
});

type CreateEventForm = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<CreateEventForm>({ resolver: zodResolver(createEventSchema) });
    const values = watch();

    const onSubmit = async (data: CreateEventForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<{ id: string }>('/events', {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            });
            router.push(`/dashboard/events/${response.data.id}/manage`);
        } catch (err) {
            setError(apiError(err, t('ui.create.failed')));
        } finally {
            setIsLoading(false);
        }
    };

    const minDate = new Date();
    minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset());
    const minDateString = minDate.toISOString().slice(0, 16);

    return (
        <AppShell kind="user">
            <Link href="/dashboard/events" className="btn btn-ghost btn-sm self-start"><ArrowLeft aria-hidden="true" />{t('ui.create.back')}</Link>
            <PageHeader title={t('ui.create.title')} subtitle={t('ui.create.subtitle')} />
            <Stepper steps={[t('ui.steps.description'), t('ui.steps.review'), t('ui.steps.tickets'), t('ui.steps.publish')]} current={0} />
            {error && <Alert tone="danger">{error}</Alert>}

            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                <form onSubmit={handleSubmit(onSubmit)} className="card flex min-w-0 flex-1 flex-col gap-5 p-6" noValidate>
                    <h2 className="text-lg font-semibold text-ink">{t('ui.create.main')}</h2>
                    <div>
                        <label className="label" htmlFor="title">{t('ui.create.name')}</label>
                        <input id="title" {...register('title')} aria-invalid={!!errors.title} className="input" placeholder={t('events.titlePlaceholder')} />
                        {errors.title && <p className="field-error">{t(errors.title.message ?? '')}</p>}
                    </div>
                    <div>
                        <label className="label" htmlFor="description">{t('ui.create.description')}</label>
                        <textarea id="description" {...register('description')} aria-invalid={!!errors.description} rows={5} className="input" placeholder={t('events.descriptionPlaceholder')} />
                        {errors.description ? <p className="field-error">{t(errors.description.message ?? '')}</p> : <p className="field-hint">{fmt(t('ui.create.chars'), { count: values.description?.length ?? 0 })}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="label" htmlFor="location">{t('ui.create.place')}</label>
                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" aria-hidden="true" />
                            <input id="location" {...register('location')} aria-invalid={!!errors.location} className="input input-with-icon" placeholder={t('events.locationPlaceholder')} />
                        </div>
                        {errors.location && <p className="field-error">{t(errors.location.message ?? '')}</p>}
                        <button type="button" className="btn btn-secondary btn-sm self-start" onClick={() => setMapOpen(true)}>
                            <MapPin aria-hidden="true" />
                            {t('ui.map.open')}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="label" htmlFor="startDate">{t('ui.create.start')}</label>
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        id="startDate"
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        min={minDateString}
                                        invalid={!!errors.startDate}
                                    />
                                )}
                            />
                            {errors.startDate && <p className="field-error">{t(errors.startDate.message ?? '')}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="endDate">{t('ui.create.end')}</label>
                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <DateTimePicker
                                        id="endDate"
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        min={values.startDate || minDateString}
                                        invalid={!!errors.endDate}
                                    />
                                )}
                            />
                            {errors.endDate && <p className="field-error">{t(errors.endDate.message ?? '')}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-1">
                        <Link href="/dashboard/events" className="btn btn-secondary">{t('cancel')}</Link>
                        <button type="submit" disabled={isLoading} className="btn btn-primary">
                            <Send aria-hidden="true" />
                            {isLoading ? t('events.creating') : t('ui.create.submit')}
                        </button>
                    </div>
                </form>

                <div className="flex w-full flex-col gap-4 xl:w-[384px] xl:shrink-0">
                    <p className="text-sm font-medium text-muted">{t('ui.create.preview')}</p>
                    <div className="pointer-events-none">
                        <EventCard
                            href="#"
                            event={{
                                id: values.title || 'preview',
                                title: values.title || t('ui.create.previewTitle'),
                                location: values.location || t('ui.create.previewPlace'),
                                startDate: values.startDate || new Date().toISOString(),
                                status: 'UnderReview',
                                organizerName: '—',
                                availableTickets: 0,
                                totalTickets: 0,
                                minPrice: null,
                            }}
                        />
                    </div>
                    <Alert tone="warning" title={t('ui.create.noteTitle')}>{t('ui.create.noteText')}</Alert>
                </div>
            </div>

            <MapPicker
                open={mapOpen}
                initialAddress={values.location}
                onClose={() => setMapOpen(false)}
                onConfirm={(address) => {
                    setValue('location', address, { shouldValidate: true });
                    setMapOpen(false);
                }}
            />
        </AppShell>
    );
}
