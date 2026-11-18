using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Auth.Commands.GoogleAuth;

public record GoogleAuthCommand(string IdToken) : IRequest<AuthResult>;
