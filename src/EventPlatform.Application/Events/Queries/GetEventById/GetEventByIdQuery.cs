using MediatR;

namespace EventPlatform.Application.Events.Queries.GetEventById;

public record GetEventByIdQuery(Guid Id) : IRequest<EventDetailDto>;