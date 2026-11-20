using MediatR;

namespace EventPlatform.Application.Auth.Commands.EnableTwoFactor;

public record EnableTwoFactorCommand(string Code) : IRequest;
