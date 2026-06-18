using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Admin.Queries.GetPendingOrganizers;

public record GetPendingOrganizersQuery(int Page = 1, int PageSize = 20) : IRequest<PagedResult<PendingOrganizerDto>>;

public record PendingOrganizerDto(
    Guid Id,
    string Email,
    string FullName,
    DateTime CreatedAt);
