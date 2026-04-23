using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Events.Queries.GetEventById;

public class GetEventByIdQueryHandler : IRequestHandler<GetEventByIdQuery, EventDetailDto>
{
    private readonly IApplicationDbContext _context;
    
    public GetEventByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EventDetailDto> Handle(GetEventByIdQuery request, CancellationToken cancellationToken)
    {
        var @event = await _context.Events
            .Include(e => e.Organizer)
            .Include(e => e.TicketTypes)
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);
        
        if (@event is null)
            throw new DomainException("Event not found.");

        return new EventDetailDto(
            @event.Id,
            @event.Title,
            @event.Description,
            @event.Location,
            @event.StartDate,
            @event.EndDate,
            @event.Status.ToString(),
            @event.Organizer.FullName,
            @event.CreatedAt,
            @event.TicketTypes.Select(tt => new TicketTypeDto(
                tt.Id,
                tt.Name,
                tt.Price,
                tt.IsFree,
                tt.TotalQuantity,
                tt.AvailableQuantity)).ToList());
    }
}