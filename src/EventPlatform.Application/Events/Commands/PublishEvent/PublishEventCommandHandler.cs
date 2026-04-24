using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Events.Commands.PublishEvent;

public class PublishEventCommandHandler : IRequestHandler<PublishEventCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public PublishEventCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task Handle(PublishEventCommand request, CancellationToken cancellationToken)
    {
        var @event = await _context.Events
            .Include(e => e.TicketTypes)
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (@event is null)
            throw new DomainException("Event not found.");
        
        if (@event.OrganizerId != _currentUserService.UserId)
            throw new DomainException("You are not authorized to publish this event.");
        
        @event.Publish();
        
        await _context.SaveChangesAsync(cancellationToken);
    }
}