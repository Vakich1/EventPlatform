using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Admin.Commands.CancelRegistration;

public class CancelRegistrationByAdminCommandHandler : IRequestHandler<CancelRegistrationByAdminCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CancelRegistrationByAdminCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(CancelRegistrationByAdminCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
            throw new ForbiddenException();

        var registration = await _context.Registrations
            .Include(r => r.Ticket)
            .Include(r => r.TicketType)
            .FirstOrDefaultAsync(r => r.Id == request.RegistrationId, cancellationToken);

        if (registration is null)
            throw new DomainException("Registration not found.");

        if (registration.Ticket is not null)
        {
            if (registration.Ticket.Status == TicketStatus.Used)
                throw new DomainException("Cannot cancel a registration with a used ticket.");

            registration.Ticket.Cancel();
        }

        registration.TicketType.DecrementSold();

        await _context.SaveChangesAsync(cancellationToken);
    }
}
