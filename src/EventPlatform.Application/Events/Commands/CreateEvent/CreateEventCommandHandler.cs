using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Entities;
using MediatR;

namespace EventPlatform.Application.Events.Commands.CreateEvent;

public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    
    public CreateEventCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context  = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateEventCommand request, CancellationToken cancellationToken)
    {
        var @event = Event.Create(
            request.Title,
            request.Description,
            request.Location,
            request.StartDate,
            request.EndDate,
            _currentUserService.UserId);
        
        _context.Events.Add(@event);
        await _context.SaveChangesAsync(cancellationToken);
        
        return @event.Id;
    }
}