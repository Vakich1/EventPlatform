using MediatR;

namespace EventPlatform.Application.Admin.Commands.RejectOrganizer;

public record RejectOrganizerCommand(Guid UserId) : IRequest;
