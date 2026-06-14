using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Application.Common.Models;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Admin.Queries.GetUserRegistrations;

public class GetUserRegistrationsQueryHandler : IRequestHandler<GetUserRegistrationsQuery, PagedResult<AdminRegistrationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetUserRegistrationsQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<AdminRegistrationDto>> Handle(GetUserRegistrationsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
            throw new ForbiddenException();

        var query = _context.Registrations
            .AsNoTracking()
            .Where(r => r.UserId == request.UserId);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new AdminRegistrationDto(
                r.Id,
                r.EventId,
                r.Event.Title,
                r.TicketType.Name,
                r.TicketType.Price,
                r.TicketType.IsFree,
                r.Ticket != null ? r.Ticket.Status.ToString() : "No Ticket",
                r.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdminRegistrationDto>(items, totalCount, request.Page, request.PageSize);
    }
}
