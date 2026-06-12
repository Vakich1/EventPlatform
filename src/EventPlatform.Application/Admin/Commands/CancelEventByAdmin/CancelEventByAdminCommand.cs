using MediatR;

namespace EventPlatform.Application.Admin.Commands.CancelEventByAdmin;

public record CancelEventByAdminCommand(Guid EventId) : IRequest;