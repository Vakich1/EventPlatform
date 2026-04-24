using MediatR;

namespace EventPlatform.Application.Events.Commands.PublishEvent;

public record PublishEventCommand(Guid Id) : IRequest;