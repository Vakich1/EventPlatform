'use client'

import { z } from 'zod';
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation';
import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Link from "next/link";

const registerSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        setError(null);
        try {
            await registerUser(data.email, data.password, data.firstName, data.lastName);
            router.push('/');
        } catch {
            setError('Registration failed. Email may already be in use.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create account</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First name
                            </label>
                            <input
                                {...register('firstName')}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="John"
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last name
                            </label>
                            <input
                                {...register('lastName')}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Doe"
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            {...register('email')}
                            type="email"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="you@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            {...register('password')}
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm password
                        </label>
                        <input
                            {...register('confirmPassword')}
                            type="password"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {/* Тернарный оператор — если isLoading показываем один текст, иначе другой */}
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="mt-4 text-sm text-gray-600 text-center">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}