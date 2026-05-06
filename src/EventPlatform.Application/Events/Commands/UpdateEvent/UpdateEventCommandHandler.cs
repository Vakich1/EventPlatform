using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Events.Commands.UpdateEvent;

public class UpdateEventCommandHandler : IRequestHandler<UpdateEventCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ICacheService _cache;

    public UpdateEventCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService,  ICacheService cache)
    {
        _context = context;
        _currentUserService = currentUserService;
        _cache = cache;
    }

    public async Task Handle(UpdateEventCommand request, CancellationToken cancellationToken)
    {
        var @event = await _context.Events.FirstOrDefaultAsync(e => e.Id == request.Id,  cancellationToken);
        
        if (@event is null)
            throw new DomainException("Event not found");
        
        if (@event.OrganizerId != _currentUserService.UserId)
            throw new DomainException("You are not authorized to update event");
        
        @event.Update(
            request.Title,
            request.Description,
            request.Location,
            request.StartDate,
            request.EndDate);
        
        await _context.SaveChangesAsync(cancellationToken);
        
        await _cache.RemoveByPatternAsync("events:list:", cancellationToken);
    }
}