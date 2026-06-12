using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Admin.Commands.CancelEventByAdmin;

public class CancelEventByAdminCommandHandler : IRequestHandler<CancelEventByAdminCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public CancelEventByAdminCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(CancelEventByAdminCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
            throw new ForbiddenException();

        var @event = await _context.Events
            .FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);

        if (@event is null)
            throw new DomainException("Event not found.");

        var tickets = await _context.Tickets
            .Include(t => t.Registration)
            .Where(t => t.Registration.EventId == request.EventId
                        && t.Status == Domain.Enums.TicketStatus.Active)
            .ToListAsync(cancellationToken);

        foreach (var ticket in tickets)
            ticket.Cancel();

        @event.Cancel();

        await _context.SaveChangesAsync(cancellationToken);
    }
}