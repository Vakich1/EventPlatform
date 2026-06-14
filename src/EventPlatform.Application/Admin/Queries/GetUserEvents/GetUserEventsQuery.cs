using EventPlatform.Application.Common.Models;
using EventPlatform.Application.Events.Queries.GetEvents;
using MediatR;

namespace EventPlatform.Application.Admin.Queries.GetUserEvents;

public record GetUserEventsQuery(Guid UserId, int Page = 1, int PageSize = 10) : IRequest<PagedResult<EventSummaryDto>>;
