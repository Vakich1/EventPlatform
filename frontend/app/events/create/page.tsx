'use client'

import {z} from "zod";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import { goBack } from '@/lib/utils';

const createEventSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(5000),
    location: z.string().min(1, 'Location is required').max(300),
    startDate: z.string().min(1, 'Start Date is required'),
    endDate: z.string().min(1, 'End Date is required'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate),{
    message: 'End date must be after start date',
    path: ['endDate'],
});

type CreateEventForm = z.infer<typeof createEventSchema>;

export default function CreateEventPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<CreateEventForm>({
        resolver: zodResolver(createEventSchema),
    });

    const onSubmit = async (data: CreateEventForm) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post<{ id: string }>('/events', {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            });
            router.push(`/events/${response.data.id}`);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || 'Failed to create event.');
            } else
                setError('Failed to create event.');
        } finally {
            setIsLoading(false);
        }
    };

    const minDate = new Date();
    minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset());
    const minDateString = minDate.toISOString().slice(0, 16);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Event</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <input
                                {...register('title')}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="My Awesome Event"
                            />
                            {errors.title && (
                                <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                {...register('description')}
                                rows={5}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Tell people about your event..."
                            />
                            {errors.description && (
                                <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                {...register('location')}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="City, Venue or Online"
                            />
                            {errors.location && (
                                <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start date
                                </label>
                                <input
                                    {...register('startDate')}
                                    type="datetime-local"
                                    min={minDateString}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.startDate && (
                                    <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End date
                                </label>
                                <input
                                    {...register('endDate')}
                                    type="datetime-local"
                                    min={minDateString}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.endDate && (
                                    <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Creating...' : 'Create Event'}
                            </button>
                            <button
                                type="button"
                                onClick={() => goBack('/dashboard')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}