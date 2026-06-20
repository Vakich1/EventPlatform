using EventPlatform.Application.Common.Models;
using EventPlatform.Application.Events.Queries.GetEvents;
using MediatR;

namespace EventPlatform.Application.Admin.Queries.GetPendingEvents;

public record GetPendingEventsQuery(
    string? SearchTerm,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<EventSummaryDto>>;
