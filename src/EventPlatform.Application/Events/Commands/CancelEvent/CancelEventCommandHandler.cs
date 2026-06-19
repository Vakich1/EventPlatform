using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Events.Commands.CancelEvent;

public class CancelEventCommandHandler : IRequestHandler<CancelEventCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cache;

    public CancelEventCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService, ICacheService cache)
    {
        _context = context;
        _currentUserService = currentUserService;
        _cache = cache;
    }

    public async Task Handle(CancelEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
        {
            if (!_currentUserService.IsOrganizer)
                throw new ForbiddenException("Only organizers and admins can cancel events.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId, cancellationToken);
            
            if (user is null || !user.IsApprovedOrganizer)
                throw new ForbiddenException("Your organizer account has not been approved yet.");
        }
        
        var @event = await _context.Events.FirstOrDefaultAsync(e => e.Id == request.Id ,cancellationToken);
        
        if (@event is null)
            throw new DomainException("Event not found");

        if (@event.OrganizerId != _currentUserService.UserId)
            throw new DomainException("You are not authorized to cancel this event.");

        @event.Cancel();
        
        var tickets = await _context.Tickets
            .Include(t => t.Registration)
            .Where(t => t.Registration.EventId == request.Id && t.Status == Domain.Enums.TicketStatus.Active)
            .ToListAsync(cancellationToken);

        foreach (var ticket in tickets)
        {
            ticket.Cancel();
        }
        
        await _context.SaveChangesAsync(cancellationToken);
        
        await _cache.RemoveByPatternAsync("events:list:", cancellationToken);
    }
}