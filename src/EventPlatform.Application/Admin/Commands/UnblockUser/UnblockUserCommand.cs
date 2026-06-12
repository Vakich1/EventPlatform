using MediatR;

namespace EventPlatform.Application.Admin.Commands.UnblockUser;

public record UnblockUserCommand(Guid UserId) : IRequest;