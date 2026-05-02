export interface AuthResult {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
}

export interface EventSummary {
    id: string;
    title: string;
    location: string;
    startDate: string;
    status: string;
    organizerName: string;
    availableTickets: number;
}

export interface TicketType {
    id: string;
    name: string;
    price: number;
    isFree: boolean;
    totalQuantity: number;
    availableQuantity: number;
}

export interface EventDetail {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: string;
    endDate: string;
    status: string;
    organizerName: string;
    createdAt: string;
    ticketTypes: TicketType[];
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}