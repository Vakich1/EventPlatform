'use client'

import { useState } from 'react';
import { X, CreditCard, Lock } from 'lucide-react';

interface PaymentModalProps {
    amount: number;
    ticketName: string;
    eventId: string;
    ticketTypeId: string;
    onSuccess: () => void;
    onClose: () => void;
}

export default function PaymentModal({
    amount,
    ticketName,
    eventId,
    ticketTypeId,
    onSuccess,
    onClose,
} : PaymentModalProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [error, setError] = useState<string | null>(null);

    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 2) {
            return digits.slice(0, 2) + '/' + digits.slice(2);
        }
        return digits;
    };

    const handleSubmit = async () => {
        setError(null);

        if (cardNumber.replace(/\s/g, '').length < 16) {
            setError('Please enter a valid card number.');
            return;
        }
        if (expiry.length < 5) {
            setError('Please enter a valid expiry date.');
            return;
        }
        if (cvc.length < 3) {
            setError('Please enter a valid CVC.');
            return;
        }

        setIsProcessing(true);

        try {
            const intentResponse = await fetch('http://localhost:5220/api/registrations/payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ eventId, ticketTypeId }),
            });

            if (!intentResponse.ok) {
                const data = await intentResponse.json();
                throw new Error(data.error || 'Failed to create payment intent.');
            }

            const { clientSecret } = await intentResponse.json();

            const confirmResponse = await fetch('http://localhost:5220/api/payments/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ clientSecret }),
            });

            if (!confirmResponse.ok) throw new Error('Payment confirmation failed.');

            onSuccess();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Payment failed. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">{ticketName}</span>
                            <span className="font-semibold text-gray-900">${amount} USD</span>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                        <p className="text-xs text-blue-700 font-medium mb-1">Test mode — use test card:</p>
                        <p className="text-xs text-blue-600 font-mono">4242 4242 4242 4242</p>
                        <p className="text-xs text-blue-600">Any future date · Any 3 digits</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Card number</label>
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                placeholder="4242 4242 4242 4242"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry date</label>
                                <input
                                    type="text"
                                    value={expiry}
                                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                    placeholder="MM/YY"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                <input
                                    type="text"
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                    placeholder="123"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Lock className="w-4 h-4" />
                        {isProcessing ? 'Processing...' : `Pay $${amount}`}
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-3">
                        Secured by Stripe · Test mode
                    </p>
                </div>
            </div>
        </div>
    );
}