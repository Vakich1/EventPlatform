import Link from 'next/link';
import { Calendar, MapPin, Ticket, Settings } from 'lucide-react';
import { EventSummary } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useTranslation } from '@/i18n';

interface DashboardEventCardProps {
    event: EventSummary;
}

export default function DashboardEventCard({ event }: DashboardEventCardProps) {
    const { t } = useTranslation();
    
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                        {t(`status.${event.status}`)}
                    </span>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.startDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                        <Ticket className="w-3 h-3" />
                        {event.availableTickets} {t('events.ticketsAvailable')}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
                <Link
                    href={`/events/${event.id}`}
                    className="text-sm text-blue-600 hover:underline"
                >
                    {t('events.view')}
                </Link>
                <Link
                    href={`/dashboard/events/${event.id}/manage`}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50"
                >
                    <Settings className="w-3 h-3" />
                    {t('events.manage')}
                </Link>
            </div>
        </div>
    );
}
