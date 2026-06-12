using MediatR;

namespace EventPlatform.Application.Admin.Commands.BlockUser;

public record BlockUserCommand(Guid UserId) : IRequest;