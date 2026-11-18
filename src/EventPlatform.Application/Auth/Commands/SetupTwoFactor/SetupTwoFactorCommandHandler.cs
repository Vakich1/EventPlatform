using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Application.Common.Models;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Auth.Commands.SetupTwoFactor;

public class SetupTwoFactorCommandHandler : IRequestHandler<SetupTwoFactorCommand, TwoFactorSetupResult>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ITotpService _totpService;

    public SetupTwoFactorCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ITotpService totpService)
    {
        _context = context;
        _currentUser = currentUser;
        _totpService = totpService;
    }

    public async Task<TwoFactorSetupResult> Handle(SetupTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken)
            ?? throw new DomainException("User not found.");

        if (user.TwoFactorEnabled)
            return new TwoFactorSetupResult(string.Empty, string.Empty, true);

        var secret = _totpService.GenerateSecret();
        user.SetTwoFactorSecret(secret);
        await _context.SaveChangesAsync(cancellationToken);

        return new TwoFactorSetupResult(secret, _totpService.GetAuthenticatorUri(user.Email, secret), false);
    }
}
