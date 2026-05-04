export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions) {
    return new Date(dateString).toLocaleDateString('en-US', options ?? {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function getStatusColor(status: string) {
    switch (status) {
        case 'Published': return 'bg-green-100 text-green-700';
        case 'Cancelled': return 'bg-red-100 text-red-700';
        case 'Completed': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-600';
    }
}