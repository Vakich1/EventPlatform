using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Admin.Queries.GetUserRegistrations;

public record GetUserRegistrationsQuery(Guid UserId, int Page = 1, int PageSize = 10) : IRequest<PagedResult<AdminRegistrationDto>>;

public record AdminRegistrationDto(
    Guid RegistrationId,
    Guid EventId,
    string EventTitle,
    string TicketTypeName,
    decimal TicketPrice,
    bool IsFree,
    string TicketStatus,
    DateTime CreatedAt);
