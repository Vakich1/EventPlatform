using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Admin.Commands.ApproveOrganizer;

public class ApproveOrganizerCommandHandler : IRequestHandler<ApproveOrganizerCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ApproveOrganizerCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(ApproveOrganizerCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
            throw new ForbiddenException();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user is null)
            throw new DomainException("User not found.");

        user.ApproveAsOrganizer();

        await _context.SaveChangesAsync(cancellationToken);
    }
}
