using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Events.Commands.PublishEvent;

public class PublishEventCommandHandler : IRequestHandler<PublishEventCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cache;

    public PublishEventCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService,  ICacheService cache)
    {
        _context = context;
        _currentUserService = currentUserService;
        _cache = cache;
    }

    public async Task Handle(PublishEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
        {
            if (!_currentUserService.IsOrganizer)
                throw new ForbiddenException("Only organizers and admins can publish events.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId, cancellationToken);
            
            if (user is null || !user.IsApprovedOrganizer)
                throw new ForbiddenException("Your organizer account has not been approved yet.");
        }
        
        var @event = await _context.Events
            .Include(e => e.TicketTypes)
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (@event is null)
            throw new DomainException("Event not found.");
        
        if (@event.OrganizerId != _currentUserService.UserId)
            throw new DomainException("You are not authorized to publish this event.");
        
        @event.Publish();
        
        await _context.SaveChangesAsync(cancellationToken);
        
        await _cache.RemoveByPatternAsync("events:list:", cancellationToken);
    }
}