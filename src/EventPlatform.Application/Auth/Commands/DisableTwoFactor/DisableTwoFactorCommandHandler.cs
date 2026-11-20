using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Auth.Commands.DisableTwoFactor;

public class DisableTwoFactorCommandHandler : IRequestHandler<DisableTwoFactorCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ITotpService _totpService;

    public DisableTwoFactorCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ITotpService totpService)
    {
        _context = context;
        _currentUser = currentUser;
        _totpService = totpService;
    }

    public async Task Handle(DisableTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken)
            ?? throw new DomainException("User not found.");

        if (!user.TwoFactorEnabled || string.IsNullOrWhiteSpace(user.TwoFactorSecret))
            throw new DomainException("Two-factor authentication is not enabled.");

        if (!_totpService.VerifyCode(user.TwoFactorSecret, request.Code))
            throw new DomainException("Invalid authenticator code.");

        user.DisableTwoFactor();
        await _context.SaveChangesAsync(cancellationToken);
    }
}
