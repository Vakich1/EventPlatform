using MediatR;

namespace EventPlatform.Application.Events.Commands.CreateEvent;

public record CreateEventCommand(
    string Title,
    string Description,
    string Location,
    DateTime StartDate,
    DateTime EndDate) : IRequest<Guid>;