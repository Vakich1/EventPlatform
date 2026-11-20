using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Auth.Commands.SetupTwoFactor;

public record SetupTwoFactorCommand : IRequest<TwoFactorSetupResult>;
