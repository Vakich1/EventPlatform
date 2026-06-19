using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Enums;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Events.Commands.CreateEvent;

public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cache;
    
    public CreateEventCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService,  ICacheService cache)
    {
        _context  = context;
        _currentUserService = currentUserService;
        _cache = cache;
    }

    public async Task<Guid> Handle(CreateEventCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAdmin)
        {
            if (!_currentUserService.IsOrganizer)
                throw new ForbiddenException("Only organizers and admins can create events.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == _currentUserService.UserId, cancellationToken);
            
            if (user is null || !user.IsApprovedOrganizer)
                throw new ForbiddenException("Your organizer account has not been approved yet.");
        }
        
        var @event = Event.Create(
            request.Title,
            request.Description,
            request.Location,
            request.StartDate,
            request.EndDate,
            _currentUserService.UserId);
        
        _context.Events.Add(@event);
        await _context.SaveChangesAsync(cancellationToken);
        
        await _cache.RemoveByPatternAsync("events:list:", cancellationToken);
        
        return @event.Id;
    }
}