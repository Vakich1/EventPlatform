using MediatR;

namespace EventPlatform.Application.Events.Commands.UpdateEvent;

public record UpdateEventCommand(
    Guid Id,
    string Title,
    string Description,
    string Location,
    DateTime StartDate,
    DateTime EndDate) :  IRequest;