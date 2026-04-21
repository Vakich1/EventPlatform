using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Application.Common.Models;
using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Auth.Commands.RegisterUser;

public class RegisterUserCommandHandler : IRequestHandler<RegisterUserCommand, AuthResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtService _jwtService;

    public RegisterUserCommandHandler(IApplicationDbContext context, IJwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    public async Task<AuthResult> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        var userExists = await _context.Users.
            AnyAsync(u => u.Email == request.Email.ToLowerInvariant().Trim(), cancellationToken);

        if (userExists)
            throw new DomainException("User with this email already exists.");
        
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = User.Create(request.Email, passwordHash, request.FirstName, request.LastName);
        
        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        var refreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);
        user.SetRefreshToken(refreshToken, refreshTokenExpiresAt);
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);
        
        
        return new AuthResult(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(60));
    }
}