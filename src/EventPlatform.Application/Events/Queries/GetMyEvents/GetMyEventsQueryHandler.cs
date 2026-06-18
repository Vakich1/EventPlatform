using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Application.Common.Models;
using EventPlatform.Application.Events.Queries.GetEvents;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Events.Queries.GetMyEvents;

public class GetMyEventsQueryHandler : IRequestHandler<GetMyEventsQuery, PagedResult<EventSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMyEventsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<EventSummaryDto>> Handle(GetMyEventsQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsOrganizer && !_currentUserService.IsAdmin)
            throw new ForbiddenException("Only organizers and admins can view their events.");
        
        var query = _context.Events
            .Include(e => e.Organizer)
            .Include(e => e.TicketTypes)
            .AsNoTracking()
            .Where(e => e.OrganizerId == _currentUserService.UserId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new EventSummaryDto(
                e.Id,
                e.Title,
                e.Location,
                e.StartDate,
                e.Status.ToString(),
                e.Organizer.FullName,
                e.TicketTypes.Sum(tt => tt.TotalQuantity - tt.SoldQuantity)))
            .ToListAsync(cancellationToken);
        
        return new PagedResult<EventSummaryDto>(items, totalCount, request.Page, request.PageSize);
    }
}