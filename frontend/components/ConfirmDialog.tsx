'use client'

import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onClose: () => void;
    isLoading?: boolean;
    danger?: boolean;
}

export default function ConfirmDialog({
    title,
    message,
    confirmLabel,
    onConfirm,
    onClose,
    isLoading = false,
    danger = false,
}: ConfirmDialogProps) {
    const { t } = useTranslation();
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-yellow-500'}`} />
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-6">{message}</p>

                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 cursor-pointer ${
                                danger
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isLoading ? t('dialog.processing') : (confirmLabel || t('dialog.confirm'))}
                        </button>
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
