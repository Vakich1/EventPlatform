using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Events.Queries.GetEvents;

public record GetEventsQuery(
    string? SearchTerm,
    int Page = 1,
    int PageSize = 10) : IRequest<PagedResult<EventSummaryDto>>;