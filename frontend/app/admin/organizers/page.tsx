'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PendingOrganizer, PagedResult } from '@/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function AdminOrganizersPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();
    const { t } = useTranslation();
    const [organizers, setOrganizers] = useState<PagedResult<PendingOrganizer> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [confirmAction, setConfirmAction] = useState<{
        type: 'approve' | 'reject';
        userId: string;
        userName: string;
    } | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
        if (!authLoading && isAuthenticated && role !== 'Admin') {
            setError(t('errors.unauthorized'));
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, role, router]);

    const fetchOrganizers = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await api.get<PagedResult<PendingOrganizer>>('/admin/organizers/pending', {
                params: { page, pageSize: 10 },
            });
            setOrganizers(response.data);
        } catch {
            setError('Failed to load pending organizers.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && role === 'Admin') {
            fetchOrganizers(1);
        }
    }, [isAuthenticated, role]);

    const handleAction = async () => {
        if (!confirmAction) return;
        setIsActionLoading(true);
        try {
            if (confirmAction.type === 'approve') {
                await api.post(`/admin/organizers/${confirmAction.userId}/approve`);
            } else {
                await api.post(`/admin/organizers/${confirmAction.userId}/reject`);
            }
            setOrganizers(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: prev.items.filter(o => o.id !== confirmAction.userId),
                    totalCount: prev.totalCount - 1,
                };
            });
            setConfirmAction(null);
        } catch {
            setError('Failed to process request.');
        } finally {
            setIsActionLoading(false);
        }
    };

    if (authLoading || (!isAuthenticated && !error)) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('back')}
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{t('admin.pendingOrganizerApprovals')}</h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4 border-b border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                ) : organizers?.items.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                        <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">{t('admin.noPendingOrganizers')}</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Registered</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizers?.items.map((org) => (
                                        <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{org.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{org.fullName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(org.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() => setConfirmAction({ type: 'approve', userId: org.id, userName: org.fullName })}
                                                        className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 cursor-pointer"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        {t('admin.approve')}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmAction({ type: 'reject', userId: org.id, userName: org.fullName })}
                                                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 cursor-pointer"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        {t('admin.reject')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {organizers && (
                            <Pagination
                                page={organizers.page}
                                totalPages={organizers.totalPages}
                                hasNextPage={organizers.hasNextPage}
                                hasPreviousPage={organizers.hasPreviousPage}
                                onPageChange={fetchOrganizers}
                            />
                        )}
                    </>
                )}
            </div>

            {confirmAction && (
                <ConfirmDialog
                    title={confirmAction.type === 'approve' ? t('admin.approveOrganizer') : t('admin.rejectOrganizer')}
                    message={confirmAction.type === 'approve'
                        ? t('admin.approveConfirm').replace('{{name}}', confirmAction.userName)
                        : t('admin.rejectConfirm').replace('{{name}}', confirmAction.userName)
                    }
                    confirmLabel={confirmAction.type === 'approve' ? t('admin.approve') : t('admin.reject')}
                    danger={confirmAction.type === 'reject'}
                    onConfirm={handleAction}
                    onClose={() => setConfirmAction(null)}
                    isLoading={isActionLoading}
                />
            )}
        </div>
    );
}
