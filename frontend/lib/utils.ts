export function formatDate(
    dateString: string,
    options?: Intl.DateTimeFormatOptions,
    showTime: boolean = false
) {
    const locale = typeof window !== 'undefined' 
        ? (localStorage.getItem('language') === 'en' ? 'en-US' : 'ru-RU')
        : 'ru-RU';
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...(showTime && { hour: '2-digit', minute: '2-digit' }),
    };

    return new Date(dateString).toLocaleDateString(locale, options ?? defaultOptions);
}

export function getStatusColor(status: string) {
    switch (status) {
        case 'Published': return 'bg-green-100 text-green-700';
        case 'Cancelled': return 'bg-red-100 text-red-700';
        case 'Completed': return 'bg-blue-100 text-blue-700';
        default: return 'bg-gray-100 text-gray-600';
    }
}

export function goBack(fallback: string = '/') {
    if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = fallback;
    }
}