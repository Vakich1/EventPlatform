using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Auth.Commands.EnableTwoFactor;

public class EnableTwoFactorCommandHandler : IRequestHandler<EnableTwoFactorCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ITotpService _totpService;

    public EnableTwoFactorCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ITotpService totpService)
    {
        _context = context;
        _currentUser = currentUser;
        _totpService = totpService;
    }

    public async Task Handle(EnableTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken)
            ?? throw new DomainException("User not found.");

        if (string.IsNullOrWhiteSpace(user.TwoFactorSecret))
            throw new DomainException("Run two-factor setup first.");

        if (!_totpService.VerifyCode(user.TwoFactorSecret, request.Code))
            throw new DomainException("Invalid authenticator code.");

        user.EnableTwoFactor();
        await _context.SaveChangesAsync(cancellationToken);
    }
}
