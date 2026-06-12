using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Admin.Queries.GetStats;

public class GetStatsQueryHandler : IRequestHandler<GetStatsQuery, StatsDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetStatsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<StatsDto> Handle(GetStatsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
            throw new ForbiddenException();

        var totalUsers = await _context.Users.CountAsync(cancellationToken);
        var blockedUsers = await _context.Users.CountAsync(u => u.IsBlocked, cancellationToken);
        var totalEvents = await _context.Events.CountAsync(cancellationToken);
        var publishedEvents = await _context.Events.CountAsync(e => e.Status == EventStatus.Published, cancellationToken);
        var cancelledEvents = await _context.Events.CountAsync(e => e.Status == EventStatus.Cancelled, cancellationToken);
        var completedEvents = await _context.Events.CountAsync(e => e.Status == EventStatus.Completed, cancellationToken);
        var draftEvents = await _context.Events.CountAsync(e => e.Status == EventStatus.Draft, cancellationToken);
        var totalRegistrations = await _context.Registrations.CountAsync(cancellationToken);
        var totalRevenue = await _context.Payments
            .Where(p => p.Status == PaymentStatus.Succeeded)
            .SumAsync(p => p.Amount, cancellationToken);

        return new StatsDto(
            totalUsers,
            blockedUsers,
            totalEvents,
            publishedEvents,
            cancelledEvents,
            completedEvents,
            draftEvents,
            totalRegistrations,
            totalRevenue);
    }
}