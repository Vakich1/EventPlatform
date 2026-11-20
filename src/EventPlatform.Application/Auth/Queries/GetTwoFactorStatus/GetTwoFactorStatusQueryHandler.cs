using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Auth.Queries.GetTwoFactorStatus;

public class GetTwoFactorStatusQueryHandler : IRequestHandler<GetTwoFactorStatusQuery, TwoFactorStatusDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetTwoFactorStatusQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<TwoFactorStatusDto> Handle(GetTwoFactorStatusQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId, cancellationToken)
            ?? throw new DomainException("User not found.");

        return new TwoFactorStatusDto(user.TwoFactorEnabled);
    }
}
