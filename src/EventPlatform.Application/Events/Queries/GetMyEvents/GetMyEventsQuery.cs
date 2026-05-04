using EventPlatform.Application.Common.Models;
using EventPlatform.Application.Events.Queries.GetEvents;
using MediatR;

namespace EventPlatform.Application.Events.Queries.GetMyEvents;

public record GetMyEventsQuery(int Page = 1, int PageSize = 10) :  IRequest<PagedResult<EventSummaryDto>>;