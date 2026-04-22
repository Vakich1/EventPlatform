using EventPlatform.Application.Common.Models;
using EventPlatform.Domain.Entities;
using MediatR;

namespace EventPlatform.Application.Auth.Commands.LoginUser;

public record LoginUserCommand(
    string Email,
    string Password) : IRequest<AuthResult>;
