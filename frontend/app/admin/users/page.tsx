'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AdminUser, PagedResult } from '@/types';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import { Search, Ban, CheckCircle, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { goBack } from '@/lib/utils';

export default function AdminUsersPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, role } = useAuth();
    const [users, setUsers] = useState<PagedResult<AdminUser> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [confirmAction, setConfirmAction] = useState<{
        type: 'block' | 'unblock';
        userId: string;
        userName: string;
    } | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.push('/auth/login');
        if (!authLoading && isAuthenticated && role !== 'Admin') {
            setError('You do not have admin access.');
            setIsLoading(false);
        }
    }, [authLoading, isAuthenticated, role, router]);

    const fetchUsers = async (search: string, page: number) => {
        setIsLoading(true);
        try {
            const response = await api.get<PagedResult<AdminUser>>('/admin/users', {
                params: { searchTerm: search || undefined, page, pageSize: 10 },
            });
            setUsers(response.data);
        } catch {
            setError('Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && role === 'Admin') {
            fetchUsers('', 1);
        }
    }, [isAuthenticated, role]);

    const handleSearch = () => {
        fetchUsers(searchTerm, 1);
    };

    const handleBlockUnblock = async () => {
        if (!confirmAction) return;
        setIsActionLoading(true);
        try {
            if (confirmAction.type === 'block') {
                await api.post(`/admin/users/${confirmAction.userId}/block`);
            } else {
                await api.post(`/admin/users/${confirmAction.userId}/unblock`);
            }
            setUsers(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: prev.items.map(u =>
                        u.id === confirmAction.userId
                            ? { ...u, isBlocked: confirmAction.type === 'block' }
                            : u
                    ),
                };
            });
            setConfirmAction(null);
        } catch {
            setError('Failed to update user.');
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
                    onClick={() => goBack('/admin')}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-2 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search by email or name..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                        <Search className="w-4 h-4" />
                        Search
                    </button>
                </div>

                {isLoading ? (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4 border-b border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-32" />
                            </div>
                        ))}
                    </div>
                ) : users?.items.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm text-gray-500">
                        No users found.
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Events</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Registrations</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.items.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.fullName}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                    user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.eventsCount}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.registrationsCount}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                    user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <Link
                                                        href={`/admin/users/${user.id}`}
                                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </Link>
                                                    {user.role !== 'Admin' && (
                                                        user.isBlocked ? (
                                                            <button
                                                                onClick={() => setConfirmAction({ type: 'unblock', userId: user.id, userName: user.fullName })}
                                                                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 cursor-pointer"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                                Unblock
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmAction({ type: 'block', userId: user.id, userName: user.fullName })}
                                                                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 cursor-pointer"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                                Block
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {users && (
                            <Pagination
                                page={users.page}
                                totalPages={users.totalPages}
                                hasNextPage={users.hasNextPage}
                                hasPreviousPage={users.hasPreviousPage}
                                onPageChange={(page) => fetchUsers(searchTerm, page)}
                            />
                        )}
                    </>
                )}
            </div>

            {confirmAction && (
                <ConfirmDialog
                    title={confirmAction.type === 'block' ? 'Block User' : 'Unblock User'}
                    message={`Are you sure you want to ${confirmAction.type} "${confirmAction.userName}"?`}
                    confirmLabel={confirmAction.type === 'block' ? 'Block' : 'Unblock'}
                    danger={confirmAction.type === 'block'}
                    onConfirm={handleBlockUnblock}
                    onClose={() => setConfirmAction(null)}
                    isLoading={isActionLoading}
                />
            )}
        </div>
    );
}
