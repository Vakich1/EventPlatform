using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Registrations.Queries.GetMyRegistrations;

public class GetMyRegistrationsQueryHandler : IRequestHandler<GetMyRegistrationsQuery, PagedResult<MyRegistrationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetMyRegistrationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<MyRegistrationDto>> Handle(GetMyRegistrationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Registrations
            .AsNoTracking()
            .Where(r => r.UserId == _currentUserService.UserId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new MyRegistrationDto(
                r.Id,
                r.EventId,
                r.Event.Title,
                r.Event.Location,
                r.Event.StartDate,
                r.Event.Status.ToString(),
                r.TicketType.Name,
                r.TicketType.Price,
                r.TicketType.IsFree,
                r.Ticket.Status.ToString()))
            .ToListAsync(cancellationToken);
        
        return new PagedResult<MyRegistrationDto>(items, totalCount, request.Page, request.PageSize);
    }
}