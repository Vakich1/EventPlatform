using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Auth.Commands.VerifyTwoFactor;

public record VerifyTwoFactorCommand(string TwoFactorToken, string Code) : IRequest<AuthResult>;
