using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Application.Common.Models;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Admin.Queries.GetPendingOrganizers;

public class GetPendingOrganizersQueryHandler : IRequestHandler<GetPendingOrganizersQuery, PagedResult<PendingOrganizerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public GetPendingOrganizersQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<PagedResult<PendingOrganizerDto>> Handle(GetPendingOrganizersQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
            throw new ForbiddenException();

        var query = _context.Users
            .AsNoTracking()
            .Where(u => u.Role == UserRole.Organizer && !u.IsApprovedOrganizer);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(u => u.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new PendingOrganizerDto(
                u.Id,
                u.Email,
                u.FullName,
                u.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<PendingOrganizerDto>(items, totalCount, request.Page, request.PageSize);
    }
}
