using MediatR;

namespace EventPlatform.Application.Admin.Queries.GetStats;

public record GetStatsQuery : IRequest<StatsDto>;

public record StatsDto(
    int TotalUsers,
    int BlockedUsers,
    int TotalEvents,
    int PublishedEvents,
    int CancelledEvents,
    int CompletedEvents,
    int DraftEvents,
    int TotalRegistrations,
    decimal TotalRevenue);