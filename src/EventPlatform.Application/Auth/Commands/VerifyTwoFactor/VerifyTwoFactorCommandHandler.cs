using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Application.Common.Models;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Auth.Commands.VerifyTwoFactor;

public class VerifyTwoFactorCommandHandler : IRequestHandler<VerifyTwoFactorCommand, AuthResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly ITotpService _totpService;

    public VerifyTwoFactorCommandHandler(
        IApplicationDbContext context,
        IJwtService jwtService,
        ITotpService totpService)
    {
        _context = context;
        _jwtService = jwtService;
        _totpService = totpService;
    }

    public async Task<AuthResult> Handle(VerifyTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var userId = _jwtService.ValidateTwoFactorToken(request.TwoFactorToken)
            ?? throw new DomainException("Invalid or expired two-factor token.");

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken)
            ?? throw new DomainException("User not found.");

        if (user.IsBlocked)
            throw new DomainException("Your account has been blocked. Please contact support.");

        if (!user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.TwoFactorSecret))
            throw new DomainException("Two-factor authentication is not enabled.");

        if (!_totpService.VerifyCode(user.TwoFactorSecret, request.Code))
            throw new DomainException("Invalid authenticator code.");

        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();
        user.SetRefreshToken(refreshToken, DateTime.UtcNow.AddDays(7));
        await _context.SaveChangesAsync(cancellationToken);

        return new AuthResult(accessToken, refreshToken, DateTime.UtcNow.AddMinutes(60));
    }
}
