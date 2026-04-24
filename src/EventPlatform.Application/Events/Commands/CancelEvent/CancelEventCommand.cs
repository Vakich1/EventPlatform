using MediatR;

namespace EventPlatform.Application.Events.Commands.CancelEvent;

public record CancelEventCommand(Guid Id) :  IRequest;