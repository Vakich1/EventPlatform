using EventPlatform.Application.Common.Interfaces;
using EventPlatform.Domain.Entities;
using EventPlatform.Domain.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EventPlatform.Application.Events.Commands.AddTicketType;

public class AddTicketTypeCommandHandler : IRequestHandler<AddTicketTypeCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AddTicketTypeCommandHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(AddTicketTypeCommand request, CancellationToken cancellationToken)
    {
        var @event = await _context.Events
            .FirstOrDefaultAsync(e => e.Id == request.EventId, cancellationToken);

        if (@event is null)
            throw new DomainException("Event not found.");
        
        if (@event.OrganizerId != _currentUserService.UserId)
            throw new DomainException("You are not authorized to modify this event.");

        if (@event.Status != Domain.Enums.EventStatus.Draft)
            throw new DomainException("Ticket types can only be added to draft events.");

        var ticketType = TicketType.Create(
            request.Name,
            request.Price,
            request.TotalQuantity,
            request.EventId);
        
        _context.TicketTypes.Add(ticketType);
        await _context.SaveChangesAsync(cancellationToken);
        
        return ticketType.Id;
    }
}