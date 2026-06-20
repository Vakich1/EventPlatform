using MediatR;

namespace EventPlatform.Application.Admin.Commands.RejectEvent;

public record RejectEventCommand(Guid EventId) : IRequest;
