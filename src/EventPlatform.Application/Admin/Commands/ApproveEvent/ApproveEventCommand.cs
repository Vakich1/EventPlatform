using MediatR;

namespace EventPlatform.Application.Admin.Commands.ApproveEvent;

public record ApproveEventCommand(Guid EventId) : IRequest;
