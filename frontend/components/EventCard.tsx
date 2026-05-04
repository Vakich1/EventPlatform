import Link from 'next/link';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { EventSummary } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';

interface EventCardProps {
    event: EventSummary;
}

export default function EventCard({ event }: EventCardProps) {
    return (
        <Link href={`/events/${event.id}`}>
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer h-full">
                <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-3 ${getStatusColor(event.status)}`}>
                    {event.status}
                </span>

                <h3 className="font-semibold text-gray-900 mb-3 text-lg leading-tight">
                    {event.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 flex-shrink-0" />
                        <span>{event.availableTickets} tickets available</span>
                    </div>
                </div>

                <p className="mt-3 text-xs text-gray-400">by {event.organizerName}</p>
            </div>
        </Link>
    );
}