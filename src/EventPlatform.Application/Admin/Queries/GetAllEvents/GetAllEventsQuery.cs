using EventPlatform.Application.Common.Models;
using EventPlatform.Application.Events.Queries.GetEvents;
using MediatR;

namespace EventPlatform.Application.Admin.Queries.GetAllEvents;

public record GetAllEventsQuery(
    string? SearchTerm,
    string? Status,
    int Page = 1,
    int PageSize = 20) : IRequest<PagedResult<EventSummaryDto>>;