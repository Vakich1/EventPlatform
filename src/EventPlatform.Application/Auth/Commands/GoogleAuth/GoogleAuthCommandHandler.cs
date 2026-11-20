using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Application.Common.Models;
using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Auth.Commands.GoogleAuth;

public class GoogleAuthCommandHandler : IRequestHandler<GoogleAuthCommand, AuthResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IGoogleAuthService _googleAuthService;

    public GoogleAuthCommandHandler(
        IApplicationDbContext context,
        IJwtService jwtService,
        IGoogleAuthService googleAuthService)
    {
        _context = context;
        _jwtService = jwtService;
        _googleAuthService = googleAuthService;
    }

    public async Task<AuthResult> Handle(GoogleAuthCommand request, CancellationToken cancellationToken)
    {
        var googleUser = await _googleAuthService.ValidateIdTokenAsync(request.IdToken, cancellationToken);
        var email = googleUser.Email.ToLowerInvariant().Trim();

        var user = await _context.Users.FirstOrDefaultAsync(
            u => u.GoogleSubject == googleUser.Subject || u.Email == email,
            cancellationToken);

        if (user is null)
        {
            user = User.CreateFromGoogle(email, googleUser.FirstName, googleUser.LastName, googleUser.Subject);
            _context.Users.Add(user);
        }
        else
        {
            if (user.IsBlocked)
                throw new DomainException("Your account has been blocked. Please contact support.");

            if (string.IsNullOrWhiteSpace(user.GoogleSubject))
                user.LinkGoogle(googleUser.Subject);
        }

        if (user.TwoFactorEnabled)
        {
            await _context.SaveChangesAsync(cancellationToken);
            var twoFactorToken = _jwtService.GenerateTwoFactorToken(user.Id);
            return new AuthResult(null, null, null, RequiresTwoFactor: true, TwoFactorToken: twoFactorToken);
        }

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResult(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(60));
    }
}
