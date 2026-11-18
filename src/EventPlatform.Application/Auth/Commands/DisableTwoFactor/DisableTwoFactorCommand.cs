using MediatR;

namespace EventPlatform.Application.Auth.Commands.DisableTwoFactor;

public record DisableTwoFactorCommand(string Code) : IRequest;
