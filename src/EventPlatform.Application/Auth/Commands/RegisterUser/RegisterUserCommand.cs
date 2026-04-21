using EventPlatform.Application.Common.Models;
using MediatR;

namespace EventPlatform.Application.Auth.Commands.RegisterUser;

public record RegisterUserCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName) : IRequest<AuthResult>;