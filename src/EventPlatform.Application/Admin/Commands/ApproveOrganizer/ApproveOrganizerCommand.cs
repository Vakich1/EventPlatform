using MediatR;

namespace EventPlatform.Application.Admin.Commands.ApproveOrganizer;

public record ApproveOrganizerCommand(Guid UserId) : IRequest;
