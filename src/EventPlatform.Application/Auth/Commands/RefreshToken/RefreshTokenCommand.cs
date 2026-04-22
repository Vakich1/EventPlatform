using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResult>;