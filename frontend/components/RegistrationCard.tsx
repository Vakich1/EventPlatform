import Link from 'next/link';
import { Calendar, MapPin, Ticket, CheckCircle, XCircle, Clock } from 'lucide-react';
import { MyRegistration } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

interface RegistrationCardProps {
    registration: MyRegistration;
}

function getTicketStatusInfo(status: string) {
    switch (status) {
        case 'Active':
            return {
                color: 'bg-green-100 text-green-700',
                icon: <Clock className="w-3 h-3" />,
                label: 'Active'
            };
        case 'Used':
            return {
                color: 'bg-blue-100 text-blue-700',
                icon: <CheckCircle className="w-3 h-3" />,
                label: 'Used'
            };
        case 'Cancelled':
            return {
                color: 'bg-red-100 text-red-700',
                icon: <XCircle className="w-3 h-3" />,
                label: 'Cancelled'
            };
        default:
            return {
                color: 'bg-gray-100 text-gray-600',
                icon: null,
                label: status
            };
    }
}

export default function RegistrationCard({ registration }: RegistrationCardProps) {
    const ticketInfo = getTicketStatusInfo(registration.ticketStatus);

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(registration.eventStatus)}`}>
                        {registration.eventStatus}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${ticketInfo.color}`}>
                        {ticketInfo.icon}
                        {ticketInfo.label}
                    </span>
                    <h3 className="font-semibold text-gray-900">{registration.eventTitle}</h3>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(registration.eventStartDate, undefined, true)}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {registration.eventLocation}
                    </span>
                    <span className="flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        {registration.ticketTypeName} · {registration.isFree ? 'Free' : `$${registration.ticketPrice}`}
                    </span>
                </div>
            </div>

            <Link
                href={`/events/${registration.eventId}`}
                className="ml-4 text-sm text-blue-600 hover:underline flex-shrink-0"
            >
                View Event
            </Link>
        </div>
    );
}